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
    console.log('Number of slides found:', slides.length); // ADD THIS


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
        slideWidth = getSlideWidth(); // ADD THIS LINE
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
        console.log('Drag started'); // ADD THIS
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
        
        // ADD THESE BOUNDS CHECKS
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
        }, 100); // Add small delay
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
            
            // Here you would typically send the data to your server
            // Example: fetch('/submit-form', { method: 'POST', body: formData })
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
    const animatedElements = document.querySelectorAll('.service-item, .stat-box');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Counter animation for stats
    const counters = document.querySelectorAll('.stat-box strong');
    const counterOptions = {
        threshold: 0.5
    };
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
                const increment = target / 100;
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    
                    // Format the number based on original content
                    if (counter.textContent.includes('%')) {
                        counter.textContent = Math.floor(current) + '%';
                    } else if (counter.textContent.includes('+')) {
                        counter.textContent = Math.floor(current) + '+';
                    } else {
                        counter.textContent = Math.floor(current);
                    }
                }, 20);
                
                counterObserver.unobserve(counter);
            }
        });
    }, counterOptions);
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
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
    
    console.log('Eng Hup Builders website initialized successfully');
});