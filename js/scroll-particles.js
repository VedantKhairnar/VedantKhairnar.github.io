// Scroll-Reactive Particle System
(function() {
    'use strict';

    const ScrollParticles = {
        canvas: null,
        ctx: null,
        particles: [],
        mouse: { x: 0, y: 0, vx: 0, vy: 0 },
        lastMouse: { x: 0, y: 0 },
        scrollY: 0,
        lastScrollY: 0,
        scrollVelocity: 0,
        active: false,
        
        config: {
            particleCount: 50,
            particleSize: 2,
            particleSpeed: 1,
            mouseRadius: 100,
            scrollThreshold: 0, // Pixels from top before activating
            colors: {
                default: 'rgba(238, 238, 238, 0.6)',
                about: 'rgba(100, 200, 255, 0.6)',
                skills: 'rgba(150, 255, 150, 0.6)',
                projects: 'rgba(255, 150, 200, 0.6)',
                contact: 'rgba(255, 200, 100, 0.6)'
            }
        },

        init: function() {
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'scroll-particles';
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 99;
                opacity: 0;
                transition: opacity 0.5s;
            `;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            // Set canvas size
            this.resize();

            // Initialize particles
            this.createParticles();

            // Event listeners
            window.addEventListener('resize', this.resize.bind(this));
            window.addEventListener('scroll', this.onScroll.bind(this));
            window.addEventListener('mousemove', this.onMouseMove.bind(this));

            // Start animation loop
            this.animate();

            console.log('Scroll particles initialized');
        },

        createParticles: function() {
            this.particles = [];
            for (let i = 0; i < this.config.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * this.config.particleSpeed,
                    vy: (Math.random() - 0.5) * this.config.particleSpeed,
                    size: Math.random() * this.config.particleSize + 1,
                    baseSize: Math.random() * this.config.particleSize + 1,
                    color: this.config.colors.default,
                    life: 1
                });
            }
        },

        resize: function() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },

        onScroll: function() {
            this.scrollY = window.pageYOffset || document.documentElement.scrollTop;
            this.scrollVelocity = this.scrollY - this.lastScrollY;
            this.lastScrollY = this.scrollY;

            // Activate particles after hero section
            const heroHeight = window.innerHeight;
            if (this.scrollY > heroHeight * 0.8 && !this.active) {
                this.active = true;
                this.canvas.style.opacity = '1';
            } else if (this.scrollY <= heroHeight * 0.5 && this.active) {
                this.active = false;
                this.canvas.style.opacity = '0';
            }

            // Update particle colors based on section
            this.updateParticleColors();
        },

        onMouseMove: function(e) {
            this.lastMouse.x = this.mouse.x;
            this.lastMouse.y = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.mouse.vx = this.mouse.x - this.lastMouse.x;
            this.mouse.vy = this.mouse.y - this.lastMouse.y;
        },

        updateParticleColors: function() {
            // Detect current section
            const sections = document.querySelectorAll('section');
            let currentColor = this.config.colors.default;

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
                    const sectionId = section.id;
                    if (this.config.colors[sectionId]) {
                        currentColor = this.config.colors[sectionId];
                    }
                }
            });

            // Smoothly transition particle colors
            this.particles.forEach(p => {
                p.color = currentColor;
            });
        },

        animate: function() {
            if (!this.active) {
                requestAnimationFrame(this.animate.bind(this));
                return;
            }

            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw particles
            this.particles.forEach(particle => {
                // Apply scroll velocity
                particle.vy += this.scrollVelocity * 0.05;

                // Mouse repulsion
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.mouseRadius) {
                    const force = (this.config.mouseRadius - distance) / this.config.mouseRadius;
                    const angle = Math.atan2(dy, dx);
                    particle.vx -= Math.cos(angle) * force * 2;
                    particle.vy -= Math.sin(angle) * force * 2;
                    
                    // Size reaction
                    particle.size = particle.baseSize * (1 + force);
                }

                // Mouse velocity influence
                if (distance < this.config.mouseRadius * 2) {
                    particle.vx += this.mouse.vx * 0.01;
                    particle.vy += this.mouse.vy * 0.01;
                }

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Friction
                particle.vx *= 0.98;
                particle.vy *= 0.98;

                // Restore size
                particle.size += (particle.baseSize - particle.size) * 0.1;

                // Boundary check with wrapping
                if (particle.x < 0) particle.x = this.canvas.width;
                if (particle.x > this.canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.canvas.height;
                if (particle.y > this.canvas.height) particle.y = 0;

                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color;
                this.ctx.fill();

                // Draw connections to nearby particles
                this.particles.forEach(other => {
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100 && dist > 0) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(other.x, other.y);
                        this.ctx.strokeStyle = particle.color.replace('0.6', (1 - dist / 100) * 0.2);
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                });
            });

            // Decay scroll velocity
            this.scrollVelocity *= 0.9;

            requestAnimationFrame(this.animate.bind(this));
        },

        // Public methods for terminal control
        setParticleCount: function(count) {
            this.config.particleCount = count;
            this.createParticles();
        },

        setColor: function(color) {
            this.particles.forEach(p => p.color = color);
        },

        explode: function() {
            this.particles.forEach(p => {
                const angle = Math.random() * Math.PI * 2;
                const force = Math.random() * 10 + 5;
                p.vx = Math.cos(angle) * force;
                p.vy = Math.sin(angle) * force;
            });
        },

        freeze: function() {
            this.particles.forEach(p => {
                p.vx = 0;
                p.vy = 0;
            });
        }
    };

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ScrollParticles.init());
    } else {
        ScrollParticles.init();
    }

    // Expose to window for terminal control
    window.ScrollParticles = ScrollParticles;

})();
