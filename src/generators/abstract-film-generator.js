import BaseGenerator from '../BaseGenerator.js';

export default class AbstractFilmGenerator extends BaseGenerator {
    constructor(canvasContainer, uiContainer) {
        super(canvasContainer, uiContainer);

        this.presets = {
            '16:9 Widescreen': { width: 1920, height: 1080 },
            '4:3 Standard': { width: 1440, height: 1080 },
            'Square': { width: 1080, height: 1080 },
        };

        this.settings = {
            backgroundColor: '#1a1a1a',
            lightLeakColor: '#d52b1e',
            filmStock: 'Modern',
            animationSpeed: 1,
            numShapes: 5,
            lightLeakOpacity: 0.4,
            frameJitterAmount: 5,
            flickerAmount: 0.1,
            bloomAmount: 15,
            vignetteAmount: 0.5,
            scratchAmount: 3,
            shapeSize: 50,
            rotationSpeed: 5,
            shapeSpread: 0.8,
            dustAmount: 10,
            motionSkew: 0.2,
            paintSplatter: 5,
            titleText: 'My Film',
            titleSize: 80,
            titleDuration: 2000,
            movementPattern: 'circular',
            sceneScenario: 'default',
            shapeStyle: 'geometric',
            enableOpticalIllusion: false,
            opticalIllusionAmount: 0.1,
            vibrationAmount: 0,
            rhythmPulse: 0,
            patternOverlay: 'none',
            cameraAngle: 0,
            paletteName: 'Cinematic', // Will be set by filmStock
            grainOpacity: 0.1,      // Will be set by filmStock
            mixGeometric: 0.25,
            mixLines: 0.25,
            mixOrganic: 0.25,
            mixTypographic: 0.25,
        };

        this.scenarios = {
            'default': {},
            'chaotic': { animationSpeed: 4, frameJitterAmount: 15, scratchAmount: 8, flickerAmount: 0.2, numShapes: 15 },
            'dreamy': { animationSpeed: 0.5, bloomAmount: 40, lightLeakOpacity: 0.6, vignetteAmount: 0.7, grainOpacity: 0.05, frameJitterAmount: 2 },
            'glitchy': { flickerAmount: 0.4, frameJitterAmount: 20, scratchAmount: 10, lightLeakOpacity: 0.1, grainOpacity: 0.3 },
        };

        this.colorPalettes = {
            'Cinematic': ['#f5c518', '#00a8e1', '#e50914', '#ffffff'],
            'Technicolor': ['#E03A3E', '#009B48', '#0067A3', '#F2C249'],
            'Noir': ['#FFFFFF', '#CCCCCC', '#888888', '#444444'],
            'Pastel': ['#fec5bb', '#fcd5ce', '#fae1dd', '#f8edeb', '#e8e8e4'],
            'Retro': ['#ff715b', '#f9cb40', '#9ed964', '#4a7c59', '#1d2f28'],
        };

        this.filmStocks = {
            'Modern': { paletteName: 'Cinematic', grainOpacity: 0.1 },
            '80s Action': { paletteName: 'Technicolor', grainOpacity: 0.25 },
            'Classic Noir': { paletteName: 'Noir', grainOpacity: 0.35 },
            'Faded 70s': { paletteName: 'Retro', grainOpacity: 0.2 },
            'Custom': {},
        };

        this.canvas = null;
        this.context = null;
        this.previewPreset = this.presets['4:3 Standard'];
        this.animationFrameId = null;

        this.isApplyingPreset = false;
        this.isAnimatable = true;

        // For grain effect
        this.grainCanvas = document.createElement('canvas');
        this.grainContext = this.grainCanvas.getContext('2d');
        this.grainPattern = null;

        this.setup();
    }

    setup() {
        this.canvas = document.createElement('canvas');
        this.canvasContainer.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');

        this.createControls();
        this._updateMixedControlsVisibility();
        this._createPreviewModal();
        this._createGrainPattern();

        this.boundAnimate = this.animate.bind(this);
        this.animate(0);
    }

    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls');

        const fxControls = this._createfieldset('Film Effects');
        fxControls.appendChild(this._createSlider('grainOpacity', 'Grain', { min: 0, max: 1, step: 0.01 }));
        fxControls.appendChild(this._createSlider('lightLeakOpacity', 'Light Leak', { min: 0, max: 1, step: 0.01 }));
        fxControls.appendChild(this._createSlider('frameJitterAmount', 'Jitter', { min: 0, max: 20 }));
        fxControls.appendChild(this._createSlider('flickerAmount', 'Flicker', { min: 0, max: 0.5, step: 0.01 }));
        fxControls.appendChild(this._createSlider('bloomAmount', 'Bloom', { min: 0, max: 50 }));
        fxControls.appendChild(this._createSlider('vignetteAmount', 'Vignette', { min: 0, max: 1, step: 0.01 }));
        fxControls.appendChild(this._createSlider('scratchAmount', 'Scratches', { min: 0, max: 10 }));
        fxControls.appendChild(this._createSlider('dustAmount', 'Dust & Specks', { min: 0, max: 50 }));
        fxControls.appendChild(this._createSlider('motionSkew', 'Motion Skew', { min: 0, max: 1, step: 0.01 }));
        fxControls.appendChild(this._createSlider('paintSplatter', 'Paint Splatter', { min: 0, max: 20 }));
        const opArtControls = this._createfieldset('Op Art');
        opArtControls.appendChild(this._createCheckbox('enableOpticalIllusion', 'Enable Op Art BG'));
        opArtControls.appendChild(this._createSlider('opticalIllusionAmount', 'Op Art Density', { min: 0.01, max: 0.5, step: 0.01 }));
        controlsContainer.appendChild(fxControls);

        const animEnhancementControls = this._createfieldset('Animation Extras');
        animEnhancementControls.appendChild(this._createSlider('vibrationAmount', 'Vibration', { min: 0, max: 10 }));
        animEnhancementControls.appendChild(this._createSlider('rhythmPulse', 'Rhythm Pulse', { min: 0, max: 10 }));
        animEnhancementControls.appendChild(this._createSlider('cameraAngle', 'Camera Angle', { min: -30, max: 30 }));
        animEnhancementControls.appendChild(this._createSelect('patternOverlay', 'Pattern Overlay', ['none', 'dots', 'lines']));

        const contentControls = this._createfieldset('Content');
        contentControls.appendChild(this._createColorInput('backgroundColor', 'Background'));
        contentControls.appendChild(this._createColorInput('lightLeakColor', 'Leak Color'));
        contentControls.appendChild(this._createSlider('numShapes', 'Shape Count', { min: 1, max: 20 }));
        contentControls.appendChild(this._createSlider('animationSpeed', 'Speed', { min: 0.1, max: 5, step: 0.1 }));
        contentControls.appendChild(this._createSlider('shapeSpread', 'Shape Spread', { min: 0.1, max: 1.5, step: 0.05 }));
        contentControls.appendChild(this._createSelect('filmStock', 'Film Stock', Object.keys(this.filmStocks)));
        contentControls.appendChild(this._createSelect('paletteName', 'Palette', Object.keys(this.colorPalettes)));
        contentControls.appendChild(this._createSlider('shapeSize', 'Shape Size', { min: 10, max: 200 }));
        contentControls.appendChild(this._createSelect('movementPattern', 'Movement', ['circular', 'horizontal', 'vertical', 'wandering', 'swarm']));
        contentControls.appendChild(this._createSlider('rotationSpeed', 'Rotation Speed', { min: 0, max: 20 }));
        contentControls.appendChild(this._createSelect('shapeStyle', 'Shape Style', ['geometric', 'lines', 'organic', 'typographic', 'transform', 'mixed']));

        const mixedControls = document.createElement('div');
        mixedControls.dataset.controlGroup = 'mixed-style';
        mixedControls.appendChild(this._createSlider('mixGeometric', 'Geometric Mix', { min: 0, max: 1, step: 0.01 }));
        mixedControls.appendChild(this._createSlider('mixLines', 'Lines Mix', { min: 0, max: 1, step: 0.01 }));
        mixedControls.appendChild(this._createSlider('mixOrganic', 'Organic Mix', { min: 0, max: 1, step: 0.01 }));
        mixedControls.appendChild(this._createSlider('mixTypographic', 'Typographic Mix', { min: 0, max: 1, step: 0.01 }));
        contentControls.appendChild(mixedControls);

        contentControls.appendChild(this._createSelect('sceneScenario', 'Scene Scenario', ['default', 'chaotic', 'dreamy', 'glitchy']));
        controlsContainer.appendChild(opArtControls);
        controlsContainer.appendChild(animEnhancementControls);
        controlsContainer.appendChild(contentControls);

        const titleControls = this._createfieldset('Title Card');
        titleControls.appendChild(this._createTextInput('titleText', 'Title Text'));
        titleControls.appendChild(this._createSlider('titleSize', 'Title Size', { min: 20, max: 200 }));
        titleControls.appendChild(this._createSlider('titleDuration', 'Title Duration (ms)', { min: 0, max: 10000, step: 100 }));
        controlsContainer.appendChild(titleControls);

        const actionsControls = this._createfieldset('Actions');
        const randomizeButton = document.createElement('button');
        randomizeButton.innerText = 'Randomize';
        randomizeButton.addEventListener('click', this._randomizeSettings.bind(this));
        const previewButton = document.createElement('button');
        previewButton.innerText = 'Preview';
        previewButton.addEventListener('click', this._showPreview.bind(this));
        actionsControls.appendChild(previewButton);
        actionsControls.appendChild(randomizeButton);
        controlsContainer.appendChild(actionsControls);

        this.appendDownloadControls(controlsContainer);
        this.uiContainer.appendChild(controlsContainer);
    }

    onSettingChange(key, value) {
        if (this.isApplyingPreset) return;

        if (key === 'sceneScenario' && value !== 'default') {
            this._applyScenario(value);
        }
        if (key === 'filmStock') {
            if (value !== 'Custom') {
                this._applyFilmStock(value);
            }
        }
        if (key === 'shapeStyle') {
            this._updateMixedControlsVisibility();
        }
        if (['paletteName', 'grainOpacity'].includes(key)) {
            if (this.settings.filmStock !== 'Custom') {
                this.settings.filmStock = 'Custom';
                const filmStockControl = this.uiContainer.querySelector('select[data-setting="filmStock"]');
                if (filmStockControl) {
                    filmStockControl.value = 'Custom';
                }
            }
        }
    }

    _updateMixedControlsVisibility() {
        const mixedControls = this.uiContainer.querySelector('[data-control-group="mixed-style"]');
        if (mixedControls) {
            mixedControls.style.display = this.settings.shapeStyle === 'mixed' ? '' : 'none';
        }
    }

    _applyFilmStock(stockName) {
        const stockSettings = this.filmStocks[stockName];
        if (!stockSettings) return;

        this.isApplyingPreset = true;

        for (const key in stockSettings) {
            const value = stockSettings[key];
            this.settings[key] = value;

            // Update the UI control to match
            const control = this.uiContainer.querySelector(`[data-setting="${key}"]`);
            if (control) {
                control.value = value;
                // Also update slider value display if it's a range input
                if (control.type === 'range') {
                    const span = control.previousElementSibling.querySelector('span');
                    if (span) span.innerText = value;
                }
            }
        }

        this.isApplyingPreset = false;
    }

    _applyScenario(scenarioName) {
        const scenarioSettings = this.scenarios[scenarioName];
        if (!scenarioSettings) return;

        this.isApplyingPreset = true;

        for (const key in scenarioSettings) {
            const value = scenarioSettings[key];
            this.settings[key] = value;

            // Update the UI control to match
            const control = this.uiContainer.querySelector(`[data-setting="${key}"]`);
            if (control) {
                control.value = value;
                if (control.type === 'range') {
                    control.previousElementSibling.querySelector('span').innerText = value;
                }
            }
        }

        this.isApplyingPreset = false;
    }

    _createGrainPattern() {
        this.grainCanvas.width = 100;
        this.grainCanvas.height = 100;
        const imageData = this.grainContext.createImageData(100, 100);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const value = Math.random() * 255;
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 255;
        }
        this.grainContext.putImageData(imageData, 0, 0);
        this.grainPattern = this.context.createPattern(this.grainCanvas, 'repeat');
    }

    animate(time) {
        this.draw(time);
        this.animationFrameId = requestAnimationFrame(this.boundAnimate);
    }

    draw(time = 0) {
        const aspectRatio = this.previewPreset.width / this.previewPreset.height;
        let previewWidth = window.innerWidth * 0.9;
        let previewHeight = previewWidth / aspectRatio;

        if (previewHeight > window.innerHeight * 0.8) {
            previewHeight = window.innerHeight * 0.8;
            previewWidth = previewHeight * aspectRatio;
        }

        this.canvas.width = previewWidth;
        this.canvas.height = previewHeight;

        const scale = previewWidth / this.previewPreset.width;
        this.context.save();
        this.context.scale(scale, scale);

        this.renderArtwork(this.context, this.previewPreset.width, this.previewPreset.height, this.settings, time);

        this.context.restore();
    }

    renderArtwork(ctx, width, height, settings, time) {
        const {
            backgroundColor, lightLeakColor, paletteName, animationSpeed, numShapes,
            grainOpacity, lightLeakOpacity, frameJitterAmount, flickerAmount, bloomAmount, vignetteAmount, motionSkew, paintSplatter,
            scratchAmount, dustAmount, titleText, titleSize, titleDuration, movementPattern, shapeSpread,
            enableOpticalIllusion, opticalIllusionAmount, vibrationAmount, rhythmPulse, patternOverlay, cameraAngle,
            shapeStyle, shapeSize, rotationSpeed
        } = settings;

        const activePalette = this.colorPalettes[paletteName];

        const pulse = rhythmPulse > 0 ? Math.sin(time * 0.001 * rhythmPulse) : 0;
        const effectiveTime = time * animationSpeed * (1 + pulse * 0.5);

        ctx.save();

        // Camera Angle (Skew)
        if (cameraAngle !== 0) {
            const angleRad = cameraAngle * Math.PI / 180;
            ctx.transform(1, Math.tan(angleRad), 0, 1, -height * Math.tan(angleRad) / 2, 0);
        }

        // Frame Jitter
        const jitterX = (Math.random() - 0.5) * frameJitterAmount;
        const jitterY = (Math.random() - 0.5) * frameJitterAmount;
        ctx.translate(jitterX, jitterY);

        // Background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // --- Op Art Background ---
        if (enableOpticalIllusion) {
            ctx.save();
            ctx.strokeStyle = activePalette[activePalette.length - 1]; // Use a palette color
            ctx.lineWidth = 2;
            ctx.globalAlpha = opticalIllusionAmount;
            const lineCount = 50;
            for (let i = 0; i < lineCount; i++) {
                ctx.beginPath();
                ctx.moveTo(width / 2, height / 2);
                ctx.lineTo(Math.cos(i/lineCount * Math.PI * 2) * width + width/2, Math.sin(i/lineCount * Math.PI * 2) * width + height/2);
                ctx.stroke();
            }
            ctx.restore();
        }
        // --- Bloom Effect ---
        if (bloomAmount > 0) {
            // Use the first color of the palette for a consistent bloom
            ctx.shadowBlur = bloomAmount;
            ctx.shadowColor = activePalette[0];
        }

        // Draw Title Card (now affected by bloom)
        if (time < titleDuration && titleText) {
            ctx.save();
            ctx.font = `bold ${titleSize}px sans-serif`;
            ctx.fillStyle = activePalette[0];
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 1 - (time / titleDuration); // Fade out
            ctx.fillText(titleText, width / 2, height / 2);
            ctx.restore();
        }

        // Animated Shapes
        // Fill and stroke will be set per-shape
        let leaderPos = { x: 0, y: 0 };
        if (movementPattern === 'swarm' && numShapes > 0) {
            const leaderSeed = 1;
            const leaderSpeedFactor = 0.0001 * leaderSeed;
            leaderPos.x = width/2 + Math.sin(effectiveTime * leaderSpeedFactor + leaderSeed) * (width / 2 * shapeSpread);
            leaderPos.y = height/2 + Math.cos(effectiveTime * leaderSpeedFactor + leaderSeed) * (height / 2 * shapeSpread);
        }

        ctx.lineWidth = 10;
        for (let i = 0; i < numShapes; i++) {
            ctx.save();
            let x, y;
            let vx = 0, vy = 0; // Velocities
            const seed = i + 1;
            const speedFactor = 0.0001 * seed;
            const size = (Math.sin(effectiveTime * 0.0002 * (i + 1)) + 1.5) * (shapeSize / 2);
            const centerX = width / 2;
            const centerY = height / 2;

            const vibX = (Math.random() - 0.5) * vibrationAmount;
            const vibY = (Math.random() - 0.5) * vibrationAmount;

            switch(movementPattern) {
                case 'horizontal':
                    const hSpeed = 0.0002 * seed * width;
                    x = ((effectiveTime * hSpeed) % (width + size * 4)) - size * 2;
                    y = (seed / (numShapes + 1)) * height;
                    vx = hSpeed;
                    break;
                case 'vertical':
                    const vSpeed = 0.0002 * seed * height;
                    x = (seed / (numShapes + 1)) * width;
                    y = ((effectiveTime * vSpeed) % (height + size * 4)) - size * 2;
                    vy = vSpeed;
                    break;
                case 'wandering':
                    const x_orig = (Math.sin(effectiveTime * speedFactor + seed) + Math.cos(effectiveTime * speedFactor * 0.5 + seed)) / 2 * width * 1.2 - width * 0.1;
                    const y_orig = (Math.cos(effectiveTime * speedFactor + seed) + Math.sin(effectiveTime * speedFactor * 0.7 + seed)) / 2 * height * 1.2 - height * 0.1;
                    x = centerX + (x_orig - centerX) * shapeSpread;
                    y = centerY + (y_orig - centerY) * shapeSpread;
                    vx = (speedFactor * Math.cos(effectiveTime * speedFactor + seed) - (speedFactor * 0.5) * Math.sin(effectiveTime * speedFactor * 0.5 + seed)) / 2 * width * 1.2;
                    vy = (-speedFactor * Math.sin(effectiveTime * speedFactor + seed) + (speedFactor * 0.7) * Math.cos(effectiveTime * speedFactor * 0.7 + seed)) / 2 * height * 1.2;
                    break;
                case 'circular':
                default:
                    const radiusX = (width / 2) * shapeSpread;
                    const radiusY = (height / 2) * shapeSpread;
                    x = centerX + Math.sin(effectiveTime * speedFactor + seed) * radiusX;
                    y = centerY + Math.cos(effectiveTime * speedFactor + seed) * radiusY;
                    vx = (speedFactor * Math.cos(effectiveTime * speedFactor + seed)) * radiusX;
                    vy = (-speedFactor * Math.sin(effectiveTime * speedFactor + seed)) * radiusY;
                    break;
                case 'swarm':
                    if (i === 0) { // Leader
                        x = leaderPos.x;
                        y = leaderPos.y;
                    } else { // Follower
                        const x_orig = (Math.sin(effectiveTime * speedFactor + seed) + Math.cos(effectiveTime * speedFactor * 0.5 + seed)) / 2 * width;
                        const y_orig = (Math.cos(effectiveTime * speedFactor + seed) + Math.sin(effectiveTime * speedFactor * 0.7 + seed)) / 2 * height;
                        const pullFactor = 0.05 + (seed / numShapes) * 0.1; // Vary pull strength
                        x = x_orig * (1 - pullFactor) + leaderPos.x * pullFactor;
                        y = y_orig * (1 - pullFactor) + leaderPos.y * pullFactor;
                    }
                    break;
            }

            const velocity = Math.sqrt(vx*vx + vy*vy);
            const normalizedVelocity = Math.min(1, velocity / 500); // Normalize against an arbitrary max speed

            ctx.translate(x + vibX, y + vibY);
            const baseRotation = effectiveTime * (rotationSpeed * 0.0001) * (i % 2 === 0 ? -1 : 1);
            const motionRotation = normalizedVelocity * Math.PI;
            ctx.rotate(baseRotation + motionRotation);

            const skewAmount = normalizedVelocity * motionSkew;
            ctx.transform(1, 0, skewAmount, 1, 0, 0); // Apply skew

            const shapeColor = activePalette[Math.floor(Math.random() * activePalette.length)];
            ctx.fillStyle = shapeColor;
            ctx.strokeStyle = shapeColor;

            let drawLine = shapeStyle === 'lines';
            let drawOrganic = shapeStyle === 'organic';
            let drawTypographic = shapeStyle === 'typographic';
            let drawTransform = shapeStyle === 'transform';

            if (shapeStyle === 'mixed') {
                const { mixGeometric, mixLines, mixOrganic, mixTypographic } = settings;
                const totalMix = mixGeometric + mixLines + mixOrganic + mixTypographic + 0.0001; // Add epsilon to prevent div by zero

                if (totalMix > 0) {
                    const r = Math.random() * totalMix;
                    if (r < mixGeometric) {
                        // Draw geometric (default)
                    } else if (r < mixGeometric + mixLines) {
                        drawLine = true;
                    } else if (r < mixGeometric + mixLines + mixOrganic) {
                        drawOrganic = true;
                    } else if (r < mixGeometric + mixLines + mixOrganic + mixTypographic) {
                        drawTypographic = true;
                    } else {
                        drawTransform = true;
                    }
                } else {
                    // Fallback if all mixes are zero
                    const randStyle = Math.floor(Math.random() * 5);
                    if (randStyle === 1) drawLine = true;
                    else if (randStyle === 2) drawOrganic = true;
                    else if (randStyle === 3) drawTypographic = true;
                    else if (randStyle === 4) drawTransform = true;
                }
            }

            if (drawLine) {
                ctx.beginPath();
                ctx.moveTo(-size, 0);
                ctx.lineTo(size, 0);
                ctx.stroke();
            } else if (drawOrganic) {
                ctx.beginPath();
                const points = 8;
                for (let j = 0; j <= points; j++) {
                    const angle = (j / points) * Math.PI * 2;
                    const r = size * (0.7 + Math.sin(effectiveTime * 0.001 + j) * 0.3);
                    const px = r * Math.cos(angle);
                    const py = r * Math.sin(angle);
                    if (j === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.fill();
            } else if (drawTypographic) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#&?';
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.font = `bold ${size * 2}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(char, 0, 0);
            } else if (drawTransform) {
                const cornerRadius = (Math.sin(effectiveTime * 0.001 + seed) + 1) / 2 * size;
                const rectSize = size * 1.5;
                ctx.beginPath();
                ctx.moveTo(-rectSize/2 + cornerRadius, -rectSize/2);
                ctx.lineTo(rectSize/2 - cornerRadius, -rectSize/2);
                ctx.arcTo(rectSize/2, -rectSize/2, rectSize/2, -rectSize/2 + cornerRadius, cornerRadius);
                ctx.lineTo(rectSize/2, rectSize/2 - cornerRadius);
                ctx.arcTo(rectSize/2, rectSize/2, rectSize/2 - cornerRadius, rectSize/2, cornerRadius);
                ctx.lineTo(-rectSize/2 + cornerRadius, rectSize/2);
                ctx.arcTo(-rectSize/2, rectSize/2, -rectSize/2, rectSize/2 - cornerRadius, cornerRadius);
                ctx.lineTo(-rectSize/2, -rectSize/2 + cornerRadius);
                ctx.arcTo(-rectSize/2, -rectSize/2, -rectSize/2 + cornerRadius, -rectSize/2, cornerRadius);
                ctx.closePath();
                ctx.fill();
            } else { // geometric
                const shapeType = Math.floor(Math.random() * 6);
                switch (shapeType) {
                    case 0: // Rectangle
                        ctx.fillRect(-size, -size / 4, size * 2, size / 2);
                        break;
                    case 1: // Circle
                        ctx.beginPath();
                        ctx.arc(0, 0, size, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 2: // Triangle
                        ctx.beginPath();
                        ctx.moveTo(0, -size);
                        ctx.lineTo(-size, size);
                        ctx.lineTo(size, size);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    case 3: // Cross
                        ctx.lineWidth = size / 4;
                        ctx.beginPath();
                        ctx.moveTo(-size, 0);
                        ctx.lineTo(size, 0);
                        ctx.moveTo(0, -size);
                        ctx.lineTo(0, size);
                        ctx.stroke();
                        break;
                    case 4: // Arc
                        ctx.lineWidth = size / 5;
                        ctx.beginPath();
                        ctx.arc(0, 0, size, 0, Math.PI * 1.5);
                        ctx.stroke();
                        break;
                    case 5: // Dot Grid
                        const dots = 3;
                        const dotSize = size / 4;
                        for (let i = 0; i < dots; i++) {
                            for (let j = 0; j < dots; j++) {
                                ctx.beginPath();
                                ctx.arc(-size + (i * size), -size + (j * size), dotSize * Math.abs(Math.sin(effectiveTime * 0.001 + i*j)), 0, Math.PI * 2);
                                ctx.fill();
                            }
                        }
                        break;
                }
            }
            ctx.restore();
        }

        // Reset bloom for other elements
        ctx.shadowBlur = 0;

        // --- Pattern Overlay ---
        if (patternOverlay !== 'none') {
            ctx.save();
            ctx.globalAlpha = 0.05;
            ctx.fillStyle = activePalette[0];
            const patternSize = 40;
            if (patternOverlay === 'dots') {
                for (let i = 0; i < width; i += patternSize) {
                    for (let j = 0; j < height; j += patternSize) {
                        ctx.beginPath();
                        ctx.arc(i, j, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            } else if (patternOverlay === 'lines') {
                ctx.lineWidth = 1;
                ctx.strokeStyle = activePalette[0];
                for (let i = 0; i < width; i += patternSize) {
                    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
                }
            }
            ctx.restore();
        }

        // --- Direct-on-Film Paint Splatter ---
        if (paintSplatter > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            for (let i = 0; i < paintSplatter; i++) {
                const x = (Math.sin(effectiveTime * 0.00003 * (i + 1) + i * 2) + 1) / 2 * width;
                const y = (Math.cos(effectiveTime * 0.00004 * (i + 1) + i * 3) + 1) / 2 * height;
                const radius = (Math.sin(effectiveTime * 0.0001 * (i + 1)) + 1.5) * 80;
                const color = activePalette[i % activePalette.length];
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Light Leak
        if (lightLeakOpacity > 0) {
            ctx.save();
            ctx.globalAlpha = lightLeakOpacity;
            const leakX = (Math.sin(effectiveTime * 0.00005) + 1) / 2 * width;
            const gradient = ctx.createRadialGradient(leakX, height / 2, 0, leakX, height / 2, height);
            gradient.addColorStop(0, lightLeakColor);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }

        // --- Scratches ---
        if (scratchAmount > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`;
            ctx.lineWidth = Math.random() * 1.5 + 0.5;
            for (let i = 0; i < scratchAmount; i++) {
                if (Math.random() > 0.9) { // Scratches appear intermittently
                    const x = Math.random() * width;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x + (Math.random() - 0.5) * 5, height);
                    ctx.stroke();
                }
            }
            ctx.restore();
        }

        // --- Dust & Specks ---
        if (dustAmount > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
            for (let i = 0; i < dustAmount; i++) {
                if (Math.random() > 0.7) {
                    const x = Math.random() * width;
                    const y = Math.random() * height;
                    const r = Math.random() * 1.5;
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        // Flicker (applied before vignette for better effect)
        if (flickerAmount > 0) {
            // This was drawing the background color, which washes out the image.
            // A better flicker is a quick flash of light.
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * flickerAmount})`;
            ctx.fillRect(0, 0, width, height);
        }

        // --- Vignette ---
        if (vignetteAmount > 0) {
            ctx.save();
            const outerRadius = Math.sqrt(width * width + height * height) / 2;
            const gradient = ctx.createRadialGradient(width / 2, height / 2, outerRadius * (1 - vignetteAmount), width / 2, height / 2, outerRadius);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }

        // Film Grain
        if (grainOpacity > 0) {
            ctx.save();
            ctx.globalAlpha = grainOpacity;
            ctx.fillStyle = this.grainPattern;
            ctx.translate(-jitterX, -jitterY); // Counteract jitter for grain
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }

        ctx.restore(); // Restore from jitter
    }

    destroy() {
        super.destroy();
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}