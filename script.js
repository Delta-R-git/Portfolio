/**
 * Delta R Portfolio - Interactive Script
 * Features: Physics-Lag Cursor, Magnetic Pull, Story Scroll Tracking, Smooth Theme Morph
 */

function initAll() {
    initCursor();
    initTheme();
    initMagneticElements();
    initScrollTracking();
    initRevealOnScroll();
    initContactForm();
    initSmoothScroll();
    initSkillsSlider();
    initProjectAutoSlide();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

/* ==========================================================================
   1. PHYSICS-LAG CUSTOM CURSOR
   ========================================================================== */
function initCursor() {
    const cursor = document.getElementById('custom-cursor');
    const dot = document.getElementById('cursor-dot');
    const label = cursor.querySelector('.cursor-label');

    if (!cursor || !dot) return;

    // Mouse coordinates (Target position)
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    // Current cursor outline coordinates (Lagging position)
    let cursorCoords = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    // Current cursor dot coordinates (Minor lag for micro-physics)
    let dotCoords = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const lagOuter = 0.12; // Outer ring lag factor
    const lagInner = 0.3;  // Inner dot lag factor
    let isHidden = true;

    let touchTimeout = null;
    let isTouchDevice = false;

    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
        // Ignore simulated mouse events on touch devices
        if (isTouchDevice) return;

        if (isHidden) {
            cursor.classList.remove('hidden');
            dot.classList.remove('hidden');
            isHidden = false;
        }
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Touch coordinate tracking for mobile
    const handleTouch = (e) => {
        isTouchDevice = true;
        if (e.touches && e.touches.length > 0) {
            cursor.classList.remove('hidden');
            dot.classList.remove('hidden');
            isHidden = false;

            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;

            // Stop any pending fade triggers while dragging
            if (touchTimeout) clearTimeout(touchTimeout);
        }
    };

    const resetTouchTimeout = () => {
        // Immediately snap back any stuck magnetic elements when touch ends
        const magneticElements = document.querySelectorAll('.magnetic');
        magneticElements.forEach(el => {
            el.style.transform = 'translate3d(0, 0, 0)';
            el.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';

            const text = el.querySelector('span, svg, .logo-text');
            if (text) {
                text.style.transform = 'translate3d(0, 0, 0)';
                text.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            }
        });

        if (touchTimeout) clearTimeout(touchTimeout);
        touchTimeout = setTimeout(() => {
            cursor.classList.add('hidden');
            dot.classList.add('hidden');
            isHidden = true;

            // Remove hovering/viewing states and restore default label
            cursor.classList.remove('hovering');
            cursor.classList.remove('viewing');
            label.textContent = 'VIEW';
        }, 500); // Fade out after exactly half a second
    };

    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('touchend', resetTouchTimeout, { passive: true });

    // Handle mouse leaving and entering window
    document.addEventListener('mouseleave', () => {
        if (isTouchDevice) return;
        cursor.classList.add('hidden');
        dot.classList.add('hidden');
        isHidden = true;
    });

    document.addEventListener('mouseenter', () => {
        if (isTouchDevice) return;
        cursor.classList.remove('hidden');
        dot.classList.remove('hidden');
        isHidden = false;
    });

    // Animation Loop
    function updatePhysics() {
        // Outer ring physics
        cursorCoords.x += (mouse.x - cursorCoords.x) * lagOuter;
        cursorCoords.y += (mouse.y - cursorCoords.y) * lagOuter;
        cursor.style.transform = `translate3d(${cursorCoords.x}px, ${cursorCoords.y}px, 0)`;

        // Inner dot physics
        dotCoords.x += (mouse.x - dotCoords.x) * lagInner;
        dotCoords.y += (mouse.y - dotCoords.y) * lagInner;
        dot.style.transform = `translate3d(${dotCoords.x}px, ${dotCoords.y}px, 0)`;

        requestAnimationFrame(updatePhysics);
    }
    requestAnimationFrame(updatePhysics);

    // Interactive Hover Handlers
    const setupHovers = () => {
        // Standard buttons, links, tags, and theme toggle
        const interactiveElements = document.querySelectorAll('a, button, .magnetic, .skill-tag, .node-indicator');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
                const hoverText = el.getAttribute('data-hover-label') || 'TAP';
                label.textContent = hoverText;
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
                label.textContent = 'VIEW';
            });
        });

        // Project images
        const projectContainers = document.querySelectorAll('.cursor-hover-view');
        projectContainers.forEach(container => {
            container.addEventListener('mouseenter', () => {
                cursor.classList.add('viewing');
                label.textContent = 'VIEW';
            });
            container.addEventListener('mouseleave', () => {
                cursor.classList.remove('viewing');
            });
        });
    };

    setupHovers();

    // Re-bind hover events on dynamic adjustments
    window.addEventListener('resize', setupHovers);
}

/* ==========================================================================
   2. MAGNETIC INTERACTION EFFECT
   ========================================================================== */
function initMagneticElements() {
    const magneticElements = document.querySelectorAll('.magnetic');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            // Mouse distance from element center
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);

            // Pull ratio (higher = stronger attraction)
            const strength = this.classList.contains('btn') ? 0.35 : 0.25;

            // Apply translation to element
            this.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;

            // Sub-element pull (inner text shifts slightly more for 3D depth)
            const text = this.querySelector('span, svg, .logo-text');
            if (text) {
                text.style.transform = `translate3d(${x * strength * 0.4}px, ${y * strength * 0.4}px, 0)`;
            }
        });

        el.addEventListener('mouseleave', function () {
            // Smoothly snap back to origin
            this.style.transform = 'translate3d(0, 0, 0)';
            this.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';

            const text = this.querySelector('span, svg, .logo-text');
            if (text) {
                text.style.transform = 'translate3d(0, 0, 0)';
                text.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            }
        });

        el.addEventListener('mouseenter', function () {
            this.style.transition = 'none';
            const text = this.querySelector('span, svg, .logo-text');
            if (text) text.style.transition = 'none';
        });
    });
}

/* ==========================================================================
   3. STYLISH THEME MORPH (DARK / LIGHT)
   ========================================================================== */
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Check saved settings or preferred color scheme
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
        document.body.className = savedTheme;
    } else {
        // Default to dark mode
        document.body.className = 'dark-theme';
    }

    toggleBtn.addEventListener('click', (e) => {
        // Check current setting
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
        const nextTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';

        // Add circular theme ripple effect if supported (Web Animations API)
        createThemeRipple(e.clientX, e.clientY, nextTheme);
    });

    function createThemeRipple(x, y, theme) {
        // Fallback for keyboard events where click coordinates are undefined
        x = (x !== undefined && x !== null) ? x : window.innerWidth / 2;
        y = (y !== undefined && y !== null) ? y : window.innerHeight / 2;

        // Create full screen temporary div for clip-path ripple
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.top = '0';
        ripple.style.left = '0';
        ripple.style.width = '100vw';
        ripple.style.height = '100vh';
        ripple.style.zIndex = '99';
        ripple.style.pointerEvents = 'none';

        // Define colors based on targeted theme
        if (theme === 'light-theme') {
            ripple.style.backgroundColor = '#fcfcfd';
        } else {
            ripple.style.backgroundColor = '#08090a';
        }

        // Set initial clip-path circle centered on user mouse click coordinates
        ripple.style.clipPath = `circle(0px at ${x}px ${y}px)`;
        document.body.appendChild(ripple);

        // Animate the circle clip path scale using standard Web Animation API
        const duration = 800;
        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const animation = ripple.animate(
            [
                { clipPath: `circle(0px at ${x}px ${y}px)` },
                { clipPath: `circle(${radius}px at ${x}px ${y}px)` }
            ],
            {
                duration: duration,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'forwards'
            }
        );

        animation.onfinish = () => {
            // Swap official body class
            document.body.className = theme;
            localStorage.setItem('portfolio-theme', theme);
            // Remove ripple layer
            ripple.remove();
        };
    }
}

/* ==========================================================================
   4. SCROLL PROGRESS & STORY CHAPTER TRACKING
   ========================================================================== */
function initScrollTracking() {
    const sections = document.querySelectorAll('.story-section');
    const dots = document.querySelectorAll('.story-dot-link');
    const progressBar = document.querySelector('.story-progress');
    const timelineProgressBar = document.querySelector('.timeline-progress-line');
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    const creationsSection = document.querySelector('.creations-section');
    const track = document.querySelector('.projects-horizontal-track');

    if (!sections.length) return;

    // Track vertical scrolling and update sidebar progress bar
    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progressPercentage = (window.pageYOffset / totalHeight) * 100;

        if (progressBar) {
            progressBar.style.height = `${progressPercentage}%`;
        }

        // Horizontal Creations Translation (Desktop only: width > 1024)
        if (creationsSection && track && window.innerWidth > 1024) {
            const rect = creationsSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top <= 0 && rect.bottom >= windowHeight) {
                const scrollableDistance = rect.height - windowHeight;
                const progress = -rect.top / scrollableDistance;

                const trackWidth = track.scrollWidth;
                const maxTranslate = trackWidth - window.innerWidth;

                const translateX = progress * maxTranslate;
                track.style.transform = `translate3d(-${translateX}px, 0, 0)`;
            } else if (rect.top > 0) {
                track.style.transform = `translate3d(0, 0, 0)`;
            } else if (rect.bottom < windowHeight) {
                const trackWidth = track.scrollWidth;
                const maxTranslate = trackWidth - window.innerWidth;
                track.style.transform = `translate3d(-${maxTranslate}px, 0, 0)`;
            }
        }

        // Timeline Node Line Progress calculation (Section 4)
        if (timelineWrapper && timelineProgressBar) {
            const rect = timelineWrapper.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Calculate how far down the timeline container is scrolled relative to the viewport
            if (rect.top < windowHeight && rect.bottom > 0) {
                const timelineStart = rect.top - windowHeight;
                const timelineLength = rect.height;
                const scrollProgress = -timelineStart / (timelineLength - windowHeight / 2);

                const percentage = Math.min(Math.max(scrollProgress * 100, 0), 100);
                timelineProgressBar.style.height = `${percentage}%`;
            }
        }
    });

    // Story Chapter Switch Tracker (IntersectionObserver)
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -40% 0px', // Trigger when section occupies the main viewport portion
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const chapterIndex = entry.target.getAttribute('data-chapter');

                // Clear active states on story tracker sidebar
                dots.forEach(dot => dot.classList.remove('active'));

                // Set active target dot
                const activeDot = document.getElementById(`chapter-dot-${chapterIndex}`);
                if (activeDot) {
                    activeDot.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
}

/* ==========================================================================
   5. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initRevealOnScroll() {
    const items = document.querySelectorAll('.reveal-item');
    if (!items.length) return;

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Introduce delay if specified on element style, else trigger
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target); // Trigger only once
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.05
    });

    items.forEach((item, index) => {
        // Stagger list elements or cards based on index if siblings
        const delay = (index % 3) * 100;
        item.style.transitionDelay = `${delay}ms`;
        revealObserver.observe(item);
    });
}

/* ==========================================================================
   6. CONTACT FORM SUBMISSION
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('user-name');
        const emailInput = document.getElementById('user-email');
        const messageInput = document.getElementById('user-message');
        const submitBtn = form.querySelector('.btn-submit');
        const originalBtnText = submitBtn.querySelector('span').textContent;

        const name = nameInput.value;
        const email = emailInput.value;
        const message = messageInput.value;

        // Build mailto URL prefilled with form details
        const subject = encodeURIComponent(`Delta_R Portfolio Inquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        const mailtoLink = `mailto:rishal@unix2.com,rishalmohammed0k@gmail.com,rishalgamer0@gmail.com?subject=${subject}&body=${body}`;

        // Trigger the user's local email application
        window.location.href = mailtoLink;

        // Visual loading state on submit
        submitBtn.querySelector('span').textContent = 'Transmission Sent!';
        submitBtn.classList.add('success');
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        submitBtn.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.25)';

        // Clear values
        setTimeout(() => {
            nameInput.value = '';
            emailInput.value = '';
            messageInput.value = '';

            // Revert submit button styling
            setTimeout(() => {
                submitBtn.querySelector('span').textContent = originalBtnText;
                submitBtn.classList.remove('success');
                submitBtn.style.background = '';
                submitBtn.style.boxShadow = '';
            }, 3000);
        }, 1000);
    });
}

/* ==========================================================================
   7. EXPLICIT SMOOTH SCROLL WITH OFFSET
   ========================================================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Determine if we need to offset for fixed header
                const header = document.querySelector('.main-header');
                const headerHeight = header ? header.offsetHeight : 0;

                // Calculate target position
                const currentScroll = window.pageYOffset || window.scrollY || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + currentScroll - headerHeight;

                // Manual animation frame scroll to guarantee smooth scrolling on all OS/settings
                smoothScrollTo(targetPosition, 800);

                // Update active chapter link states
                const chapterIndex = targetElement.getAttribute('data-chapter');
                if (chapterIndex !== null) {
                    const dots = document.querySelectorAll('.story-dot-link');
                    dots.forEach(dot => dot.classList.remove('active'));
                    const activeDot = document.getElementById(`chapter-dot-${chapterIndex}`);
                    if (activeDot) activeDot.classList.add('active');
                }
            }
        });
    });
}

function smoothScrollTo(targetY, duration = 800) {
    const startY = window.pageYOffset || window.scrollY;
    const difference = targetY - startY;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percent = Math.min(progress / duration, 1);

        // Easing: easeOutQuart
        const ease = 1 - Math.pow(1 - percent, 4);

        window.scrollTo(0, startY + difference * ease);

        if (progress < duration) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

/* ==========================================================================
   8. TECHNICAL ARCHETYPES SWIPABLE INFINITY SLIDER
   ========================================================================== */
function initSkillsSlider() {
    const viewport = document.querySelector('.skills-slider-viewport');
    const track = document.querySelector('.skills-flex');
    if (!viewport || !track) return;

    // Only activate slider on mobile views (<= 768px)
    if (window.innerWidth > 768) {
        return;
    }

    // Duplicate the skill tags to enable seamless infinite scrolling
    const tags = Array.from(track.children);
    tags.forEach(tag => {
        const clone = tag.cloneNode(true);
        track.appendChild(clone);
    });

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let halfWidth = 0;

    function updateWidths() {
        track.style.animation = 'none';
        track.style.transform = 'none';
        halfWidth = track.scrollWidth / 2;
        track.style.animation = '';
    }

    setTimeout(updateWidths, 100);
    window.addEventListener('resize', updateWidths);

    // Drag / Touch Events
    viewport.addEventListener('mousedown', dragStart);
    viewport.addEventListener('touchstart', dragStart, { passive: true });
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, { passive: false });
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);

    // Standard magnetic handler rebinding for the cloned tags
    const setupClonesMagnetic = () => {
        const customCursor = document.getElementById('custom-cursor');
        const cursorLabel = customCursor ? customCursor.querySelector('.cursor-label') : null;

        // Re-find all elements including clones
        const interactiveClones = track.querySelectorAll('.skill-tag');
        interactiveClones.forEach(el => {
            // Remove duplicates to prevent double binding
            el.replaceWith(el.cloneNode(true));
        });

        // Rebind handlers
        const freshTags = track.querySelectorAll('.skill-tag');
        freshTags.forEach(el => {
            // Re-bind hover for cursor
            el.addEventListener('mouseenter', () => {
                if (customCursor) customCursor.classList.add('hovering');
                if (cursorLabel) cursorLabel.textContent = el.getAttribute('data-hover-label') || 'TAP';
            });
            el.addEventListener('mouseleave', () => {
                if (customCursor) customCursor.classList.remove('hovering');
                if (cursorLabel) cursorLabel.textContent = 'VIEW';
            });

            // Re-bind magnetic pull
            el.addEventListener('mousemove', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - (rect.width / 2);
                const y = e.clientY - rect.top - (rect.height / 2);
                const strength = 0.25;
                this.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
            });
            el.addEventListener('mouseleave', function () {
                this.style.transform = 'translate3d(0, 0, 0)';
                this.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            });
            el.addEventListener('mouseenter', function () {
                this.style.transition = 'none';
            });
        });
    };
    setTimeout(setupClonesMagnetic, 200);

    function dragStart(e) {
        isDragging = true;
        startX = getPositionX(e);

        // Pause the CSS animation
        track.style.animationPlayState = 'paused';

        const style = window.getComputedStyle(track);
        const matrix = new WebKitCSSMatrix(style.transform);
        currentTranslate = matrix.m41;
        prevTranslate = currentTranslate;
    }

    function dragMove(e) {
        if (!isDragging) return;

        const currentX = getPositionX(e);
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;

        // Wrap around boundary coordinates
        if (currentTranslate > 0) {
            currentTranslate -= halfWidth;
            startX += halfWidth;
        } else if (currentTranslate < -halfWidth) {
            currentTranslate += halfWidth;
            startX -= halfWidth;
        }

        track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;

        if (e.type === 'touchmove') {
            e.preventDefault();
        }
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;

        // Clean inline transform and restore marquee playState
        track.style.transform = '';
        track.style.animationPlayState = 'running';
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    }
}

/* ==========================================================================
   9. MOBILE PROJECT-CARD AUTO-SLIDER (EVERY 5 SEC)
   ========================================================================== */
function initProjectAutoSlide() {
    const viewport = document.querySelector('.horizontal-scroll-viewport');
    if (!viewport) return;

    let slideInterval = null;
    let isUserInteracting = false;
    let interactionTimeout = null;

    function startAutoSlide() {
        if (slideInterval) clearInterval(slideInterval);

        slideInterval = setInterval(() => {
            // Only slide on mobile/tablet views where width <= 1024px
            if (window.innerWidth > 1024 || isUserInteracting) return;

            const cards = viewport.querySelectorAll('.project-card-horizontal');
            if (!cards.length) return;

            const viewportWidth = viewport.clientWidth;
            const scrollLeft = viewport.scrollLeft;

            // Find the current active project card
            let activeIndex = 0;
            let minDiff = Infinity;
            cards.forEach((card, idx) => {
                const cardOffsetLeft = card.offsetLeft;
                const diff = Math.abs(cardOffsetLeft - scrollLeft);
                if (diff < minDiff) {
                    minDiff = diff;
                    activeIndex = idx;
                }
            });

            // Calculate next index, looping back to start at the end
            const nextIndex = (activeIndex + 1) % cards.length;
            const nextCard = cards[nextIndex];

            if (nextCard) {
                // Smoothly slide to center next card
                viewport.scrollTo({
                    left: nextCard.offsetLeft - (viewportWidth - nextCard.clientWidth) / 2,
                    behavior: 'smooth'
                });
            }
        }, 5000);
    }

    // Intercept scroll/touch inputs to suspend auto sliding temporarily
    function suspendSlide() {
        isUserInteracting = true;
        if (interactionTimeout) clearTimeout(interactionTimeout);

        interactionTimeout = setTimeout(() => {
            isUserInteracting = false;
        }, 8000); // Resume auto slide after 8 seconds of absolute silence
    }

    viewport.addEventListener('scroll', suspendSlide, { passive: true });
    viewport.addEventListener('touchstart', suspendSlide, { passive: true });

    // Initial trigger if viewport is active
    if (window.innerWidth <= 1024) {
        startAutoSlide();
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 1024) {
            startAutoSlide();
        } else {
            if (slideInterval) {
                clearInterval(slideInterval);
                slideInterval = null;
            }
        }
    });
}

