// Hand Gesture Control Module for Three.js Animation
(function(window) {
    'use strict';

    const GestureControl = {
        hands: null,
        camera: null,
        video: null,
        isActive: false,
        
        // Hand position data
        handData: {
            x: 0,
            y: 0,
            z: 0,
            palmOpen: false,
            pinching: false,
            gesture: 'none'
        },

        // Gesture detection thresholds
        thresholds: {
            pinchDistance: 0.05,
            openHandThreshold: 0.15
        },

        // Initialize MediaPipe Hands
        init: function() {
            this.video = document.getElementById('gesture-camera');
            
            // Configure MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults(this.onResults.bind(this));
        },

        // Start camera and hand tracking
        start: function() {
            if (this.isActive) return;

            this.init();

            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    await this.hands.send({image: this.video});
                },
                width: 640,
                height: 480
            });

            this.camera.start()
                .then(() => {
                    this.isActive = true;
                    this.updateStatus('Active', '#4CAF50');
                    console.log('Hand gesture tracking started');
                })
                .catch((err) => {
                    console.error('Camera access denied:', err);
                    this.updateStatus('Camera Error', '#f44336');
                    alert('Camera access is required for hand gesture control. Please allow camera access and try again.');
                });
        },

        // Stop hand tracking
        stop: function() {
            if (!this.isActive) return;

            if (this.camera) {
                this.camera.stop();
            }

            if (this.video && this.video.srcObject) {
                const tracks = this.video.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }

            this.isActive = false;
            this.updateStatus('Inactive', '#666');
            console.log('Hand gesture tracking stopped');
        },

        // Toggle hand tracking
        toggle: function() {
            if (this.isActive) {
                this.stop();
            } else {
                this.start();
            }
        },

        // Process hand tracking results
        onResults: function(results) {
            if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
                this.handData.gesture = 'none';
                this.updateStatus('No Hand Detected', '#FF9800');
                return;
            }

            const landmarks = results.multiHandLandmarks[0];
            
            // Get palm center (average of key points)
            const palmCenter = this.calculatePalmCenter(landmarks);
            
            // Normalize coordinates to screen space (-1 to 1)
            this.handData.x = (palmCenter.x - 0.5) * 2;
            this.handData.y = -(palmCenter.y - 0.5) * 2; // Invert Y
            this.handData.z = palmCenter.z;

            // Detect gestures
            const gesture = this.detectGesture(landmarks);
            this.handData.gesture = gesture;
            
            // Update status display
            this.updateStatus(`Tracking: ${gesture}`, '#4CAF50');

            // Emit custom event with hand data
            const event = new CustomEvent('handGesture', {
                detail: this.handData
            });
            window.dispatchEvent(event);
        },

        // Calculate palm center from landmarks
        calculatePalmCenter: function(landmarks) {
            // Use wrist (0) and middle finger base (9) for palm center
            const wrist = landmarks[0];
            const middleBase = landmarks[9];
            
            return {
                x: (wrist.x + middleBase.x) / 2,
                y: (wrist.y + middleBase.y) / 2,
                z: (wrist.z + middleBase.z) / 2
            };
        },

        // Detect specific gestures
        detectGesture: function(landmarks) {
            // Check for pinch gesture (thumb and index finger close)
            if (this.isPinching(landmarks)) {
                this.handData.pinching = true;
                return 'Pinch';
            }

            // Check for open palm
            if (this.isOpenPalm(landmarks)) {
                this.handData.palmOpen = true;
                this.handData.pinching = false;
                return 'Open Palm';
            }

            // Check for fist
            if (this.isFist(landmarks)) {
                this.handData.palmOpen = false;
                this.handData.pinching = false;
                return 'Fist';
            }

            // Check for peace sign
            if (this.isPeaceSign(landmarks)) {
                return 'Peace Sign';
            }

            this.handData.palmOpen = false;
            this.handData.pinching = false;
            return 'Hand';
        },

        // Check if pinching
        isPinching: function(landmarks) {
            const thumb = landmarks[4];
            const index = landmarks[8];
            const distance = this.calculateDistance(thumb, index);
            return distance < this.thresholds.pinchDistance;
        },

        // Check if palm is open
        isOpenPalm: function(landmarks) {
            // Check if all fingertips are extended
            const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky
            const fingerBases = [5, 9, 13, 17];
            
            let extendedCount = 0;
            for (let i = 0; i < fingerTips.length; i++) {
                if (landmarks[fingerTips[i]].y < landmarks[fingerBases[i]].y) {
                    extendedCount++;
                }
            }
            
            return extendedCount >= 3;
        },

        // Check if hand is in a fist
        isFist: function(landmarks) {
            const fingerTips = [8, 12, 16, 20];
            const palm = landmarks[0];
            
            let closedCount = 0;
            for (let tip of fingerTips) {
                const distance = this.calculateDistance(landmarks[tip], palm);
                if (distance < 0.15) {
                    closedCount++;
                }
            }
            
            return closedCount >= 3;
        },

        // Check for peace sign (index and middle finger extended)
        isPeaceSign: function(landmarks) {
            const indexTip = landmarks[8];
            const indexBase = landmarks[5];
            const middleTip = landmarks[12];
            const middleBase = landmarks[9];
            const ringTip = landmarks[16];
            const ringBase = landmarks[13];
            
            const indexExtended = indexTip.y < indexBase.y;
            const middleExtended = middleTip.y < middleBase.y;
            const ringClosed = ringTip.y > ringBase.y;
            
            return indexExtended && middleExtended && ringClosed;
        },

        // Calculate distance between two points
        calculateDistance: function(point1, point2) {
            const dx = point1.x - point2.x;
            const dy = point1.y - point2.y;
            const dz = point1.z - point2.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        },

        // Update status display
        updateStatus: function(text, color) {
            const statusEl = document.getElementById('gesture-status');
            if (statusEl) {
                statusEl.textContent = `Gesture: ${text}`;
                statusEl.style.background = color || 'rgba(0,0,0,0.7)';
            }
        },

        // Get current hand data
        getHandData: function() {
            return this.handData;
        }
    };

    // Expose to global scope
    window.GestureControl = GestureControl;

})(window);
