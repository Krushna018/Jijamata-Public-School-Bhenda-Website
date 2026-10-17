// ===== HERO CAROUSEL =====
class HeroCarousel {
    constructor() {
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.getElementById('prevSlide');
        this.nextBtn = document.getElementById('nextSlide');
        this.currentSlide = 0;
        this.autoSlideInterval = null;
        this.isPaused = false;

        if (!this.slides.length || !this.indicators.length || !this.prevBtn || !this.nextBtn) {
            return;
        }

        this.init();
    }
    
    init() {
        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Start auto-slide
        this.startAutoSlide();
        
        // Pause on hover
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => this.pauseAutoSlide());
            heroSection.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    }
    
    goToSlide(index) {
        // Remove active class from current slide and indicator
        this.slides[this.currentSlide].classList.remove('active');
        this.indicators[this.currentSlide].classList.remove('active');
        
        // Update current slide
        this.currentSlide = index;
        
        // Add active class to new slide and indicator
        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide].classList.add('active');
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    startAutoSlide() {
        if (this.autoSlideInterval) return;
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
    
    pauseAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// ===== MOBILE MENU (Side Drawer Reference: Sanjivani COE Style) =====
class MobileMenu {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.dropdowns = document.querySelectorAll('.dropdown');
        this.backdrop = document.getElementById('mobileMenuBackdrop');
        this.drawerClose = document.getElementById('mobileDrawerClose');

        if (!this.hamburger || !this.navMenu) {
            return;
        }

        // Dynamically create backdrop if not present
        if (!this.backdrop) {
            this.backdrop = document.createElement('div');
            this.backdrop.id = 'mobileMenuBackdrop';
            this.backdrop.className = 'mobile-menu-backdrop';
            document.body.appendChild(this.backdrop);
        }
        
        this.init();
    }
    
    init() {
        // Toggle mobile menu via hamburger
        this.hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });
        
        // Close via drawer close button
        if (this.drawerClose) {
            this.drawerClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeMenu();
            });
        }

        // Close via backdrop click
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.closeMenu());
        }

        // Handle dropdowns on mobile (Accordion style)
        this.dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('.nav-link');
            if (link) {
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        const isAlreadyActive = dropdown.classList.contains('active');
                        // Close other dropdowns for clean accordion behavior
                        this.dropdowns.forEach(other => {
                            if (other !== dropdown) other.classList.remove('active');
                        });
                        dropdown.classList.toggle('active', !isAlreadyActive);
                    }
                });
            }
        });
        
        // Close menu when clicking regular leaf links
        const leafLinks = this.navMenu.querySelectorAll('.nav-links > li:not(.dropdown) > a, .dropdown-menu a');
        leafLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMenu();
                }
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
            }
        });

        // Mobile drawer search form handling
        const mobileSearchForm = document.getElementById('mobileSearchForm');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        if (mobileSearchForm && mobileSearchInput) {
            mobileSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = mobileSearchInput.value.trim();
                if (query) {
                    this.closeMenu();
                    const searchModal = document.getElementById('searchModal');
                    const searchInput = document.getElementById('searchInput');
                    if (searchModal && searchInput) {
                        searchModal.classList.add('active');
                        searchInput.value = query;
                        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                        document.body.style.overflow = 'hidden';
                    }
                }
            });
        }
    }
    
    toggleMenu() {
        if (this.navMenu.classList.contains('active')) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.navMenu.classList.add('active');
        if (this.hamburger) this.hamburger.classList.add('active');
        document.body.classList.add('mobile-menu-open');
        document.body.style.overflow = 'hidden';
    }
    
    closeMenu() {
        this.navMenu.classList.remove('active');
        if (this.hamburger) this.hamburger.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
        document.body.style.overflow = '';
    }
}

// ===== SEARCH MODAL =====
class SearchModal {
    constructor() {
        this.searchBtn = document.getElementById('searchBtn');
        let searchModal = document.getElementById('searchModal');

        // Dynamically inject search modal if not present on current page
        if (!searchModal && this.searchBtn) {
            const modalEl = document.createElement('div');
            modalEl.className = 'search-modal';
            modalEl.id = 'searchModal';
            modalEl.innerHTML = `
                <div class="search-overlay" id="searchOverlay"></div>
                <div class="search-content">
                    <button class="search-close" id="searchClose" aria-label="Close search">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="search-box">
                        <div class="search-input-wrap">
                            <i class="fas fa-search search-input-icon"></i>
                            <input type="text" id="searchInput" placeholder="Search fees, admissions, hostel, classes..." autocomplete="off">
                            <button type="button" class="search-clear-btn" id="searchClearBtn" aria-label="Clear search">
                                <i class="fas fa-times-circle"></i>
                            </button>
                        </div>
                        <button class="search-submit" type="button" aria-label="Submit search">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                    <div class="search-results" id="searchResults"></div>
                </div>
            `;
            document.body.appendChild(modalEl);
            searchModal = modalEl;
        }

        this.searchModal = searchModal;
        this.searchOverlay = document.getElementById('searchOverlay');
        this.searchClose = document.getElementById('searchClose');
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchSubmit = this.searchModal ? this.searchModal.querySelector('.search-submit') : null;

        if (!this.searchBtn || !this.searchModal || !this.searchInput || !this.searchResults) {
            return;
        }

        // Enhance search box markup if not already wrapped
        this.enhanceSearchBox();

        this.selectedIndex = -1;

        // Comprehensive search dataset for Jijamata Public School
        this.searchData = [
            // Fees & Finance
            {
                title: 'School Fee Structure (KG to 10th)',
                category: 'Admissions',
                icon: 'fa-file-invoice-dollar',
                url: 'admissions.html#fee-structure',
                description: 'Annual fee details from KG (₹11,000) to 10th standard (₹20,000)',
                keywords: ['fee', 'fees', 'fee structure', 'annual fee', 'tuition fee', 'school fee', 'fees detail', 'cost', 'charge', 'installment', 'kg fees', '10th fees', 'payment', 'structure']
            },
            {
                title: 'Student Fee Portal & Online Payment (My Fees)',
                category: 'Student Portal',
                icon: 'fa-credit-card',
                url: 'sections/fees.html',
                description: 'Check fee payment status, installment receipts, breakdown & online payment details',
                keywords: ['fee', 'fees', 'pay fee', 'fee status', 'fee breakdown', 'tuition fee', 'lab fee', 'installment', 'pending fee', 'receipt', 'online fee']
            },
            {
                title: 'Admission Process & Fee Payment Step',
                category: 'Admissions',
                icon: 'fa-clipboard-check',
                url: 'admissions.html#process',
                description: '5-step admission procedure: Enquiry, Form submission, Verification, Confirmation & Fee payment',
                keywords: ['admission process', 'fee payment', 'how to apply', 'registration', 'steps', 'admission procedure', 'verification', 'fee step']
            },
            {
                title: 'Government Admission Schemes (RTE 25% & Holkar Scheme)',
                category: 'Schemes',
                icon: 'fa-award',
                url: 'schemes.html',
                description: 'Free admission under RTE 25% quota and Punyashlok Ahilyadevi Holkar scheme with fee concessions',
                keywords: ['rte', 'rte 25', 'free admission', 'schemes', 'holkar', 'punyashlok ahilyadevi holkar', 'scholarship', 'fee concession', 'fee waiver', 'girls free education', 'government scholarship', 'fee']
            },
            {
                title: 'Hostel & Boarding Facilities (Hostel Fees & Mess)',
                category: 'Facilities',
                icon: 'fa-hotel',
                url: 'hostel.html',
                description: 'Residential hostel facilities, clean dining mess, study rooms, 24/7 security & hostel fees details',
                keywords: ['hostel', 'boarding', 'residential', 'hostel fee', 'mess', 'rooms', 'accommodation', 'hostel facility', 'staying', 'food', 'hostel fees']
            },

            // Admissions
            {
                title: 'Pre-Primary Admission (LKG & UKG)',
                category: 'Admissions',
                icon: 'fa-child',
                url: 'admissions.html#preprimary',
                description: 'Admissions open for LKG & UKG classes (Age criteria 3.5 to 5.5 years)',
                keywords: ['lkg', 'ukg', 'pre-primary', 'kindergarten', 'nursery', 'junior kg', 'senior kg', 'early years', 'admissions']
            },
            {
                title: 'Primary & Middle School Admission (1st to 8th Std)',
                category: 'Admissions',
                icon: 'fa-pencil-alt',
                url: 'admissions.html#primary',
                description: 'Fresh & transfer admissions for Classes 1st through 8th Standard',
                keywords: ['primary', 'middle', '1st std', '2nd std', '3rd std', '4th std', '5th std', '6th std', '7th std', '8th std', 'elementary', 'transfer', 'tc']
            },
            {
                title: 'Secondary School Admission (9th & 10th Std)',
                category: 'Admissions',
                icon: 'fa-user-graduate',
                url: 'admissions.html#secondary',
                description: 'Maharashtra State Board (MSBSHSE) SSC curriculum admissions for Classes 9th & 10th',
                keywords: ['secondary', 'high school', '9th std', '10th std', 'ssc', 'board exam', 'maharashtra board', 'msbshse']
            },
            {
                title: 'Admissions Overview & WhatsApp Desk',
                category: 'Admissions',
                icon: 'fa-file-signature',
                url: 'admissions.html',
                description: 'General admission guidelines, required documents, eligibility & instant WhatsApp assistance',
                keywords: ['admission', 'admissions', 'apply now', 'enquiry', 'whatsapp admission', 'contact admission', 'admission form']
            },

            // Academics & Curriculum
            {
                title: 'Academics & Subject Curriculum',
                category: 'Academics',
                icon: 'fa-book-open',
                url: 'academics.html#courses',
                description: 'Syllabus, subjects, English Medium curriculum & interactive teaching methodologies',
                keywords: ['academics', 'curriculum', 'subjects', 'syllabus', 'courses', 'english medium', 'marathi', 'science', 'maths']
            },
            {
                title: 'Academic Calendar & Schedule',
                category: 'Academics',
                icon: 'fa-calendar-alt',
                url: 'academics.html#calendar',
                description: 'Yearly academic calendar, examination schedule, vacations & school holidays',
                keywords: ['academic calendar', 'calendar', 'holidays', 'vacation', 'exam dates', 'schedule', 'timetable']
            },
            {
                title: 'Examinations & Evaluation System',
                category: 'Academics',
                icon: 'fa-graduation-cap',
                url: 'academics.html#examination',
                description: 'Continuous comprehensive evaluation, unit tests, semester exams & grading structure',
                keywords: ['examination', 'exams', 'unit test', 'semester', 'evaluation', 'results', 'marks', 'grading']
            },
            {
                title: 'Academic Sections & Divisions',
                category: 'Departments',
                icon: 'fa-layer-group',
                url: 'departments.html',
                description: 'Overview of Pre-Primary, Primary, Middle School & Secondary school divisions',
                keywords: ['departments', 'sections', 'pre-primary', 'primary', 'middle', 'secondary']
            },

            // Campus Facilities
            {
                title: 'Campus Facilities & Infrastructure',
                category: 'Facilities',
                icon: 'fa-building',
                url: 'facilities.html',
                description: 'Digital smart classrooms, science labs, computer lab, library & campus amenities',
                keywords: ['facilities', 'campus', 'infrastructure', 'smart classroom', 'computer lab', 'science lab', 'library', 'playground']
            },

            // Activities & Sports
            {
                title: 'Sports & Athletics Ground',
                category: 'Activities',
                icon: 'fa-running',
                url: 'sports-athletics.html',
                description: 'Outdoor sports ground, Kabaddi, Kho-Kho, Cricket, athletics & physical education',
                keywords: ['sports', 'athletics', 'games', 'physical education', 'kabaddi', 'cricket', 'kho-kho', 'ground', 'fitness']
            },
            {
                title: 'Cultural Events & Annual Gathering',
                category: 'Activities',
                icon: 'fa-theater-masks',
                url: 'cultural-events.html',
                description: 'Annual day gathering, drama, traditional dance, musical performance & celebrations',
                keywords: ['cultural', 'cultural events', 'annual gathering', 'annual day', 'gathering', 'dance', 'drama', 'music', 'celebration']
            },
            {
                title: 'Science Exhibition & Project Fair',
                category: 'Activities',
                icon: 'fa-flask',
                url: 'science-exhibition.html',
                description: 'Student science models, innovative experiments, scientific exhibits & demonstrations',
                keywords: ['science exhibition', 'science fair', 'projects', 'models', 'experiments', 'innovation', 'robotics']
            },
            {
                title: 'Art, Craft & Creative Workshops',
                category: 'Activities',
                icon: 'fa-palette',
                url: 'art-craft.html',
                description: 'Creative arts, drawing, sketching, handicraft, origami & student art exhibitions',
                keywords: ['art', 'craft', 'drawing', 'painting', 'sketching', 'handicraft', 'origami', 'creative']
            },
            {
                title: 'School Activities & Co-Curricular Programs',
                category: 'Activities',
                icon: 'fa-shapes',
                url: 'activities.html',
                description: 'Comprehensive student activities, personality development clubs & competitions',
                keywords: ['activities', 'co-curricular', 'competitions', 'events', 'personality development']
            },

            // Student Zone & Mentoring
            {
                title: 'Student Development & Mentoring',
                category: 'Student Zone',
                icon: 'fa-users',
                url: 'placements.html',
                description: 'Career guidance, holistic student development, soft skills & mentoring programs',
                keywords: ['student development', 'career', 'guidance', 'mentoring', 'counseling', 'skills', 'placements']
            },
            {
                title: 'Proud Alumni Network & Success Stories',
                category: 'About Us',
                icon: 'fa-user-tie',
                url: 'index.html#alumni',
                description: 'Inspiring achievements and personal testimonials from distinguished school alumni',
                keywords: ['alumni', 'former students', 'graduates', 'success stories', 'achievers', 'testimonials']
            },
            {
                title: 'Photo & Video Gallery',
                category: 'Media',
                icon: 'fa-images',
                url: 'gallery.html',
                description: 'Photographs of campus, classroom activities, festivals, celebrations & sports events',
                keywords: ['gallery', 'photos', 'pictures', 'images', 'campus photos', 'video', 'events photo']
            },
            {
                title: 'Notice Board & Latest Circulars',
                category: 'Student Zone',
                icon: 'fa-bullhorn',
                url: 'notices.html',
                description: 'Official school notices, circulars, exam announcements & holiday notifications',
                keywords: ['notice', 'notices', 'circular', 'announcements', 'updates', 'bulletin', 'news']
            },

            // About Us & Leadership
            {
                title: 'About Jijamata Public School',
                category: 'About Us',
                icon: 'fa-landmark',
                url: 'about.html',
                description: 'Established in 2003 at Bhenda BK, Ahmednagar with a legacy of value-based education',
                keywords: ['about', 'about school', 'about us', 'history', 'established', 'bhenda', 'ahmednagar', 'legacy']
            },
            {
                title: 'Vision, Mission & Core Values',
                category: 'About Us',
                icon: 'fa-compass',
                url: 'about.html#vision',
                description: 'Our educational philosophy, mission statement and moral core values',
                keywords: ['vision', 'mission', 'values', 'motto', 'goals', 'philosophy']
            },
            {
                title: "Principal's Message",
                category: 'About Us',
                icon: 'fa-comment-alt',
                url: 'about.html#principal',
                description: 'Message from the School Principal on student growth, character and academic excellence',
                keywords: ['principal', 'principal message', 'headmaster', 'leadership', 'message']
            },
            {
                title: 'School Administration & Governing Body',
                category: 'About Us',
                icon: 'fa-sitemap',
                url: 'about.html#administration',
                description: 'Management committee: Shri Marutraoji Ghule Patil, Shri Narendraji Ghule Patil, Dr. Kshitij Ghule Patil',
                keywords: ['administration', 'management', 'trustee', 'marutraoji ghule patil', 'narendraji ghule patil', 'kshitij ghule patil', 'committee', 'patil']
            },

            // Contact & Location
            {
                title: 'Contact Us & Campus Location',
                category: 'Contact',
                icon: 'fa-map-marker-alt',
                url: 'contact.html',
                description: 'School address at Bhenda BK, Newasa, Ahmednagar, phone numbers, email & enquiry form',
                keywords: ['contact', 'contact us', 'phone', 'telephone', 'mobile', 'email', 'address', 'location', 'map', 'directions', 'whatsapp', 'bhenda']
            },

            // Portals
            {
                title: 'Student Login Portal',
                category: 'Portals',
                icon: 'fa-user-check',
                url: 'student-login.html',
                description: 'Access student dashboard, attendance, examination marksheet and personal profile',
                keywords: ['student login', 'login', 'portal', 'dashboard', 'attendance', 'marksheet', 'student portal']
            },
            {
                title: 'Teacher & Staff Login Portal',
                category: 'Portals',
                icon: 'fa-chalkboard-teacher',
                url: 'teacher-login.html',
                description: 'Faculty login for attendance recording, marks submission and class management',
                keywords: ['teacher login', 'staff login', 'faculty portal', 'faculty login', 'teacher portal']
            }
        ];

        this.init();
    }

    enhanceSearchBox() {
        const searchBox = this.searchModal.querySelector('.search-box');
        if (!searchBox) return;

        let inputWrap = searchBox.querySelector('.search-input-wrap');
        if (!inputWrap && this.searchInput) {
            inputWrap = document.createElement('div');
            inputWrap.className = 'search-input-wrap';
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-search search-input-icon';
            
            this.searchInput.parentNode.insertBefore(inputWrap, this.searchInput);
            inputWrap.appendChild(icon);
            inputWrap.appendChild(this.searchInput);

            const clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.className = 'search-clear-btn';
            clearBtn.id = 'searchClearBtn';
            clearBtn.setAttribute('aria-label', 'Clear search');
            clearBtn.innerHTML = '<i class="fas fa-times-circle"></i>';
            inputWrap.appendChild(clearBtn);
        }

        this.searchClearBtn = document.getElementById('searchClearBtn');
        if (this.searchClearBtn) {
            this.searchClearBtn.addEventListener('click', () => {
                this.searchInput.value = '';
                this.searchInput.focus();
                this.handleSearch('');
            });
        }
    }

    init() {
        // Open search modal
        this.searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal();
        });

        // Close search modal
        if (this.searchClose) {
            this.searchClose.addEventListener('click', () => this.closeModal());
        }
        if (this.searchOverlay) {
            this.searchOverlay.addEventListener('click', () => this.closeModal());
        }

        // Live search handling
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Keyboard navigation (Arrow keys, Enter, Escape)
        this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchModal.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Submit button
        if (this.searchSubmit) {
            this.searchSubmit.addEventListener('click', () => this.submitSelection());
        }
    }

    openModal() {
        this.searchModal.classList.add('active');
        this.renderInitialState();
        setTimeout(() => {
            this.searchInput.focus();
        }, 50);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.searchModal.classList.remove('active');
        this.searchInput.value = '';
        if (this.searchClearBtn) {
            this.searchClearBtn.classList.remove('visible');
        }
        this.selectedIndex = -1;
        document.body.style.overflow = '';
    }

    renderInitialState() {
        this.selectedIndex = -1;
        if (this.searchClearBtn) {
            this.searchClearBtn.classList.remove('visible');
        }
        this.searchResults.innerHTML = `
            <div class="search-initial-state">
                <div class="search-quick-tags-title">
                    <i class="fas fa-bolt"></i> Popular Quick Searches
                </div>
                <div class="search-quick-tags">
                    <button type="button" class="search-tag-chip" data-search="fee">
                        <i class="fas fa-file-invoice-dollar"></i> Fee Structure
                    </button>
                    <button type="button" class="search-tag-chip" data-search="admission">
                        <i class="fas fa-file-signature"></i> Admissions
                    </button>
                    <button type="button" class="search-tag-chip" data-search="hostel">
                        <i class="fas fa-hotel"></i> Hostel Facilities
                    </button>
                    <button type="button" class="search-tag-chip" data-search="rte">
                        <i class="fas fa-award"></i> RTE Schemes
                    </button>
                    <button type="button" class="search-tag-chip" data-search="sports">
                        <i class="fas fa-running"></i> Sports & Games
                    </button>
                    <button type="button" class="search-tag-chip" data-search="calendar">
                        <i class="fas fa-calendar-alt"></i> Academic Calendar
                    </button>
                    <button type="button" class="search-tag-chip" data-search="contact">
                        <i class="fas fa-phone-alt"></i> Contact & Location
                    </button>
                </div>
            </div>
        `;

        // Attach chip listeners
        this.searchResults.querySelectorAll('.search-tag-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const term = e.currentTarget.getAttribute('data-search');
                this.searchInput.value = term;
                this.searchInput.focus();
                this.handleSearch(term);
            });
        });
    }

    handleSearch(rawQuery) {
        const query = (rawQuery || '').trim();
        if (!query) {
            this.renderInitialState();
            return;
        }

        if (this.searchClearBtn) {
            this.searchClearBtn.classList.add('visible');
        }

        const queryLower = query.toLowerCase();
        const terms = queryLower.split(/\s+/).filter(Boolean);

        const scored = [];

        this.searchData.forEach(item => {
            const titleLower = item.title.toLowerCase();
            const categoryLower = item.category.toLowerCase();
            const descLower = (item.description || '').toLowerCase();
            const keywords = item.keywords || [];

            let score = 0;

            // Direct title matches
            if (titleLower.includes(queryLower)) {
                score += 60;
                if (titleLower.startsWith(queryLower)) score += 30;
            }

            // Keyword matches
            keywords.forEach(keyword => {
                const kLower = keyword.toLowerCase();
                if (kLower === queryLower) {
                    score += 55;
                } else if (kLower.startsWith(queryLower)) {
                    score += 40;
                } else if (kLower.includes(queryLower)) {
                    score += 25;
                }
            });

            // Category matches
            if (categoryLower.includes(queryLower)) {
                score += 30;
            }

            // Description matches
            if (descLower.includes(queryLower)) {
                score += 20;
            }

            // Multi-term check
            if (terms.length > 1) {
                const allMatch = terms.every(t =>
                    titleLower.includes(t) ||
                    categoryLower.includes(t) ||
                    descLower.includes(t) ||
                    keywords.some(k => k.toLowerCase().includes(t))
                );
                if (allMatch) score += 35;
            }

            if (score > 0) {
                scored.push({ item, score });
            }
        });

        // Sort by highest score
        scored.sort((a, b) => b.score - a.score);
        const results = scored.map(s => s.item);

        if (results.length === 0) {
            this.renderNoResults(query);
            return;
        }

        this.renderResults(results, query);
    }

    highlightMatch(text, query) {
        if (!query || !text) return text;
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    renderResults(items, query) {
        this.selectedIndex = -1;
        this.currentResults = items;

        const html = items.map((item, idx) => {
            const highTitle = this.highlightMatch(item.title, query);
            const highDesc = this.highlightMatch(item.description, query);
            return `
                <a href="${item.url}" class="search-result-item" data-index="${idx}">
                    <div class="search-result-icon">
                        <i class="fas ${item.icon || 'fa-arrow-right'}"></i>
                    </div>
                    <div class="search-result-content">
                        <div class="search-result-header">
                            <span class="search-result-title">${highTitle}</span>
                            <span class="search-result-badge">${item.category}</span>
                        </div>
                        <p class="search-result-desc">${highDesc}</p>
                    </div>
                    <div class="search-result-arrow">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </a>
            `;
        }).join('');

        this.searchResults.innerHTML = html;

        // Auto close on link click
        this.searchResults.querySelectorAll('.search-result-item').forEach(link => {
            link.addEventListener('click', () => {
                this.closeModal();
            });
        });
    }

    renderNoResults(query) {
        this.selectedIndex = -1;
        this.currentResults = [];
        this.searchResults.innerHTML = `
            <div class="search-empty-state">
                <div class="search-empty-icon">
                    <i class="fas fa-search-minus"></i>
                </div>
                <div class="search-empty-title">No results found for "${query}"</div>
                <p class="search-empty-hint">
                    Try searching for <strong>fee</strong>, <strong>admission</strong>, <strong>hostel</strong>, <strong>rte</strong>, <strong>sports</strong>, or <strong>contact</strong>.
                </p>
            </div>
        `;
    }

    handleKeydown(e) {
        const items = this.searchResults.querySelectorAll('.search-result-item');
        if (!items.length) {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex + 1) % items.length;
            this.updateSelectedItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
            this.updateSelectedItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            this.submitSelection();
        }
    }

    updateSelectedItem(items) {
        items.forEach((item, idx) => {
            if (idx === this.selectedIndex) {
                item.classList.add('is-selected');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('is-selected');
            }
        });
    }

    submitSelection() {
        const items = this.searchResults.querySelectorAll('.search-result-item');
        if (!items.length) return;

        let target = null;
        if (this.selectedIndex >= 0 && this.selectedIndex < items.length) {
            target = items[this.selectedIndex];
        } else {
            target = items[0];
        }

        if (target) {
            const url = target.getAttribute('href');
            this.closeModal();
            window.location.href = url;
        }
    }
}

// ===== ANIMATED COUNTERS =====
class AnimatedCounters {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number, [data-target]');
        if (!this.counters.length) return;
        this.init();
    }
    
    init() {
        if (!('IntersectionObserver' in window)) {
            this.counters.forEach(c => this.animateCounter(c));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        this.counters.forEach(c => observer.observe(c));
    }
    
    animateCounter(counter) {
        let rawTarget = counter.getAttribute('data-target');
        let suffix = counter.getAttribute('data-suffix') || '';
        
        if (!rawTarget) {
            const text = counter.textContent.trim();
            const match = text.match(/^(\d+)(.*)$/);
            if (match) {
                rawTarget = match[1];
                if (!suffix) suffix = match[2];
            }
        }
        
        const target = parseInt(rawTarget);
        if (isNaN(target)) return;

        const duration = 1800; // 1.8 seconds
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + suffix;
            }
        };
        
        updateCounter();
    }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        // Skip scroll animations if reduced motion is preferred
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll('section, footer, .section-header, .page-header, .cta-section').forEach(s => s.classList.add('fade-in'));
            document.querySelectorAll('.feature-card, .program-card, .notice-card, .activity-card, .facility-card, .academic-card, .scheme-card, .hostel-card, .achievement-card, .gallery-item, .gallery-card, .program-detail-card, .info-card, .stat-card, .principal-card, .founder-card, .founder-photo-placeholder, .founder-content, .cta-card, .contact-card, .fee-table-container, .scheme-detail-card, .rule-category, .department-card, .rte-card, .scheme-highlight-card').forEach(c => c.classList.add('slide-up'));
            document.querySelectorAll('.reveal-left, .reveal-right, .reveal-scale').forEach(r => r.classList.add('is-revealed'));
            return;
        }

        // Add fade-in animation to sections, headers, and footer
        const sections = document.querySelectorAll('section, footer, .section-header, .page-header, .cta-section');
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
        
        sections.forEach(section => {
            observer.observe(section);
        });

        // Directional reveal classes
        const directionalEls = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-scale');
        const directionalObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        directionalEls.forEach(el => directionalObserver.observe(el));
        
        // Add slide-up animation to cards & components with staggered grid entrance
        const cardSelectors = [
            '.feature-card', '.program-card', '.notice-card', '.activity-card', 
            '.facility-card', '.academic-card', '.scheme-card', '.hostel-card', 
            '.achievement-card', '.gallery-item', '.gallery-card', '.program-detail-card', '.info-card', 
            '.stat-card', '.principal-card', '.founder-card', '.founder-photo-placeholder', '.founder-content',
            '.cta-card', '.contact-card', '.fee-table-container', '.scheme-detail-card',
            '.rule-category', '.department-card', '.rte-card', '.scheme-highlight-card'
        ].join(', ');

        const cards = document.querySelectorAll(cardSelectors);
        
        // Apply staggered transition delays to grid siblings
        cards.forEach(card => {
            const parent = card.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(c => c.matches(cardSelectors));
                const index = siblings.indexOf(card);
                if (index > 0) {
                    card.style.transitionDelay = `${(index % 6) * 0.08}s`;
                }
            }
        });

        const cardObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('slide-up');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
        
        cards.forEach(card => {
            cardObserver.observe(card);
        });
    }
}



// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// ===== NAVBAR SCROLL EFFECT =====
class NavbarScroll {
    constructor() {
        this.navbar = document.querySelector('.main-navbar');
        if (!this.navbar) {
            return;
        }
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            } else {
                this.navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }
        });
    }
}

// ===== GALLERY FILTER & LIGHTBOX =====
class GalleryFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.gallery-filter-wrapper .filter-btn');
        this.galleryCards = document.querySelectorAll('.gallery-card');

        if (!this.filterBtns.length || !this.galleryCards.length) return;
        this.init();
    }

    init() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-filter');

                // Toggle active button
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter cards
                this.galleryCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (category === 'all' || cardCategory === category) {
                        card.style.display = 'block';
                        card.classList.add('fade-in');
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
}

class LightboxModal {
    constructor() {
        this.lightbox = document.getElementById('lightboxModal');
        this.closeBtn = document.getElementById('lightboxClose');
        this.titleEl = document.getElementById('lightboxTitle');
        this.categoryEl = document.getElementById('lightboxCategory');
        this.cards = document.querySelectorAll('.gallery-card');

        if (!this.lightbox) return;
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('.gallery-caption h4')?.textContent || 'School Photo';
                const category = card.querySelector('.gallery-category-tag')?.textContent || 'Gallery';

                if (this.titleEl) this.titleEl.textContent = title;
                if (this.categoryEl) this.categoryEl.textContent = category;

                this.lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightbox.classList.contains('active')) {
                this.close();
            }
        });
    }

    close() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== ALUMNI SPOTLIGHT MODAL =====
class AlumniModal {
    constructor() {
        this.backdrop = document.getElementById('alumniModalBackdrop');
        this.modal = document.getElementById('alumniModal');
        this.closeBtn = document.getElementById('alumniModalClose');
        this.cards = document.querySelectorAll('.alumni-card');
        
        this.imgEl = document.getElementById('alumniModalImg');
        this.nameEl = document.getElementById('alumniModalName');
        this.subtitleEl = document.getElementById('alumniModalSubtitle');
        this.pillEl = document.getElementById('alumniModalPill');
        this.pillTextEl = document.getElementById('alumniModalPillText');
        this.pillIconEl = document.getElementById('alumniModalPillIcon');
        this.pinEl = document.getElementById('alumniModalPin');
        this.msgEl = document.getElementById('alumniModalMessage');
        this.prideEl = document.getElementById('alumniModalPride');

        if (!this.backdrop || !this.cards.length) return;

        this.alumniData = [
            {
                name: "Mast. Chaitanya Tekane",
                achievement: "MS, Canada",
                subtitle: "Master of Science &bull; Canada",
                image: "images/alumni/chaitanya-tekane.jpg",
                pillClass: "global",
                pillIcon: "fas fa-graduation-cap",
                pinIcon: "fas fa-globe",
                pinBg: "#B8923A",
                message: "The strong scientific foundation and curiosity nurtured in me at Jijamata Public School gave me the confidence to pursue my MS in Canada. JPS taught me to dream without boundaries, work relentlessly, and achieve global excellence!",
                pride: "Proud JPS Alumnus &bull; Global Scholar"
            },
            {
                name: "Mast. Sanket Gaikwad",
                achievement: "IIT Roorkee",
                subtitle: "Indian Institute of Technology (IIT Roorkee)",
                image: "images/alumni/sanket-gaikwad.jpg",
                pillClass: "iit",
                pillIcon: "fas fa-landmark",
                pinIcon: "fas fa-university",
                pinBg: "#4F5B2A",
                message: "Cracking IIT Roorkee became a reality because of the conceptual clarity, discipline, and constant encouragement from my teachers at Jijamata Public School. I am forever proud to carry the JPS legacy with me.",
                pride: "Proud JPS Alumnus &bull; IITian"
            },
            {
                name: "Mast. Vinay Khatik",
                achievement: "MBBS",
                subtitle: "Bachelor of Medicine &amp; Surgery (MBBS)",
                image: "images/alumni/vinay-khatik.jpg",
                pillClass: "mbbs",
                pillIcon: "fas fa-user-md",
                pinIcon: "fas fa-stethoscope",
                pinBg: "#1E6B40",
                message: "Pursuing MBBS has been my lifelong calling, and Jijamata Public School instilled in me the discipline, compassion, and academic rigor essential for the medical field. I owe my journey to the solid foundation built here.",
                pride: "Proud JPS Alumnus &bull; Future Doctor"
            },
            {
                name: "Mast. Anway Pawar",
                achievement: "MS, USA",
                subtitle: "Master of Science &bull; USA",
                image: "images/alumni/anway-pawar-square.jpg",
                pillClass: "global",
                pillIcon: "fas fa-graduation-cap",
                pinIcon: "fas fa-globe-americas",
                pinBg: "#B8923A",
                message: "From my foundational years at Jijamata Public School to pursuing my MS in the United States, the problem-solving mindset, values, and encouragement I received at JPS continue to guide me at every milestone.",
                pride: "Proud JPS Alumnus &bull; Global Achiever"
            },
            {
                name: "Ms. Ashwini Tupe",
                achievement: "MBBS",
                subtitle: "Bachelor of Medicine &amp; Surgery (MBBS)",
                image: "images/alumni/ashwini-tupe-square.jpg",
                pillClass: "mbbs",
                pillIcon: "fas fa-user-md",
                pinIcon: "fas fa-stethoscope",
                pinBg: "#1E6B40",
                message: "Wearing the white coat as an MBBS doctor is a dream realized, and the journey started right here in the classrooms of Jijamata Public School. JPS empowered me with the confidence to aim high and serve society through healthcare.",
                pride: "Proud JPS Alumna &bull; Healthcare Leader"
            }
        ];

        this.init();
    }

    init() {
        this.cards.forEach((card, index) => {
            const openHandler = (e) => {
                e.preventDefault();
                this.openModal(index);
            };
            card.addEventListener('click', openHandler);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openModal(index);
                }
            });
        });

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal();
            });
        }

        this.backdrop.addEventListener('click', (e) => {
            if (e.target === this.backdrop) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.backdrop.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal(index) {
        const data = this.alumniData[index];
        if (!data) return;

        if (this.nameEl) this.nameEl.textContent = data.name;
        if (this.subtitleEl) this.subtitleEl.innerHTML = data.subtitle;
        if (this.imgEl) {
            this.imgEl.src = data.image;
            this.imgEl.alt = data.name;
        }
        if (this.msgEl) this.msgEl.textContent = data.message;
        if (this.prideEl) this.prideEl.innerHTML = `<i class="fas fa-award"></i> ${data.pride}`;

        if (this.pillEl && this.pillTextEl && this.pillIconEl) {
            this.pillEl.className = `alumni-achievement-pill ${data.pillClass}`;
            this.pillIconEl.className = data.pillIcon;
            this.pillTextEl.textContent = data.achievement;
        }

        if (this.pinEl) {
            this.pinEl.style.background = data.pinBg;
            this.pinEl.innerHTML = `<i class="${data.pinIcon}"></i>`;
        }

        this.backdrop.classList.add('active');
        this.backdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.backdrop.classList.remove('active');
        this.backdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

// ===== INITIALIZE ALL COMPONENTS =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const heroCarousel = new HeroCarousel();
    const mobileMenu = new MobileMenu();
    const searchModal = new SearchModal();
    const animatedCounters = new AnimatedCounters();
    const scrollAnimations = new ScrollAnimations();
    const smoothScroll = new SmoothScroll();
    const navbarScroll = new NavbarScroll();
    const galleryFilter = new GalleryFilter();
    const lightboxModal = new LightboxModal();
    const alumniModal = new AlumniModal();

    
    // Make Feature Cards click target all-inclusive & add interactive hover effect
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const link = card.querySelector('.feature-link');
            if (link && !e.target.closest('a')) {
                window.location.href = link.getAttribute('href');
            }
        });
    });

    console.log('All components initialized successfully');
});

// ===== ADMISSION ENQUIRY & CONTACT FORMS TO WHATSAPP =====
window.handleQuickAdmission = function(e) {
    if (e && e.preventDefault) e.preventDefault();

    const quickAdmissionForm = document.getElementById('quickAdmissionForm');
    const nameInput = document.getElementById('enquiryName');
    const phoneInput = document.getElementById('enquiryPhone');
    const gradeInput = document.getElementById('enquiryGrade');
    const submitBtn = document.getElementById('btnSubmitEnquiry');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const grade = gradeInput ? gradeInput.value : '';

    if (!name || !phone || !grade) {
        alert('Please fill out all required fields.');
        return false;
    }

    // Construct neat WhatsApp Message
    const message = `Hello Jijamata Public School Admission Team,\n\nI would like to submit an Admission Enquiry:\n• Parent / Student Name: ${name}\n• Mobile / WhatsApp: ${phone}\n• Grade Seeking: ${grade}\n\nPlease share details regarding admission eligibility, fees, and the admission procedure. Thank you!`;

    const schoolWhatsApp = '919689684323';
    const whatsappUrl = `https://wa.me/${schoolWhatsApp}?text=${encodeURIComponent(message)}`;

    // Optional background save to Firestore if initialized
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
            const db = firebase.firestore();
            db.collection('admission_enquiries').add({
                name: name,
                phone: phone,
                grade: grade,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(err => console.debug('Enquiry Firestore log error:', err));
        } catch (err) {
            console.debug('Firestore skip:', err);
        }
    }

    // UI Feedback
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Opening WhatsApp...';
        submitBtn.disabled = true;
    }

    // Redirect to WhatsApp
    const win = window.open(whatsappUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = whatsappUrl;
    }

    // Reset form & restore button
    setTimeout(() => {
        if (quickAdmissionForm) quickAdmissionForm.reset();
        if (submitBtn) {
            submitBtn.innerHTML = 'Submit Enquiry on WhatsApp <i class="fab fa-whatsapp" style="margin-left: 6px; font-size: 16px;"></i>';
            submitBtn.disabled = false;
        }
    }, 1200);

    return false;
};

window.handleContactSubmit = function(e) {
    if (e && e.preventDefault) e.preventDefault();

    const contactForm = document.getElementById('contactUsForm') || document.querySelector('.contact-form');
    if (!contactForm) return false;

    const nameInput = contactForm.querySelector('#name') || contactForm.querySelector('[name="name"]');
    const emailInput = contactForm.querySelector('#email') || contactForm.querySelector('[name="email"]');
    const phoneInput = contactForm.querySelector('#phone') || contactForm.querySelector('[name="phone"]');
    const subjectSelect = contactForm.querySelector('#subject') || contactForm.querySelector('[name="subject"]');
    const messageInput = contactForm.querySelector('#message') || contactForm.querySelector('[name="message"]');
    const submitBtn = contactForm.querySelector('button[type="submit"]') || document.getElementById('btnContactSubmit');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';

    let subject = 'General Inquiry';
    if (subjectSelect) {
        if (subjectSelect.selectedIndex >= 0 && subjectSelect.options[subjectSelect.selectedIndex]) {
            const opt = subjectSelect.options[subjectSelect.selectedIndex];
            subject = (opt.value && opt.value !== '') ? opt.text : (opt.text || opt.value);
        } else {
            subject = subjectSelect.value || 'General Inquiry';
        }
    }

    const messageText = messageInput ? messageInput.value.trim() : '';

    if (!name || !email || !messageText) {
        alert('Please fill out all required fields (Full Name, Email, and Message).');
        return false;
    }

    // Construct formatted WhatsApp message with clean layout
    const formattedMsg = `Hello Jijamata Public School,\n\nI have sent a message via your website contact form:\n• Name: ${name}\n• Email: ${email}\n• Phone: ${phone || 'Not provided'}\n• Subject: ${subject}\n• Message: ${messageText}\n\nThank you!`;

    const schoolWhatsApp = '919689684323';
    const whatsappUrl = `https://wa.me/${schoolWhatsApp}?text=${encodeURIComponent(formattedMsg)}`;

    // Optional background save to Firestore if initialized
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
            const db = firebase.firestore();
            db.collection('contact_messages').add({
                name: name,
                email: email,
                phone: phone,
                subject: subject,
                message: messageText,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(err => console.debug('Contact Firestore log error:', err));
        } catch (err) {
            console.debug('Firestore skip:', err);
        }
    }

    // Visual button feedback
    const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'Send Message on WhatsApp <i class="fab fa-whatsapp"></i>';
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Opening WhatsApp...';
        submitBtn.disabled = true;
    }

    // Redirect to WhatsApp
    const win = window.open(whatsappUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = whatsappUrl;
    }

    // Reset form & restore button after delay
    setTimeout(() => {
        contactForm.reset();
        if (submitBtn) {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
        }
    }, 1200);

    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Admission Enquiry Form (index.html)
    const quickAdmissionForm = document.getElementById('quickAdmissionForm');
    if (quickAdmissionForm) {
        quickAdmissionForm.onsubmit = window.handleQuickAdmission;
    }

    // 2. Contact Page Form (contact.html)
    const contactForm = document.getElementById('contactUsForm') || document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.onsubmit = window.handleContactSubmit;
    }
});

// ===== HANDLE WINDOW RESIZE =====
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Close mobile menu if window is resized to desktop
        if (window.innerWidth > 768) {
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.getElementById('hamburger');
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            if (hamburger) {
                hamburger.classList.remove('active');
            }
            document.body.classList.remove('mobile-menu-open');
            document.body.style.overflow = '';
        }
    }, 250);
});