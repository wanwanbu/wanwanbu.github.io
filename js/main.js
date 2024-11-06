// 使用立即执行函数表达式(IIFE)创建独立作用域
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const MainApp = {
            // 配置参数
            config: {
                scrollThreshold: 300,
                throttleDelay: 200,
                animationDuration: 500,
                mobileBreakpoint: 768
            },

            // 初始化
            init() {
                this.initControllers();
                this.bindEvents();
            },

            // 初始化所有控制器
            initControllers() {
                this.imageController.init();
                this.navigationController.init();
                this.scrollController.init();
                this.linkController.init();
                this.performanceController.init();
            },

            // 绑定全局事件
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

            // 图片处理控制器
            imageController: {
                init() {
                    this.setupLazyLoading();
                    this.handleImageErrors();
                },

                setupLazyLoading() {
                    if (!('IntersectionObserver' in window)) {
                        this.fallbackLazyLoad();
                        return;
                    }

                    const imageObserver = new IntersectionObserver(
                        (entries, observer) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    const img = entry.target;
                                    this.loadImage(img);
                                    observer.unobserve(img);
                                }
                            });
                        },
                        {
                            rootMargin: '50px 0px',
                            threshold: 0.01
                        }
                    );

                    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                        imageObserver.observe(img);
                    });
                },

                loadImage(img) {
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                        img.style.animation = 'fadeIn 0.5s ease-out';
                    }, { once: true });

                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                },

                handleImageErrors() {
                    document.querySelectorAll('img').forEach(img => {
                        img.addEventListener('error', () => {
                            img.src = '/img/error.jpg';
                            img.classList.add('error');
                        });
                    });
                },

                fallbackLazyLoad() {
                    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                    });
                }
            },

            // 导航控制器
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

            // 滚动控制器
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
                            
                            // 检查href是否只包含#或为空
                            if (href === '#' || !href) return;
                            
                            try {
                                const target = document.querySelector(href);
                                if (target) {
                                    // 添加滚动偏移量补偿导航栏高度
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

            // 链接控制器
            linkController: {
                init() {
                    this.handleExternalLinks();
                },

                handleExternalLinks() {
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

            // 性能控制器
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
                    // 延迟加载字体
                    if ('fonts' in document) {
                        document.fonts.ready.then(() => {
                            document.documentElement.classList.add('fonts-loaded');
                        });
                    }

                    // 延迟加载非关键CSS
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

            // 工具方法
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
                // 处理窗口大小变化
                if (window.innerWidth > MainApp.config.mobileBreakpoint) {
                    this.navigationController.navbarMenu?.classList.remove('active');
                    this.navigationController.menuToggle?.classList.remove('active');
                }
            },

            handleVisibilityChange() {
                // 处理页面可见性变化
                if (document.hidden) return;
                
                // 重新初始化一些功能
                this.imageController.setupLazyLoading();
                this.performanceController.setupIntersectionObserver();
            }
        };

        // 启动应用
        MainApp.init();
    });
})();