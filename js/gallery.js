document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('galleryGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreText = document.getElementById('loadMoreText');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
    // Lightbox elements
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxCategory = document.getElementById('lightboxCategory');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');

    let currentFilter = 'All';
    let itemsPerPage = 9;
    let visibleCount = 0;
    let filteredData = [...galleryData];
    let lightboxIndex = 0;

    function renderCards(start, end) {
        const items = filteredData.slice(start, end);
        items.forEach((item, index) => {
            const card = document.createElement('div');
            // 'js' class hides it initially if js is enabled
            card.className = 'gallery-card js-hidden';
            card.dataset.index = start + index;
            
            const thumbSrc = item.src.replace('images/gallery/', 'images/gallery-thumbs/');
            
            card.innerHTML = `
                <img src="${thumbSrc}" alt="${item.alt}" data-full="${item.src}" loading="lazy" decoding="async" onload="this.parentElement.classList.remove('loading');" />
                <div class="expand-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                </div>
                <div class="gallery-caption">
                    <span class="gallery-category-tag">${item.category}</span>
                    <h4>${item.alt}</h4>
                </div>
            `;
            // Shimmer loading class
            card.classList.add('loading');
            
            // Interaction
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            const openCb = () => openLightbox(start + index);
            card.addEventListener('click', openCb);
            card.addEventListener('keydown', (e) => {
                if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCb(); }
            });

            galleryGrid.appendChild(card);
            
            // Scroll Reveal via IntersectionObserver
            observer.observe(card);
        });
        
        visibleCount += items.length;
        updateLoadMore();
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver((entries) => {
        let delay = 0;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (prefersReducedMotion) {
                    entry.target.classList.add('is-revealed');
                    entry.target.classList.remove('js-hidden');
                } else {
                    setTimeout(() => {
                        entry.target.classList.add('is-revealed');
                        entry.target.classList.remove('js-hidden');
                    }, delay);
                    delay += 60;
                }
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -50px 0px' });

    function initFilters() {
        // Init counts
        const counts = { 'All': galleryData.length };
        galleryData.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
        });

        filterButtons.forEach(btn => {
            const filter = btn.dataset.filter;
            const count = counts[filter] || 0;
            btn.innerHTML = `${btn.textContent.trim()} <span class="filter-count">${count}</span>`;
            
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => {
                    b.setAttribute('aria-pressed', 'false');
                    b.classList.remove('active');
                });
                btn.setAttribute('aria-pressed', 'true');
                btn.classList.add('active');
                
                currentFilter = filter;
                filteredData = currentFilter === 'All' ? [...galleryData] : galleryData.filter(i => i.category === currentFilter);
                
                // Animate out
                const oldCards = Array.from(galleryGrid.children);
                if (!prefersReducedMotion) {
                    oldCards.forEach(c => {
                        c.style.transform = 'scale(0.96)';
                        c.style.opacity = '0';
                    });
                }
                
                setTimeout(() => {
                    galleryGrid.innerHTML = '';
                    visibleCount = 0;
                    if(filteredData.length === 0) {
                        galleryGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align:center; padding: 60px 20px; color: var(--text-muted);">No photos found in this category.</div>';
                        updateLoadMore();
                    } else {
                        renderCards(0, itemsPerPage);
                    }
                }, prefersReducedMotion ? 0 : 200);
            });
        });
    }

    function updateLoadMore() {
        if(visibleCount >= filteredData.length) {
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'block';
            loadMoreText.textContent = `Showing ${visibleCount} of ${filteredData.length} photos`;
        }
    }

    loadMoreBtn.addEventListener('click', () => {
        const start = visibleCount;
        renderCards(start, start + itemsPerPage);
        
        // Focus management
        setTimeout(() => {
            const newCards = galleryGrid.querySelectorAll('.gallery-card');
            if(newCards[start]) newCards[start].focus();
        }, 100);
    });

    // Lightbox Logic
    let lastFocus = null;

    function openLightbox(index) {
        lightboxIndex = index;
        const item = filteredData[index];
        lastFocus = document.activeElement;
        
        updateLightboxContent(item);
        
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lightboxModal.focus();
        
        // Hide FAB
        document.body.classList.add('lightbox-active');
    }

    function updateLightboxContent(item) {
        lightboxImage.src = ''; // clear temporarily
        lightboxImage.src = item.src;
        lightboxTitle.textContent = item.alt;
        lightboxCategory.textContent = item.category;
        lightboxCounter.textContent = `${lightboxIndex + 1} / ${filteredData.length}`;
        
        // Preload next/prev
        if (lightboxIndex > 0) new Image().src = filteredData[lightboxIndex - 1].src;
        if (lightboxIndex < filteredData.length - 1) new Image().src = filteredData[lightboxIndex + 1].src;
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        document.body.classList.remove('lightbox-active');
        
        setTimeout(() => {
            lightboxImage.src = '';
            if(lastFocus) lastFocus.focus();
        }, 250);
    }

    function nextLightbox() {
        if (lightboxIndex < filteredData.length - 1) {
            lightboxIndex++;
            updateLightboxContent(filteredData[lightboxIndex]);
        }
    }

    function prevLightbox() {
        if (lightboxIndex > 0) {
            lightboxIndex--;
            updateLightboxContent(filteredData[lightboxIndex]);
        }
    }

    lightboxClose.addEventListener('click', closeLightbox);
    btnNext.addEventListener('click', nextLightbox);
    btnPrev.addEventListener('click', prevLightbox);
    
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal || e.target.classList.contains('lightbox-controls')) closeLightbox();
    });
    
    // Keyboard / swipe
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextLightbox();
        if (e.key === 'ArrowLeft') prevLightbox();
        
        // Focus trap
        if (e.key === 'Tab') {
            const focusable = lightboxModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    let touchStartX = 0;
    lightboxModal.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive: true});
    lightboxModal.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) nextLightbox();
        if (touchEndX > touchStartX + 50) prevLightbox();
    }, {passive: true});

    // Dynamic Gallery Update Event
    window.addEventListener('galleryDataUpdated', () => {
        filteredData = [...galleryData];
        visibleCount = 0;
        galleryGrid.innerHTML = '';
        initFilters();
        renderCards(0, itemsPerPage);
    });

    // Initialize
    document.documentElement.classList.add('html-js');
    initFilters();
    renderCards(0, itemsPerPage);
});
