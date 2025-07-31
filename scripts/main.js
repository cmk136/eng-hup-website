document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Debounce function for scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 2. Throttle function for drag events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // Smooth scrolling for navigation links
    const allNavLinks = document.querySelectorAll('a[href^="#"]');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Touch/Drag Slider functionality - Optimized
    const sliderWrapper = document.getElementById('slider-wrapper');
    const sliderTrack = document.getElementById('slider-track');
    const dotsContainer = document.getElementById('slider-dots');
    const slides = document.querySelectorAll('.service-slide');

    let currentSlide = 0;
    let slidesToShow = getSlidesToShow();
    let totalSlides = slides.length;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let slideWidth = getSlideWidth(); 

    function getSlidesToShow() {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 768) return 2;
        if (window.innerWidth <= 1024) return 3;
        return 4;
    }
    
    // Optimized getSlideWidth function
    function getSlideWidth() {
        const slide = document.querySelector('.service-slide');
        if (slide) {
            const slideWidth = 240; // Fixed width from CSS
            const gap = 24; // Fixed gap from CSS
            return slideWidth + gap;
        }
        return 264;
    }

    function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const maxSlides = Math.max(1, totalSlides - slidesToShow + 1);
        
        for (let i = 0; i < maxSlides; i++) {
            const dot = document.createElement('div');
            dot.className = 'slider-dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateSlider() {
        if (!sliderTrack) return;
        const offset = -currentSlide * slideWidth;
        
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            sliderTrack.style.transform = `translate3d(${offset}px, 0, 0)`;
        });
        
        // Update dots
        const dots = document.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function goToSlide(slideIndex) {
        const maxSlide = totalSlides - slidesToShow;
        currentSlide = Math.max(0, Math.min(slideIndex, maxSlide));
        setPositionByIndex();
        updateSlider();
    }

    function nextSlide() {
        const maxSlide = totalSlides - slidesToShow;
        if (currentSlide < maxSlide) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        setPositionByIndex();
        updateSlider();
    }

    function setPositionByIndex() {
        currentTranslate = currentSlide * -slideWidth;
        prevTranslate = currentTranslate;
        if (sliderTrack) {
            requestAnimationFrame(() => {
                sliderTrack.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
            });
        }
    }

    // Optimized drag events with throttling
    function getPositionX(event) {
        return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
    }

    function dragStart(event) {
        startPos = getPositionX(event);
        isDragging = true;
        
        if (sliderTrack) {
            sliderTrack.style.transition = 'none';
            sliderTrack.classList.add('dragging');
        }
        
        if (event.type === 'mousedown') {
            event.preventDefault();
        }
    }

    // Throttled drag move for better performance
    const dragMove = throttle(function(event) {
        if (!isDragging) return;
        
        event.preventDefault();
        const currentPosition = getPositionX(event);
        const diff = currentPosition - startPos;
        currentTranslate = prevTranslate + diff;
        
        const maxTranslate = 0;
        const minTranslate = -(totalSlides - slidesToShow) * slideWidth;
        currentTranslate = Math.max(minTranslate, Math.min(maxTranslate, currentTranslate));
        
        if (sliderTrack) {
            requestAnimationFrame(() => {
                sliderTrack.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
            });
        }
    }, 16); // ~60fps

    function dragEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        
        if (sliderTrack) {
            sliderTrack.style.transition = 'transform 0.3s ease';
            sliderTrack.classList.remove('dragging');
        }
        
        const movedBy = currentTranslate - prevTranslate;
        
        if (movedBy < -50 && currentSlide < totalSlides - slidesToShow) {
            currentSlide++;
        } else if (movedBy > 50 && currentSlide > 0) {
            currentSlide--;
        }
        
        setPositionByIndex();
        updateSlider();
    }

    // Add manual navigation arrows
    function addNavigationArrows() {
        const sliderContainer = document.querySelector('.slider-container');
        
        // Remove existing arrows if any
        const existingArrows = sliderContainer.querySelectorAll('.slider-arrow');
        existingArrows.forEach(arrow => arrow.remove());
        
        // Create navigation arrows with better styling
        const prevArrow = document.createElement('button');
        prevArrow.className = 'slider-arrow slider-prev';
        prevArrow.innerHTML = '&#8249;';
        prevArrow.setAttribute('aria-label', 'Previous slide');
        
        const nextArrow = document.createElement('button');
        nextArrow.className = 'slider-arrow slider-next';
        nextArrow.innerHTML = '&#8250;';
        nextArrow.setAttribute('aria-label', 'Next slide');
        
        // Add event listeners with improved logic
        prevArrow.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentSlide > 0) {
                currentSlide--;
                setPositionByIndex();
                updateSlider();
                
                // Reset autoplay
                clearInterval(autoSlide);
                autoSlide = setInterval(nextSlide, 6000);
            }
        });
        
        nextArrow.addEventListener('click', (e) => {
            e.preventDefault();
            const maxSlide = totalSlides - slidesToShow;
            if (currentSlide < maxSlide) {
                currentSlide++;
                setPositionByIndex();
                updateSlider();
                
                // Reset autoplay
                clearInterval(autoSlide);
                autoSlide = setInterval(nextSlide, 6000);
            }
        });
        
        // Add arrows to container only on desktop
        if (window.innerWidth > 768) {
            sliderContainer.appendChild(prevArrow);
            sliderContainer.appendChild(nextArrow);
        }
        
        // Update arrow visibility based on current slide
        function updateArrowStates() {
            if (window.innerWidth > 768) {
                const maxSlide = totalSlides - slidesToShow;
                
                if (prevArrow) {
                    prevArrow.style.opacity = currentSlide === 0 ? '0.5' : '1';
                    prevArrow.style.cursor = currentSlide === 0 ? 'not-allowed' : 'pointer';
                }
                
                if (nextArrow) {
                    nextArrow.style.opacity = currentSlide >= maxSlide ? '0.5' : '1';
                    nextArrow.style.cursor = currentSlide >= maxSlide ? 'not-allowed' : 'pointer';
                }
            }
        }
        
        // Call updateArrowStates when slider updates
        const originalUpdateSlider = updateSlider;
        updateSlider = function() {
            originalUpdateSlider();
            updateArrowStates();
        };
        
        // Initial arrow state
        updateArrowStates();
    }

    // Event listeners
    if (sliderWrapper) {
        sliderWrapper.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        
        sliderWrapper.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);
        
        sliderWrapper.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Auto-play slider (reduced frequency)
    let autoSlide = setInterval(nextSlide, 6000); // Increased from 4000ms

    if (sliderWrapper) {
        sliderWrapper.addEventListener('mouseenter', () => {
            clearInterval(autoSlide);
        });
        
        sliderWrapper.addEventListener('mouseleave', () => {
            if (!isDragging) {
                autoSlide = setInterval(nextSlide, 6000);
            }
        });
    }

    // Debounced window resize
    const debouncedResize = debounce(() => {
        slidesToShow = getSlidesToShow();
        slideWidth = getSlideWidth();
        currentSlide = 0;
        createDots();
        setPositionByIndex();
        updateSlider();
    }, 250);

    window.addEventListener('resize', debouncedResize);

    // Initialize slider
    if (slides.length > 0) {
        setTimeout(() => {
            slideWidth = getSlideWidth();
            createDots();
            setPositionByIndex();
            updateSlider();
            addNavigationArrows();
        }, 100);
    }
    
    // Optimized scroll animations with Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                });
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.certification-item, .portfolio-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Debounced navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    const debouncedScroll = debounce(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 10);
    
    window.addEventListener('scroll', debouncedScroll, { passive: true });
    
    // Simplified service item hover effects (remove from mobile)
    if (window.innerWidth > 768) {
        const serviceItems = document.querySelectorAll('.service-slide');
        serviceItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) translateZ(0)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) translateZ(0)';
            });
        });
    }
    
    // Optimized form field validation
    const formFields = document.querySelectorAll('.contact-form input, .contact-form select, .contact-form textarea');
    formFields.forEach(field => {
        field.addEventListener('focus', function() {
            this.style.borderColor = '#FFD93D';
        });
        
        field.addEventListener('blur', function() {
            this.style.borderColor = '#e9ecef';
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#dc3545';
            }
        });
        
        // Debounced input validation
        const debouncedValidation = debounce(function() {
            if (this.hasAttribute('required') && this.value.trim()) {
                this.style.borderColor = '#28a745';
            }
        }, 300);
        
        field.addEventListener('input', debouncedValidation);
    });

    // Simplified Portfolio object - removed heavy animations
    const CleanPortfolio = {
        init() {
            this.setupFiltering();
            this.setupImageGallery();
            this.setupSimpleAnimations();
        },

        setupImageGallery() {
            const thumbnails = document.querySelectorAll('.thumbnail');
            
            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    const projectItem = thumbnail.closest('.portfolio-item');
                    const mainImg = projectItem.querySelector('.gallery-main-img');
                    const newSrc = thumbnail.getAttribute('data-main');
                    const newAlt = thumbnail.getAttribute('alt');
                    
                    if (mainImg && newSrc) {
                        mainImg.src = newSrc;
                        mainImg.alt = newAlt;
                    }
                    
                    const allThumbnails = projectItem.querySelectorAll('.thumbnail');
                    allThumbnails.forEach(thumb => thumb.classList.remove('active'));
                    thumbnail.classList.add('active');
                });
            });
        },

        setupFiltering() {
            const filterButtons = document.querySelectorAll('.filter-btn');
            const portfolioItems = document.querySelectorAll('.portfolio-item');

            filterButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    const filterValue = button.getAttribute('data-filter');
                    
                    portfolioItems.forEach(item => {
                        const categories = item.getAttribute('data-category');
                        const shouldShow = filterValue === 'all' || categories.includes(filterValue);
                        
                        item.style.display = shouldShow ? 'block' : 'none';
                    });
                });
            });
        },

        setupSimpleAnimations() {
            // Simplified animations only on desktop
            if (window.innerWidth > 768) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            requestAnimationFrame(() => {
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translateY(0)';
                            });
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });

                const portfolioItems = document.querySelectorAll('.portfolio-item');
                portfolioItems.forEach(item => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    item.style.transition = 'all 0.4s ease';
                    observer.observe(item);
                });
            }
        }
    };

    CleanPortfolio.init();

    // Reduced frequency certification hover effects (desktop only)
    if (window.innerWidth > 768) {
        const certificationItems = document.querySelectorAll('.certification-item');
        certificationItems.forEach(item => {
            const certLogo = item.querySelector('.cert-logo');
            
            item.addEventListener('mouseenter', function() {
                if (certLogo) {
                    certLogo.style.transform = 'scale(1.05) translateZ(0)';
                    certLogo.style.transition = 'transform 0.2s ease';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                if (certLogo) {
                    certLogo.style.transform = 'scale(1) translateZ(0)';
                }
            });
        });
    }

    // Enhanced scroll reveal animation for certifications section (simplified)
    const certificationSection = document.querySelector('.certifications');
    if (certificationSection && window.innerWidth > 768) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const header = entry.target.querySelector('.certifications-header');
                    const items = entry.target.querySelectorAll('.certification-item');
                    
                    if (header) {
                        requestAnimationFrame(() => {
                            header.style.opacity = '1';
                            header.style.transform = 'translateY(0)';
                        });
                    }
                    
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            });
                        }, 100 + (index * 50)); // Reduced stagger
                    });
                    
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        const header = certificationSection.querySelector('.certifications-header');
        if (header) {
            header.style.opacity = '0';
            header.style.transform = 'translateY(30px)';
            header.style.transition = 'all 0.4s ease';
        }

        sectionObserver.observe(certificationSection);
    }

    // Lazy loading for images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Add CSS for additional optimizations
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        .navbar.scrolled {
            background-color: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(25px);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        /* Optimized button effects - remove expensive gradients */
        .cta-button, .submit-btn, .filter-btn {
            position: relative;
            overflow: hidden;
        }

        .cta-button::before, .submit-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.2); /* Simplified gradient */
            transition: left 0.3s ease; /* Reduced from 0.5s */
        }

        .cta-button:hover::before, .submit-btn:hover::before {
            left: 100%;
        }

        /* Enhanced mobile menu indicator */
        @media (max-width: 768px) {
            .nav-center {
                position: fixed;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                border-radius: 20px;
                padding: 1rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .nav-center.mobile-menu-open {
                opacity: 1;
                visibility: visible;
            }

            .nav-links {
                flex-direction: column;
                gap: 1rem;
            }
        }
    `;
    document.head.appendChild(additionalStyles);

    // Mobile menu toggle functionality
    if (window.innerWidth <= 768) {
        const logo = document.querySelector('.logo');
        const navCenter = document.querySelector('.nav-center');
        
        if (logo && navCenter) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                navCenter.classList.toggle('mobile-menu-open');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navCenter.contains(e.target) && !logo.contains(e.target)) {
                    navCenter.classList.remove('mobile-menu-open');
                }
            });
        }
    }

    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.complete) {
            img.style.opacity = '0';
            img.addEventListener('load', () => {
                img.style.transition = 'opacity 0.3s ease';
                img.style.opacity = '1';
            });
        }
    });

    // Add intersection observer for certification logos to animate when visible (desktop only)
    if (window.innerWidth > 768) {
        const certLogos = document.querySelectorAll('.cert-logo img');
        const logoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    });
                    logoObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        certLogos.forEach(logo => {
            logo.style.opacity = '0';
            logo.style.transform = 'translateY(20px)';
            logo.style.transition = 'all 0.4s ease';
            logoObserver.observe(logo);
        });
    }
    
    console.log('Optimized Eng Hup Builders website initialized');
});