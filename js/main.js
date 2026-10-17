// ===== NEW DESIGN SYSTEM INTERACTIVITY =====
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-ready');
    // 1. Header Scroll State
    const navbar = document.querySelector('.main-navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 2. Mobile Menu handled by script.js MobileMenu class

    // 3. Scroll Reveal Animation (IntersectionObserver)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const revealElements = document.querySelectorAll('section, footer, .section-header, .page-header, .cta-section, .feature-card, .program-card, .notice-card, .activity-card, .facility-card, .academic-card, .scheme-card, .hostel-card, .achievement-card, .gallery-item, .gallery-card, .program-detail-card, .info-card, .stat-card, .principal-card, .founder-card, .founder-photo-placeholder, .founder-content, .cta-card, .contact-card, .fee-table-container, .scheme-detail-card, .rule-category, .department-card, .rte-card, .scheme-highlight-card, .map-wrapper');
        
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -8% 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // 4. Stat Counter Animation
    const statCounters = document.querySelectorAll('.stat-number');
    if (statCounters.length > 0) {
        const statObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const endValue = parseInt(target.getAttribute('data-target') || '0', 10);
                    const suffix = target.getAttribute('data-suffix') || '';
                    const duration = 2000;
                    const startTime = performance.now();
                    
                    const updateCounter = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easeOut = progress * (2 - progress);
                        const current = Math.floor(easeOut * endValue);
                        
                        target.innerText = current + suffix;
                        
                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            target.innerText = endValue + suffix;
                        }
                    };
                    
                    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        target.innerText = endValue + suffix;
                    }
                    
                    observer.unobserve(target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -8% 0px'
        });
        
        statCounters.forEach(counter => statObserver.observe(counter));
    }
});
