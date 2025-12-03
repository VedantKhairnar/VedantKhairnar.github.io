# Hand Gesture Control for Three.js Animation

This feature adds interactive hand gesture control to the Three.js particle wave animation on the hero page using your device's camera and MediaPipe Hands.

## Features

- **Real-time hand tracking** using MediaPipe Hands AI model
- **Multiple gesture recognition**:
  - **Open Palm**: Increases wave amplitude (1.5x) and speed
  - **Fist**: Decreases wave amplitude (0.5x) and slows animation
  - **Pinch**: Maximum wave amplitude (2x) and fastest speed
  - **Peace Sign**: Moderate wave effect (1.2x)
  - **Hand Movement**: Controls camera position and wave direction

## How to Use

1. **Click the hand gesture button** (🤚) in the top-right corner
2. **Allow camera access** when prompted by your browser
3. **Position your hand** in front of the camera
4. **Try different gestures** to control the animation:
   - Move your hand left/right to control horizontal motion
   - Move your hand up/down to control vertical motion
   - Make different gestures to change wave intensity and speed

## UI Controls

- **🤚 Hand Button**: Toggle hand gesture control on/off
  - Green background when active
  - Shows gesture status indicator when enabled
- **Gesture Status**: Displays current detected gesture and tracking status

## Technical Details

### Dependencies
- MediaPipe Hands (loaded from CDN)
- MediaPipe Camera Utils
- MediaPipe Drawing Utils
- Three.js (existing)

### Browser Compatibility
- Works on modern browsers with camera support
- Requires HTTPS for camera access (works on localhost)
- Best performance on Chrome/Edge

### Privacy
- All processing is done locally in your browser
- No video data is sent to any server
- Camera access can be revoked at any time through browser settings

## Gesture Detection

The system detects hand landmarks and recognizes gestures:
- **Pinch**: Thumb and index finger tips close together
- **Open Palm**: All fingers extended
- **Fist**: All fingers curled toward palm
- **Peace Sign**: Index and middle fingers extended, others closed

## Troubleshooting

**Camera not working?**
- Check browser permissions
- Ensure you're on HTTPS or localhost
- Try refreshing the page

**Gestures not detected?**
- Ensure good lighting
- Keep hand within camera view
- Try adjusting distance from camera

**Performance issues?**
- Close other camera-using apps
- Try disabling gesture control and re-enabling
- Check browser console for errors

## Files Modified/Added

1. `index.html` - Added MediaPipe dependencies and UI controls
2. `js/main.js` - Integrated gesture control with Three.js animation
3. `js/gesture-control.js` - New gesture detection module
4. `GESTURE_CONTROL_README.md` - This documentation

## Future Enhancements

- Custom gesture training
- Multi-hand support
- Gesture shortcuts for page navigation
- Particle color control via gestures
- Recording and playback of gesture sequences
