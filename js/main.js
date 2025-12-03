(function ($) {
    
   
    
    var Preloader = function () {
        $("html").addClass('preload');
        $(window).on('load', function () {
            // $('html, body').animate({
            //     scrollTop: 0
            // }, 'normal');
            $("#loader").fadeOut("slow", function () {
                $("#preloader").delay(300).fadeOut("slow");
            });
            $("html").removeClass('preload');
            $("html").addClass('loaded');
        });
    };
    var Animation = function () {
        var SEPARATION = 150,
            AMOUNTX = 30,
            AMOUNTY = 30;
        var camera, scene, renderer;
        var particles, particle, count = 0;
        var windowHalfX = window.innerWidth / 2;
        var windowHalfY = window.innerHeight / 2;
        var mouseX = -windowHalfX,
            mouseY = -windowHalfY;
        var gestureMode = false;
        var gestureMultiplier = 1.0;
        var waveSpeed = 0.05;
        
        // Entry animation variables
        var entryAnimationProgress = 0;
        var entryAnimationDuration = 240; // frames (~4 seconds at 60fps)
        var entryAnimationComplete = false;
        var entryAnimationStarted = false;
        var particleStartPositions = [];
        var startTime = Date.now();
        
        // Animation type: 'convergence', 'spiral', 'spiral-center', 'rain', 'wave', 'ripple', 'zoom'
        var animationType = 'spiral-center';
        var animationTypes = ['convergence', 'spiral-center', 'spiral', 'rain', 'wave', 'ripple', 'zoom'];
        var currentAnimationIndex = 1; // Start at spiral-center
        
        function init() {
            console.log('Entry animation initializing...');
            camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 1E5);
            camera.position.z = 1000;
            
            scene = new THREE.Scene();
            
            particles = new Array();
            var PI2 = Math.PI * 2;
            var material = new THREE.SpriteCanvasMaterial({
                color: 0xEEEEEE,
                program: function (context) {
                    context.beginPath();
                    context.arc(0, 0, 0.75, 0, PI2, true);
                    context.fill();
                }
            });
            var i = 0;
            for (var ix = 0; ix < AMOUNTX; ix++) {
                for (var iy = 0; iy < AMOUNTY; iy++) {
                    particle = particles[i++] = new THREE.Sprite(material);
                    
                    // Store final position
                    var finalX = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
                    var finalZ = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
                    
                    // Calculate angle and distance for spiral effects
                    var angle = Math.atan2(finalZ, finalX);
                    var distanceFromCenter = Math.sqrt(finalX * finalX + finalZ * finalZ);
                    
                    // Calculate starting position based on animation type
                    var startX = 0, startY = 0, startZ = 0;
                    var particleDelay = 0;
                    
                    switch(animationType) {
                        case 'convergence':
                            startX = 0;
                            startZ = 0;
                            particleDelay = (ix + iy) * 1.2;
                            break;
                        case 'spiral-center':
                            // Spiral from center (newest effect)
                            startX = 0;
                            startZ = 0;
                            particleDelay = distanceFromCenter * 0.08;
                            break;
                        case 'spiral':
                            var radius = distanceFromCenter;
                            startX = Math.cos(angle + Math.PI * 4) * radius * 2;
                            startZ = Math.sin(angle + Math.PI * 4) * radius * 2;
                            startY = -500;
                            particleDelay = radius * 0.05;
                            break;
                        case 'rain':
                            startX = finalX;
                            startZ = finalZ;
                            startY = 1000 + Math.random() * 500;
                            particleDelay = (ix * 2 + Math.random() * 30);
                            break;
                        case 'wave':
                            startX = -2000;
                            startZ = finalZ;
                            startY = Math.sin(iy * 0.5) * 300;
                            particleDelay = ix * 3;
                            break;
                        case 'ripple':
                            var distFromCenter = Math.sqrt(Math.pow(ix - AMOUNTX/2, 2) + Math.pow(iy - AMOUNTY/2, 2));
                            startX = finalX;
                            startZ = finalZ;
                            startY = -800;
                            particleDelay = distFromCenter * 2;
                            break;
                        case 'zoom':
                            startX = finalX * 5;
                            startZ = finalZ * 5;
                            startY = 0;
                            particleDelay = (AMOUNTX + AMOUNTY - ix - iy) * 1.5;
                            break;
                    }
                    
                    // Set starting position
                    particle.position.x = startX;
                    particle.position.y = startY;
                    particle.position.z = startZ;
                    
                    // Store final positions for animation
                    particleStartPositions.push({
                        startX: startX,
                        startY: startY,
                        startZ: startZ,
                        finalX: finalX,
                        finalZ: finalZ,
                        angle: angle,
                        distance: distanceFromCenter,
                        delay: particleDelay
                    });
                    
                    // Start with very small scale (will animate to full size)
                    particle.scale.x = 0.01;
                    particle.scale.y = 0.01;
                    
                    scene.add(particle);
                }
            }
            renderer = new THREE.CanvasRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            
            $('#wave').prepend(renderer.domElement);
            $(document).on('mousemove', function (event) {
                if (!gestureMode) {
                    mouseX = event.clientX * 0.5 - windowHalfX;
                    // mouseY = event.clientY * 0.3 - windowHalfY;
                }
            }).trigger('mousemouve');
            
            // Listen for hand gesture events
            window.addEventListener('handGesture', function(event) {
                if (gestureMode && window.GestureControl && window.GestureControl.isActive) {
                    const handData = event.detail;
                    
                    // Map hand position to screen coordinates
                    mouseX = handData.x * windowHalfX;
                    mouseY = handData.y * windowHalfY;
                    
                    // Adjust animation based on gesture
                    switch(handData.gesture) {
                        case 'Open Palm':
                            gestureMultiplier = 1.5;
                            waveSpeed = 0.08;
                            break;
                        case 'Fist':
                            gestureMultiplier = 0.5;
                            waveSpeed = 0.02;
                            break;
                        case 'Pinch':
                            gestureMultiplier = 2.0;
                            waveSpeed = 0.12;
                            break;
                        case 'Peace Sign':
                            gestureMultiplier = 1.2;
                            waveSpeed = 0.06;
                            break;
                        default:
                            gestureMultiplier = 1.0;
                            waveSpeed = 0.05;
                    }
                }
            });
            
            $(window).on('resize', function () {
                windowHalfX = window.innerWidth / 2;
                windowHalfY = window.innerHeight / 2;
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
            
            // Start animation after page load
            $(window).on('load', function() {
                setTimeout(function() {
                    entryAnimationStarted = true;
                    console.log('Entry animation starting now!');
                }, 500); // Start 500ms after page load
            });
            
            render();
        }
        
        function render() {
            camera.position.x += (mouseX - camera.position.x) * .05;
            camera.position.y += (-mouseY - camera.position.y) * .03;
            camera.position.z = 750;
            camera.lookAt(scene.position);
            
            var i = 0;
            
            // Handle entry animation
            if (!entryAnimationComplete && entryAnimationStarted) {
                entryAnimationProgress++;
                
                if (entryAnimationProgress >= entryAnimationDuration) {
                    entryAnimationComplete = true;
                    console.log('Entry animation complete!');
                }
            }
            
            for (var ix = 0; ix < AMOUNTX; ix++) {
                for (var iy = 0; iy < AMOUNTY; iy++) {
                    particle = particles[i];
                    var particleData = particleStartPositions[i];
                    i++;
                    
                    if (!entryAnimationComplete && entryAnimationStarted) {
                        // Calculate progress for this specific particle
                        var particleProgress = Math.max(0, entryAnimationProgress - particleData.delay);
                        var normalizedProgress = Math.min(1, particleProgress / (entryAnimationDuration - particleData.delay));
                        
                        // Easing function (ease-out-cubic)
                        var eased = 1 - Math.pow(1 - normalizedProgress, 3);
                        
                        // Handle spiral-center animation differently
                        if (animationType === 'spiral-center') {
                            // Spiral effect: add rotation during expansion
                            var spiralRotation = (1 - eased) * Math.PI * 3; // 3 full rotations
                            var currentAngle = particleData.angle + spiralRotation;
                            var currentDistance = particleData.distance * eased;
                            
                            // Calculate position along spiral path
                            particle.position.x = Math.cos(currentAngle) * currentDistance;
                            particle.position.z = Math.sin(currentAngle) * currentDistance;
                        } else {
                            // Standard animation from start to final position
                            particle.position.x = particleData.startX + (particleData.finalX - particleData.startX) * eased;
                            particle.position.z = particleData.startZ + (particleData.finalZ - particleData.startZ) * eased;
                        }
                        
                        // Gradually increase wave amplitude from 20 to 50
                        var waveAmplitude = 20 + (30 * eased);
                        var currentY = particleData.startY + (0 - particleData.startY) * eased;
                        particle.position.y = currentY + (Math.sin((ix + count) * 0.25) * waveAmplitude * eased) + 
                                             (Math.sin((iy + count) * 0.5) * waveAmplitude * eased);
                        
                        // Animate scale to match the final wave scale
                        var scaleEased = 1 - Math.pow(1 - normalizedProgress, 2);
                        var targetScale = (Math.sin((ix + count) * 0.25) + 1) * 2.2 + 
                                         (Math.sin((iy + count) * 0.5) + 1) * 2.2;
                        // Start from a small but visible scale
                        particle.scale.x = particle.scale.y = Math.max(0.5, targetScale * scaleEased);
                    } else if (!entryAnimationStarted) {
                        // Before animation starts, keep particles at start position
                        particle.position.x = particleData.startX;
                        particle.position.y = particleData.startY;
                        particle.position.z = particleData.startZ;
                        particle.scale.x = 0.01;
                        particle.scale.y = 0.01;
                    } else {
                        // Normal wave animation after entry is complete
                        particle.position.x = particleData.finalX;
                        particle.position.z = particleData.finalZ;
                        particle.position.y = (Math.sin((ix + count) * 0.25) * 50 * gestureMultiplier) + 
                                             (Math.sin((iy + count) * 0.5) * 50 * gestureMultiplier);
                        particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.25) + 1) * 2.2 * gestureMultiplier + 
                                                              (Math.sin((iy + count) * 0.5) + 1) * 2.2 * gestureMultiplier;
                    }
                }
            }
            renderer.render(scene, camera);
            count += waveSpeed;
            requestAnimationFrame(render);
        }
        
        // Expose gesture toggle function
        window.toggleGestureMode = function(active) {
            gestureMode = active;
        };
        
        // Expose animation cycle function
        window.cycleAnimation = function() {
            currentAnimationIndex = (currentAnimationIndex + 1) % animationTypes.length;
            animationType = animationTypes[currentAnimationIndex];
            
            // Reset animation
            entryAnimationProgress = 0;
            entryAnimationComplete = false;
            entryAnimationStarted = false;
            particleStartPositions = [];
            
            // Reinitialize particles with new animation
            var i = 0;
            for (var ix = 0; ix < AMOUNTX; ix++) {
                for (var iy = 0; iy < AMOUNTY; iy++) {
                    var particle = particles[i++];
                    var finalX = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
                    var finalZ = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
                    
                    // Calculate starting position based on animation type
                    var startX = 0, startY = 0, startZ = 0;
                    var particleDelay = 0;
                    
                    switch(animationType) {
                        case 'convergence':
                            startX = 0;
                            startZ = 0;
                            particleDelay = (ix + iy) * 1.2;
                            break;
                        case 'spiral-center':
                            var angle = Math.atan2(finalZ, finalX);
                            var radius = Math.sqrt(finalX * finalX + finalZ * finalZ);
                            startX = 0;
                            startZ = 0;
                            particleDelay = radius * 0.08;
                            break;
                        case 'spiral':
                            var angle = Math.atan2(finalZ, finalX);
                            var radius = Math.sqrt(finalX * finalX + finalZ * finalZ);
                            startX = Math.cos(angle + Math.PI * 4) * radius * 2;
                            startZ = Math.sin(angle + Math.PI * 4) * radius * 2;
                            startY = -500;
                            particleDelay = radius * 0.05;
                            break;
                        case 'rain':
                            startX = finalX;
                            startZ = finalZ;
                            startY = 1000 + Math.random() * 500;
                            particleDelay = (ix * 2 + Math.random() * 30);
                            break;
                        case 'wave':
                            startX = -2000;
                            startZ = finalZ;
                            startY = Math.sin(iy * 0.5) * 300;
                            particleDelay = ix * 3;
                            break;
                        case 'ripple':
                            var distFromCenter = Math.sqrt(Math.pow(ix - AMOUNTX/2, 2) + Math.pow(iy - AMOUNTY/2, 2));
                            startX = finalX;
                            startZ = finalZ;
                            startY = -800;
                            particleDelay = distFromCenter * 2;
                            break;
                        case 'zoom':
                            startX = finalX * 5;
                            startZ = finalZ * 5;
                            startY = 0;
                            particleDelay = (AMOUNTX + AMOUNTY - ix - iy) * 1.5;
                            break;
                    }
                    
                    particle.position.x = startX;
                    particle.position.y = startY;
                    particle.position.z = startZ;
                    particle.scale.x = 0.01;
                    particle.scale.y = 0.01;
                    
                    // Calculate angle and distance for all animations (needed for spiral-center)
                    var particleAngle = Math.atan2(finalZ, finalX);
                    var particleDistance = Math.sqrt(finalX * finalX + finalZ * finalZ);
                    
                    particleStartPositions.push({
                        startX: startX,
                        startY: startY,
                        startZ: startZ,
                        finalX: finalX,
                        finalZ: finalZ,
                        angle: particleAngle,
                        distance: particleDistance,
                        delay: particleDelay
                    });
                }
            }
            
            // Start animation after brief delay
            setTimeout(function() {
                entryAnimationStarted = true;
                console.log('Starting animation:', animationType);
            }, 200);
            
            return animationType;
        };
        
        return init();
    }
    var SmoothScroll = function () {
        $('.smoothscroll').on('click', function (e) {
            var $target = $(this.hash);
            e.preventDefault();
            e.stopPropagation();
            $('html, body').stop().animate({
                'scrollTop': $target.offset().top
            }, 800, 'swing');
        });
    };
    var AOSStart = function () {
        AOS.init({
            offset: 100,
            duration: 500,
            easing: 'ease-in-sine',
            delay: 250,
            once: true,
            disable: 'mobile'
        });
    };
  
    var PageTrack = function () {
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
        ga('create', 'UA-50190232-1', 'akshatmittal.com');
        ga('require', 'displayfeatures');
        ga('send', 'pageview');
        
   
        if (self != top) top.location = self.location;
    };
    (function () {
        Preloader();
        PageTrack();
        Animation();
        SmoothScroll();
        AOSStart();
    })();
})(jQuery);

