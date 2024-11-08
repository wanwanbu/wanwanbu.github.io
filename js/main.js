(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const MainApp = {
            config: {
                scrollThreshold: 300,
                throttleDelay: 200,
                animationDuration: 500,
                mobileBreakpoint: 768
            },

            init() {
                this.initControllers();
                this.bindEvents();
            },

            initControllers() {
                this.imageController.init();
                this.navigationController.init();
                this.scrollController.init();
                this.linkController.init();
                this.performanceController.init();
            },

            bindEvents() {
                window.addEventListener('resize', this.debounce(() => {
                    this.handleResize();
                }, 250), { passive: true });

                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        this.handleVisibilityChange();
                    }
                });
            },

            imageController: {
                init() {
                    this.setupLazyLoading();
                },

                setupLazyLoading() {
                    document.querySelectorAll('img').forEach(img => {
                        // 添加 loading="lazy" 属性让浏览器原生支持懒加载
                        img.loading = 'lazy';
                        
                        // 错误处理和备用方案
                        img.onerror = () => {
                            if (img.src.includes('cdn.jsdelivr.net/gh')) {
                                // CDN 失败直接使用 GitHub raw
                                const rawSrc = img.src.replace('cdn.jsdelivr.net/gh', 'raw.githubusercontent.com');
                                console.warn(`CDN加载失败，使用GitHub源站: ${rawSrc}`);
                                img.src = rawSrc;
                                
                                // 为 GitHub raw 链接添加错误处理
                                img.onerror = () => {
                                    console.error('GitHub源站也失败，使用错误图片');
                                    img.src = '/img/error.jpg';
                                    img.classList.add('error');
                                };
                            } else {
                                console.error('图片加载失败:', img.src);
                                img.src = '/img/error.jpg';
                                img.classList.add('error');
                            }
                        };

                        // 添加加载成功的处理
                        img.onload = () => {
                            img.classList.add('loaded');
                        };
                    });
                }
            },

            navigationController: {
                init() {
                    this.navbar = document.querySelector('.navbar');
                    this.menuToggle = document.querySelector('.menu-toggle');
                    this.navbarMenu = document.querySelector('.navbar-menu');

                    if (!this.navbar || !this.menuToggle || !this.navbarMenu) return;

                    this.setupMobileMenu();
                    this.setupNavbarScroll();
                },

                setupMobileMenu() {
                    this.menuToggle.addEventListener('click', () => {
                        this.toggleMenu();
                    });

                    document.addEventListener('click', (e) => {
                        if (!this.navbarMenu.contains(e.target) && 
                            !this.menuToggle.contains(e.target) && 
                            this.navbarMenu.classList.contains('active')) {
                            this.toggleMenu();
                        }
                    });
                },

                toggleMenu() {
                    this.navbarMenu.classList.toggle('active');
                    this.menuToggle.classList.toggle('active');
                },

                setupNavbarScroll() {
                    let lastScrollTop = 0;
                    let lastExecutionTime = 0;

                    window.addEventListener('scroll', () => {
                        const now = Date.now();
                        if (now - lastExecutionTime >= MainApp.config.throttleDelay) {
                            const currentScrollTop = window.pageYOffset;
                            
                            if (currentScrollTop > lastScrollTop && currentScrollTop > MainApp.config.scrollThreshold) {
                                this.navbar.classList.add('navbar-hidden');
                                if (this.navbarMenu.classList.contains('active')) {
                                    this.toggleMenu();
                                }
                            } else if (currentScrollTop < lastScrollTop) {
                                this.navbar.classList.remove('navbar-hidden');
                            }

                            lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
                            lastExecutionTime = now;
                        }
                    }, { passive: true });
                }
            },

            scrollController: {
                init() {
                    this.setupBackToTop();
                    this.setupSmoothScroll();
                },

                setupBackToTop() {
                    const backToTop = document.getElementById('back-to-top');
                    if (!backToTop) return;

                    let isScrolling = false;

                    window.addEventListener('scroll', () => {
                        if (!isScrolling) {
                            window.requestAnimationFrame(() => {
                                backToTop.style.opacity = window.scrollY > MainApp.config.scrollThreshold ? '1' : '0';
                                backToTop.style.visibility = window.scrollY > MainApp.config.scrollThreshold ? 'visible' : 'hidden';
                                isScrolling = false;
                            });
                            isScrolling = true;
                        }
                    }, { passive: true });

                    backToTop.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    });
                },

                setupSmoothScroll() {
                    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                        anchor.addEventListener('click', (e) => {
                            e.preventDefault();
                            const href = anchor.getAttribute('href');
                            
                            if (href === '#' || !href) return;
                            
                            try {
                                const target = document.querySelector(href);
                                if (target) {
                                    const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                                    
                                    window.scrollTo({
                                        top: targetPosition,
                                        behavior: 'smooth'
                                    });
                                }
                            } catch (error) {
                                console.warn('Smooth scroll error:', error);
                            }
                        });
                    });
                }
            },

            linkController: {
                init() {
                    this.handleExternalLinks();
                },

                handleExternalLinks() {
                    const currentHostname = window.location.hostname;
                    const internalDomains = [
                        'wanwanbu.github.io',  // GitHub Pages 域名
                        'wanwanbu.us.kg',      // 你的自定义域名
                        currentHostname        // 当前域名
                    ];

                    document.querySelectorAll('a[href^="http"]').forEach(link => {
                        // 检查是否是内部链接
                        const isInternalLink = 
                            internalDomains.some(domain => link.href.includes(domain)) ||
                            link.href.includes('/categories/') || 
                            link.href.includes('/tags/') ||
                            link.href.includes('/posts/') ||
                            link.href.startsWith('/') ||
                            link.href.startsWith('#');

                        if (isInternalLink) {
                            // 内部链接在当前窗口打开
                            link.setAttribute('target', '_self');
                        } else {
                            // 外部链接在新窗口打开
                            link.setAttribute('target', '_blank');
                            link.setAttribute('rel', 'noopener noreferrer');
                        }
                    });
                }
            },

            performanceController: {
                init() {
                    this.setupIntersectionObserver();
                    this.deferNonCriticalResources();
                    this.setupErrorHandling();
                },

                setupIntersectionObserver() {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('is-visible');
                                observer.unobserve(entry.target);
                            }
                        });
                    }, {
                        rootMargin: '50px',
                        threshold: 0.1
                    });

                    document.querySelectorAll('.animate-on-scroll').forEach(el => {
                        observer.observe(el);
                    });
                },

                deferNonCriticalResources() {
                    if ('fonts' in document) {
                        document.fonts.ready.then(() => {
                            document.documentElement.classList.add('fonts-loaded');
                        });
                    }

                    const loadDeferredStyles = () => {
                        document.querySelectorAll('link[rel="preload"][as="style"]').forEach(link => {
                            link.rel = 'stylesheet';
                        });
                    };

                    if (window.requestIdleCallback) {
                        window.requestIdleCallback(loadDeferredStyles);
                    } else {
                        window.setTimeout(loadDeferredStyles, 0);
                    }
                },

                setupErrorHandling() {
                    window.onerror = (msg, url, lineNo, columnNo, error) => {
                        console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo, '\nColumn: ', columnNo, '\nError object: ', error);
                        return false;
                    };

                    window.addEventListener('unhandledrejection', event => {
                        console.error('Unhandled promise rejection:', event.reason);
                    });
                }
            },

            debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            },

            handleResize() {
                if (window.innerWidth > MainApp.config.mobileBreakpoint) {
                    this.navigationController.navbarMenu?.classList.remove('active');
                    this.navigationController.menuToggle?.classList.remove('active');
                }
            },

            handleVisibilityChange() {
                if (document.hidden) return;
                this.imageController.setupLazyLoading();
                this.performanceController.setupIntersectionObserver();
            }
        };

        MainApp.init();
    });
})();
