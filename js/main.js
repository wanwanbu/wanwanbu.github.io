document.addEventListener('DOMContentLoaded', () => {
    const controllers = {
        lazyLoading: {
            init() {
                const images = document.querySelectorAll('img[loading="lazy"]');
                if (!images.length) return;

                if ('loading' in HTMLImageElement.prototype) {
                    images.forEach(img => {
                        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
                    });
                } else {
                    const imageObserver = new IntersectionObserver(
                        (entries, observer) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    const img = entry.target;
                                    img.src = img.src;
                                    img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
                                    observer.unobserve(img);
                                }
                            });
                        },
                        { rootMargin: '50px 0px', threshold: 0.01 }
                    );
                    images.forEach(img => imageObserver.observe(img));
                }
            }
        },

        externalLinks: {
            init() {
                const currentHostname = window.location.hostname;
                document.querySelectorAll('a[href^="http"]').forEach(link => {
                    if (!link.href.includes(currentHostname) && 
                        !link.href.includes('/categories/') && 
                        !link.href.includes('/tags/') &&
                        !link.href.includes(window.location.origin)) {
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    } else {
                        link.setAttribute('target', '_self');
                    }
                });
            }
        },

        backToTop: {
            init() {
                const backToTop = document.getElementById('back-to-top');
                if (!backToTop) return;

                const SCROLL_THRESHOLD = 300;
                let isScrolling = false;

                const handleScroll = () => {
                    if (!isScrolling) {
                        window.requestAnimationFrame(() => {
                            if (window.scrollY > SCROLL_THRESHOLD) {
                                backToTop.style.opacity = '1';
                                backToTop.style.visibility = 'visible';
                            } else {
                                backToTop.style.opacity = '0';
                                backToTop.style.visibility = 'hidden';
                            }
                            isScrolling = false;
                        });
                        isScrolling = true;
                    }
                };

                handleScroll();

                window.addEventListener('scroll', handleScroll, { passive: true });

                backToTop.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });

                backToTop.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            }
        },

        navbar: {
            init() {
                const navbar = document.querySelector('.navbar');
                const menuToggle = document.querySelector('.menu-toggle');
                const navbarMenu = document.querySelector('.navbar-menu');

                if (!navbar || !menuToggle || !navbarMenu) return;

                let lastScrollTop = 0;
                let lastExecutionTime = 0;
                const THROTTLE_DELAY = 200;
                const SCROLL_THRESHOLD = 100;

                const toggleMenu = () => {
                    navbarMenu.classList.toggle('active');
                };

                menuToggle.addEventListener('click', toggleMenu);

                document.addEventListener('click', (e) => {
                    if (!navbarMenu.contains(e.target) && 
                        !menuToggle.contains(e.target) && 
                        navbarMenu.classList.contains('active')) {
                        toggleMenu();
                    }
                });

                navbarMenu.addEventListener('click', () => {
                    if (window.innerWidth <= 768 && navbarMenu.classList.contains('active')) {
                        toggleMenu();
                    }
                });

                window.addEventListener('scroll', () => {
                    const now = Date.now();
                    if (now - lastExecutionTime >= THROTTLE_DELAY) {
                        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        
                        if (currentScrollTop > lastScrollTop && currentScrollTop > SCROLL_THRESHOLD) {
                            navbar.classList.add('navbar-hidden');
                        } else if (currentScrollTop < lastScrollTop && navbar.classList.contains('navbar-hidden')) {
                            navbar.classList.remove('navbar-hidden');
                        }

                        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
                        lastExecutionTime = now;
                    }
                }, { passive: true });
            }
        }
    };

    // 初始化所有控制器
    Object.values(controllers).forEach(controller => controller.init());
});



