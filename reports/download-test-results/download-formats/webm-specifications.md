# WebM Video Download Specifications

## 📋 Format Overview
**Format**: WebM (Web Media)  
**Codec**: VP8/VP9  
**Container**: WebM  
**Compression**: Lossy  

## 🎯 Use Cases
- **Web Content**: Video backgrounds, animations
- **Social Media**: Animated posts, stories
- **Presentations**: Dynamic slide content
- **Marketing**: Promotional videos
- **Documentation**: Process demonstrations

## 📐 Size Specifications

### Standard Sizes
| Generator | Width | Height | Aspect Ratio | Frame Rate |
|-----------|-------|--------|--------------|------------|
| Grid Generator | 1080px | 1080px | 1:1 | 30fps |
| Swiss Generator | 1920px | 1080px | 16:9 | 30fps |
| Abstract Film | 1920px | 1080px | 16:9 | 30fps |
| Vera Molnar | 2000px | 2000px | 1:1 | 30fps |
| 3D Generator | 1920px | 1080px | 16:9 | 30fps |

## 🎨 Quality Settings

### Video Parameters
- **Frame Rate**: 30fps (standard)
- **Bitrate**: 2-8 Mbps (adaptive)
- **Keyframe Interval**: 2 seconds
- **Quality**: High (balanced quality/size)

### Compression
- **Codec**: VP9 (modern browsers)
- **Profile**: 0 (baseline)
- **Level**: 4.1
- **Bitrate**: Variable (2-8 Mbps)

### Audio
- **Codec**: Vorbis
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo
- **Bitrate**: 128 kbps

## 📊 File Size Estimates

| Duration | Resolution | File Size | Use Case |
|----------|------------|-----------|----------|
| 3 seconds | 1080x1080 | 500KB-2MB | Social media |
| 5 seconds | 1920x1080 | 1-4MB | Web content |
| 10 seconds | 1920x1080 | 2-8MB | Presentations |
| 30 seconds | 1920x1080 | 6-24MB | Marketing |

## ⚙️ Technical Implementation

### Canvas Setup
```javascript
const videoCanvas = document.createElement('canvas');
videoCanvas.width = preset.width;
videoCanvas.height = preset.height;
videoCanvas.style.position = 'fixed';
videoCanvas.style.top = '-9999px';
document.body.appendChild(videoCanvas);
```

### Recording Process
1. **Setup**: Create visible canvas for capture
2. **Stream**: Use captureStream() for video stream
3. **Record**: MediaRecorder for WebM encoding
4. **Render**: Draw frames during recording
5. **Download**: Create blob and trigger download
6. **Cleanup**: Remove temporary canvas

### Animation Loop
```javascript
const recordLoop = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    if (elapsedTime >= duration) {
        recorder.stop();
        return;
    }
    this.renderArtwork(videoContext, width, height, settings, elapsedTime);
    requestAnimationFrame(recordLoop);
};
```

## 🎨 Animation Features

### Grid Generator
- **Rotation**: Smooth shape rotation
- **Scaling**: Dynamic size changes
- **Color Transitions**: Palette shifts
- **Pattern Evolution**: Grid pattern changes

### Swiss Generator
- **Typography**: Text animations
- **Layout Shifts**: Dynamic positioning
- **Element Movement**: Graphic element motion
- **Color Changes**: Palette transitions

### Abstract Film
- **Film Effects**: Real-time grain, light leaks
- **Shape Animation**: Geometric motion
- **Camera Movement**: Simulated camera work
- **Effect Evolution**: Dynamic visual effects

### Vera Molnar
- **Disorder Evolution**: Controlled randomness
- **Geometric Changes**: Shape transformations
- **Pattern Shifts**: Grid modifications
- **Simulation Steps**: Algorithmic progression

### 3D Generator
- **3D Rotation**: Multi-axis rotation
- **Shape Changes**: Geometry modifications
- **Material Shifts**: Surface changes
- **Lighting**: Dynamic illumination

## 🧪 Test Results

### Performance Metrics
- **Recording Time**: Real-time (1:1 ratio)
- **File Size**: Optimized for web delivery
- **Quality**: High visual fidelity
- **Compatibility**: Modern browser support

### Browser Support
- **Chrome**: ✅ Full support
- **Firefox**: ✅ Full support
- **Safari**: ⚠️ Limited support
- **Edge**: ✅ Full support

### Error Handling
- **Stream Support**: Graceful fallback
- **Memory Limits**: Size validation
- **Recording Errors**: User feedback
- **Download Issues**: Retry mechanism
