/**
 * Interactive React Hero Slider Component for Jijamata Public School
 * Powered by React 18 UMD
 */

(function() {
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.warn('React or ReactDOM not loaded, keeping HTML fallback.');
        return;
    }

    const { useState, useEffect, useRef } = React;
    const e = React.createElement;

    const whatsappUrl = 'https://wa.me/919689684323?text=Hello%20Jijamata%20Public%20School,%20I%20would%20like%20to%20apply%20for%20admission%20for%20my%20child.';

    const slidesData = [
        {
            id: 1,
            badge: 'Our Authentic Campus',
            title: 'Experience Excellence',
            highlight: 'at Jijamata Public School',
            description: 'State-of-the-art campus infrastructure, spacious classrooms, modern computer lab, and lush sports grounds.',
            primaryBtnText: 'Apply Now',
            primaryBtnUrl: whatsappUrl,
            isWhatsApp: true,
            secondaryBtnText: 'Explore Campus',
            secondaryBtnUrl: 'facilities.html',
            imageSrc: 'images/school-building.jpg',
            imageAlt: 'Jijamata Public School Admission Poster',
            containImage: true
        },
        {
            id: 2,
            badge: 'Admissions Open',
            title: 'Nurturing Young Minds',
            highlight: 'LKG to 10th Std',
            description: 'Providing nurturing, value-based, and modern education in Bhenda Budruk since 2003.',
            primaryBtnText: 'Admission Enquiry',
            primaryBtnUrl: 'admissions.html',
            secondaryBtnText: 'Explore Campus',
            secondaryBtnUrl: 'departments.html',
            imageSrc: 'images/admissions-pamphlet.jpg',
            imageAlt: 'Jijamata Public School Pamphlet',
            containImage: true
        },
        {
            id: 3,
            badge: 'Government Schemes & Support',
            title: 'Shape Your Child\'s',
            highlight: 'Future With Us',
            description: 'Free Admission opportunities available under RTE & Raje Yashwantrao Holkar Schemes.',
            primaryBtnText: 'Apply Now',
            primaryBtnUrl: whatsappUrl,
            isWhatsApp: true,
            secondaryBtnText: 'Explore Campus',
            secondaryBtnUrl: 'placements.html',
            imageSrc: 'images/admissions-pamphlet-marathi.jpg',
            imageAlt: 'Admissions Open Marathi Pamphlet',
            containImage: true
        },
        {
            id: 4,
            badge: 'Honoring Our Founders',
            title: 'Visionary Founders',
            highlight: 'Guiding Our Legacy',
            description: 'Founded under the inspiring vision of Loknete Marutrao Ghule Patil & Shri Narendra Ghule Patil to deliver quality education.',
            primaryBtnText: 'Read Founders Story',
            primaryBtnUrl: 'about.html',
            secondaryBtnText: 'About Our School',
            secondaryBtnUrl: 'about.html',
            isFoundersSlide: true,
            imageAlt: 'Founders of Jijamata Public School'
        }
    ];

    function HeroReactSlider() {
        const [activeIndex, setActiveIndex] = useState(0);
        const [isPaused, setIsPaused] = useState(false);
        const [progress, setProgress] = useState(0);
        const timerRef = useRef(null);

        const duration = 5000; // 5 seconds per slide
        const intervalStep = 50; // update progress every 50ms

        useEffect(() => {
            if (isPaused) return;

            const stepPercentage = (intervalStep / duration) * 100;
            timerRef.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setActiveIndex(current => (current + 1) % slidesData.length);
                        return 0;
                    }
                    return prev + stepPercentage;
                });
            }, intervalStep);

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }, [isPaused, activeIndex]);

        const handleSlideChange = (newIndex) => {
            setActiveIndex(newIndex);
            setProgress(0);
        };

        const handlePrev = () => {
            setActiveIndex(prev => (prev - 1 + slidesData.length) % slidesData.length);
            setProgress(0);
        };

        const handleNext = () => {
            setActiveIndex(prev => (prev + 1) % slidesData.length);
            setProgress(0);
        };

        const currentSlide = slidesData[activeIndex];

        const renderRightCard = () => {
            if (currentSlide.isFoundersSlide) {
                return e('div', { className: 'react-hero-image-card react-founders-card' }, [
                    e('div', { className: 'react-founders-grid' }, [
                        e('div', { className: 'react-founder-item' }, [
                            e('div', { className: 'react-founder-img-wrapper' }, [
                                e('img', {
                                    src: 'images/marutraoji-ghule-patil.jpg',
                                    alt: 'Marutraoji Ghule Patil',
                                    className: 'react-founder-img',
                                    width: 400,
                                    height: 500,
                                    loading: 'lazy'
                                })
                            ]),
                            e('div', { className: 'react-founder-info' }, [
                                e('span', { className: 'react-founder-name' }, 'Marutraoji Ghule Patil'),
                                e('span', { className: 'react-founder-role' }, 'Loknete Founder Leader')
                            ])
                        ]),
                        e('div', { className: 'react-founder-item' }, [
                            e('div', { className: 'react-founder-img-wrapper' }, [
                                e('img', {
                                    src: 'images/narendra-ghule-patil.jpg',
                                    alt: 'Narendra Ghule Patil',
                                    className: 'react-founder-img',
                                    width: 400,
                                    height: 500,
                                    loading: 'lazy'
                                })
                            ]),
                            e('div', { className: 'react-founder-info' }, [
                                e('span', { className: 'react-founder-name' }, 'Narendra Ghule Patil'),
                                e('span', { className: 'react-founder-role' }, 'School Leadership')
                            ])
                        ])
                    ])
                ]);
            }

            return e('div', { className: 'react-hero-image-card' }, [
                e('img', {
                    src: currentSlide.imageSrc,
                    alt: currentSlide.imageAlt,
                    className: 'react-hero-img',
                    width: 800,
                    height: 600,
                    loading: 'eager',
                    style: currentSlide.containImage ? { objectFit: 'contain', background: 'transparent' } : {}
                })
            ]);
        };

        return e('div', {
            className: 'react-hero-container',
            onMouseEnter: () => setIsPaused(true),
            onMouseLeave: () => setIsPaused(false)
        }, [
            // Background Slide Container
            e('div', { key: `slide-${currentSlide.id}`, className: 'react-hero-content-wrapper' }, [
                // Left Column: Typography & Action Buttons
                e('div', { className: 'react-hero-left' }, [
                    // Badge
                    e('div', { className: 'hero-badge react-hero-badge' }, [
                        e('i', { className: 'fas fa-star', style: { marginRight: '8px' } }),
                        e('span', null, currentSlide.badge)
                    ]),
                    // Title
                    e('h1', { className: 'hero-title react-hero-title' }, [
                        currentSlide.title,
                        e('br'),
                        e('span', { className: 'highlight' }, currentSlide.highlight)
                    ]),
                    // Description
                    e('p', { className: 'react-hero-description' }, currentSlide.description),
                    // Action Buttons
                    e('div', { className: 'react-hero-actions' }, [
                        e('a', {
                            href: currentSlide.primaryBtnUrl,
                            className: 'btn btn-primary react-btn-primary',
                            target: (currentSlide.isWhatsApp || currentSlide.primaryBtnUrl.startsWith('http')) ? '_blank' : undefined,
                            rel: (currentSlide.isWhatsApp || currentSlide.primaryBtnUrl.startsWith('http')) ? 'noopener noreferrer' : undefined
                        }, [
                            (currentSlide.isWhatsApp || currentSlide.primaryBtnText === 'Apply Now')
                                ? e('i', { className: 'fab fa-whatsapp', style: { fontSize: '18px' } })
                                : null,
                            currentSlide.primaryBtnText,
                            e('i', { className: 'fas fa-arrow-right', style: { marginLeft: '2px' } })
                        ]),
                        e('a', {
                            href: currentSlide.secondaryBtnUrl,
                            className: 'btn btn-secondary react-btn-secondary'
                        }, currentSlide.secondaryBtnText)
                    ])
                ]),

                // Right Column: Image or Founders Card
                e('div', { className: 'react-hero-right' }, [
                    renderRightCard()
                ])
            ]),

            // Interactive Navigation Controls
            e('button', {
                className: 'react-carousel-control prev',
                onClick: handlePrev,
                'aria-label': 'Previous Slide'
            }, e('i', { className: 'fas fa-chevron-left' })),

            e('button', {
                className: 'react-carousel-control next',
                onClick: handleNext,
                'aria-label': 'Next Slide'
            }, e('i', { className: 'fas fa-chevron-right' })),

            // Indicators & Progress Bar
            e('div', { className: 'react-carousel-bottom-bar' }, [
                e('div', { className: 'react-indicators' }, 
                    slidesData.map((s, index) => 
                        e('button', {
                            key: s.id,
                            className: `react-indicator ${index === activeIndex ? 'active' : ''}`,
                            onClick: () => handleSlideChange(index),
                            'aria-label': `Go to slide ${index + 1}`
                        })
                    )
                ),
                // Timer Progress Line
                e('div', { className: 'react-progress-track' }, [
                    e('div', {
                        className: 'react-progress-bar',
                        style: { width: `${progress}%` }
                    })
                ])
            ])
        ]);
    }

    // Mount React Component into #hero-react-root
    document.addEventListener('DOMContentLoaded', function() {
        const rootElement = document.getElementById('hero-react-root');
        if (rootElement) {
            const root = ReactDOM.createRoot(rootElement);
            root.render(e(HeroReactSlider));
            console.log('React Hero Slider mounted successfully.');
        }
    });
})();
