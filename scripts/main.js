document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    const allNavLinks = document.querySelectorAll('a[href^="#"]');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Touch/Drag Slider functionality
    const sliderWrapper = document.getElementById('slider-wrapper');
    const sliderTrack = document.getElementById('slider-track');
    const dotsContainer = document.getElementById('slider-dots');
    const slides = document.querySelectorAll('.service-slide');
    console.log('Number of slides found:', slides.length);

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
    
    function getSlideWidth() {
        const slide = document.querySelector('.service-slide');
        if (slide) {
            const sliderTrack = document.getElementById('slider-track');
            const computedStyle = window.getComputedStyle(sliderTrack);
            const gap = parseFloat(computedStyle.gap) || 24;
            return slide.offsetWidth + gap;
        }
        return 304; // fallback
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
        slideWidth = getSlideWidth();
        const offset = -currentSlide * slideWidth;
        sliderTrack.style.transform = `translateX(${offset}px)`;
        
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
        if (currentSlide < totalSlides - slidesToShow) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        setPositionByIndex();
        updateSlider();
    }

    function setPositionByIndex() {
        slideWidth = getSlideWidth();
        currentTranslate = currentSlide * -slideWidth;
        prevTranslate = currentTranslate;
        if (sliderTrack) {
            sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
        }
    }

    // Touch/Mouse events
    function getPositionX(event) {
        return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
    }

    function dragStart(event) {
        console.log('Drag started');
        startPos = getPositionX(event);
        isDragging = true;
        
        // Disable transitions during drag
        if (sliderTrack) {
            sliderTrack.style.transition = 'none';
            sliderTrack.classList.add('dragging');
        }
        
        // Prevent default behavior
        if (event.type === 'mousedown') {
            event.preventDefault();
        }
    }

    function dragMove(event) {
        if (!isDragging) return;
        
        event.preventDefault();
        const currentPosition = getPositionX(event);
        const diff = currentPosition - startPos;
        currentTranslate = prevTranslate + diff;
        
        // Bounds checks
        const maxTranslate = 0;
        const minTranslate = -(totalSlides - slidesToShow) * slideWidth;
        currentTranslate = Math.max(minTranslate, Math.min(maxTranslate, currentTranslate));
        
        // Apply the transform
        if (sliderTrack) {
            sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
        }
    }

    function dragEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        slideWidth = getSlideWidth();
        
        // Re-enable transitions
        if (sliderTrack) {
            sliderTrack.style.transition = 'transform 0.3s ease';
            sliderTrack.classList.remove('dragging');
        }
        
        const movedBy = currentTranslate - prevTranslate;
        
        // Determine if we should slide to next/prev
        if (movedBy < -100 && currentSlide < totalSlides - slidesToShow) {
            currentSlide++;
        } else if (movedBy > 100 && currentSlide > 0) {
            currentSlide--;
        }
        
        // Reset to current slide position
        setPositionByIndex();
        updateSlider();
    }

    // Event listeners
    if (sliderWrapper) {
        // Mouse events
        sliderWrapper.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        
        // Touch events
        sliderWrapper.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);
        
        // Prevent context menu
        sliderWrapper.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Auto-play slider
    let autoSlide = setInterval(nextSlide, 4000);

    // Pause on hover/touch
    if (sliderWrapper) {
        sliderWrapper.addEventListener('mouseenter', () => {
            clearInterval(autoSlide);
        });
        
        sliderWrapper.addEventListener('mouseleave', () => {
            if (!isDragging) {
                autoSlide = setInterval(nextSlide, 4000);
            }
        });
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        slidesToShow = getSlidesToShow();
        slideWidth = getSlideWidth();
        currentSlide = 0;
        createDots();
        setPositionByIndex();
        updateSlider();
    });

    // Initialize slider
    if (slides.length > 0) {
        setTimeout(() => {
            slideWidth = getSlideWidth();
            createDots();
            setPositionByIndex();
            updateSlider();
        }, 100);
    }
    
    // Form submission handler
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Show success message
            alert('Thank you for your inquiry! We will get back to you soon.');
            
            // Reset form
            this.reset();
        });
    }
    
    // Scroll animations for elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.certification-item, .portfolio-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Navbar scroll effect
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Service item hover effects
    const serviceItems = document.querySelectorAll('.service-slide');
    serviceItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Form field validation and styling
    const formFields = document.querySelectorAll('.contact-form input, .contact-form select, .contact-form textarea');
    formFields.forEach(field => {
        field.addEventListener('focus', function() {
            this.style.borderColor = '#FFD93D';
        });
        
        field.addEventListener('blur', function() {
            this.style.borderColor = '#e9ecef';
            
            // Validation
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#dc3545';
            }
        });
        
        // Real-time validation
        field.addEventListener('input', function() {
            if (this.hasAttribute('required') && this.value.trim()) {
                this.style.borderColor = '#28a745';
            }
        });
    });
    
    // Add CSS for scrolled navbar
    const style = document.createElement('style');
    style.textContent = `
        .navbar.scrolled {
            background-color: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(25px);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);

    /**
     * Clean Portfolio JavaScript with Image Gallery Support
     * Simple filtering, image galleries, and basic interactions
     */
    
    // Simple Portfolio object
    const CleanPortfolio = {
        init() {
            this.setupFiltering();
            this.setupImageClick();
            this.setupImageGallery();
            this.setupAnimations();
            this.setupCertificationAnimations();
            console.log('Clean Portfolio initialized');
        },

        // Setup image gallery functionality
        setupImageGallery() {
            const thumbnails = document.querySelectorAll('.thumbnail');
            
            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent modal from opening
                    
                    const projectItem = thumbnail.closest('.portfolio-item');
                    const mainImg = projectItem.querySelector('.gallery-main-img');
                    const newSrc = thumbnail.getAttribute('data-main');
                    const newAlt = thumbnail.getAttribute('alt');
                    
                    // Update main image
                    if (mainImg && newSrc) {
                        mainImg.src = newSrc;
                        mainImg.alt = newAlt;
                    }
                    
                    // Update active thumbnail
                    const allThumbnails = projectItem.querySelectorAll('.thumbnail');
                    allThumbnails.forEach(thumb => thumb.classList.remove('active'));
                    thumbnail.classList.add('active');
                });
            });
        },

        // Simple portfolio filtering
        setupFiltering() {
            const filterButtons = document.querySelectorAll('.filter-btn');
            const portfolioItems = document.querySelectorAll('.portfolio-item');

            filterButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    const filterValue = button.getAttribute('data-filter');
                    
                    // Filter items
                    portfolioItems.forEach(item => {
                        const categories = item.getAttribute('data-category');
                        const shouldShow = filterValue === 'all' || 
                                        categories.includes(filterValue);
                        
                        if (shouldShow) {
                            item.style.display = 'block';
                            item.classList.remove('hidden');
                        } else {
                            item.style.display = 'none';
                            item.classList.add('hidden');
                        }
                    });
                });
            });
        },

        // Simple image click handler
        setupImageClick() {
            const portfolioItems = document.querySelectorAll('.portfolio-item');
            
            portfolioItems.forEach(item => {
                // Handle clicks on main images (both single and gallery)
                const mainImage = item.querySelector('.gallery-main-img, .portfolio-image img');
                const imageContainer = item.querySelector('.main-image, .portfolio-image');
                
                if (imageContainer) {
                    imageContainer.addEventListener('click', (e) => {
                        if (mainImage) {
                            this.openImageModal(mainImage.src, mainImage.alt);
                        }
                    });
                }
            });
        },

        // Simple image modal
        openImageModal(src, alt) {
            const modal = document.createElement('div');
            modal.className = 'image-modal';
            modal.innerHTML = `
                <div class="modal-backdrop">
                    <button class="modal-close" aria-label="Close">&times;</button>
                    <img src="${src}" alt="${alt}" />
                </div>
            `;
            
            // Modal styles
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            const backdrop = modal.querySelector('.modal-backdrop');
            backdrop.style.cssText = `
                position: relative;
                max-width: 90%;
                max-height: 90%;
                text-align: center;
            `;
            
            const img = modal.querySelector('img');
            img.style.cssText = `
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 8px;
            `;
            
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn.style.cssText = `
                position: absolute;
                top: -3rem;
                right: 0;
                background: #FFD93D;
                color: #1a1a1a;
                border: none;
                width: 2.5rem;
                height: 2.5rem;
                border-radius: 50%;
                font-size: 1.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            
            document.body.appendChild(modal);
            
            // Animate in
            requestAnimationFrame(() => {
                modal.style.opacity = '1';
            });
            
            // Close handlers
            const closeModal = () => {
                modal.style.opacity = '0';
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
            };
            
            closeBtn.addEventListener('click', closeModal);
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) closeModal();
            });
            
            // Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        },

        // Simple scroll animations for portfolio
        setupAnimations() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe portfolio items
            const portfolioItems = document.querySelectorAll('.portfolio-item');
            portfolioItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = `all 0.6s ease ${index * 0.1}s`;
                observer.observe(item);
            });
        },

        // Certification animations
        setupCertificationAnimations() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe certification items
            const certificationItems = document.querySelectorAll('.certification-item');
            certificationItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px)';
                item.style.transition = `all 0.6s ease ${index * 0.15}s`;
                observer.observe(item);
            });
        }
    };

    // Initialize the clean portfolio
    CleanPortfolio.init();

    // Expose for external use
    window.CleanPortfolio = CleanPortfolio;

    // Certification hover effects
    const certificationItems = document.querySelectorAll('.certification-item');
    certificationItems.forEach(item => {
        const certLogo = item.querySelector('.cert-logo');
        
        item.addEventListener('mouseenter', function() {
            if (certLogo) {
                certLogo.style.transform = 'scale(1.1) rotate(5deg)';
                certLogo.style.transition = 'transform 0.3s ease';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            if (certLogo) {
                certLogo.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });

    // Enhanced scroll reveal animation for certifications section
    const certificationSection = document.querySelector('.certifications');
    if (certificationSection) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const header = entry.target.querySelector('.certifications-header');
                    const items = entry.target.querySelectorAll('.certification-item');
                    
                    // Animate header first
                    if (header) {
                        header.style.opacity = '1';
                        header.style.transform = 'translateY(0)';
                    }
                    
                    // Then animate items with stagger
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 200 + (index * 100));
                    });
                }
            });
        }, {
            threshold: 0.2
        });

        // Set initial states
        const header = certificationSection.querySelector('.certifications-header');
        if (header) {
            header.style.opacity = '0';
            header.style.transform = 'translateY(30px)';
            header.style.transition = 'all 0.6s ease';
        }

        sectionObserver.observe(certificationSection);
    }

    // Add dynamic typing effect to hero text (optional enhancement)
    const heroTitle = document.querySelector('.hero-text h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.style.opacity = '0';
        
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.animation = 'fadeInUp 1s ease-out';
        }, 500);
    }

    // Add CSS for additional animations
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(30px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideInLeft {
            0% {
                opacity: 0;
                transform: translateX(-50px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideInRight {
            0% {
                opacity: 0;
                transform: translateX(50px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .certification-item:nth-child(odd) {
            animation: slideInLeft 0.6s ease-out forwards;
        }

        .certification-item:nth-child(even) {
            animation: slideInRight 0.6s ease-out forwards;
        }

        /* Enhance button interactions */
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
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
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

    // Add intersection observer for certification logos to animate when visible
    const certLogos = document.querySelectorAll('.cert-logo img');
    const logoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, { threshold: 0.5 });

    certLogos.forEach(logo => {
        logo.style.opacity = '0';
        logoObserver.observe(logo);
    });
    
    console.log('Eng Hup Builders website initialized successfully');
});