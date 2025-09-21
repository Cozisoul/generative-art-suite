import BaseGenerator from '../BaseGenerator.js';

export default class AdvancedLogoGenerator extends BaseGenerator {
    constructor(canvasContainer, uiContainer) {
        super(canvasContainer, uiContainer);

        this.presets = {
            'Square Logo': { width: 1000, height: 1000 },
            'Wide Banner': { width: 1500, height: 500 },
            'Social Profile': { width: 800, height: 800 },
            'Business Card': { width: 1050, height: 600 },
            'App Icon': { width: 1024, height: 1024 },
            'Letterhead': { width: 2100, height: 2970 },
        };

        this.fontFamilies = [
            'Inter', 'Poppins', 'Montserrat', 'Oswald', 'Raleway', 
            'Roboto Mono', 'DM Sans', 'Space Grotesk', 'Helvetica', 
            'Arial', 'Georgia', 'Times New Roman', 'Courier New'
        ];

        this.logoStyles = [
            'Minimalist', 'Modern', 'Vintage', 'Futuristic', 'Handwritten', 
            'Geometric', 'Organic', 'Corporate', 'Creative', 'Tech'
        ];

        this.settings = {
            // Text Content
            logoText: 'LOGO',
            taglineText: 'Your Brand Here',
            showTagline: true,
            
            // Typography
            fontFamily: 'Inter',
            fontWeight: '700',
            fontSize: 120,
            letterSpacing: 0,
            lineHeight: 1.2,
            textAlign: 'center',
            
            // Tagline Typography
            taglineFontFamily: 'Inter',
            taglineFontWeight: '400',
            taglineFontSize: 24,
            taglineLetterSpacing: 2,
            taglineGap: 20,
            
            // Logo Style
            logoStyle: 'Modern',
            textEffect: 'normal', // normal, outline, shadow, gradient
            textRotation: 0,
            textSkew: 0,
            
            // Colors
            backgroundColor: '#ffffff',
            textColor: '#000000',
            accentColor: '#007bff',
            gradientStart: '#007bff',
            gradientEnd: '#0056b3',
            
            // Layout
            layout: 'horizontal', // horizontal, vertical, stacked, circular
            spacing: 20,
            padding: 100,
            
            // Effects
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
            
            // Background
            backgroundType: 'solid', // solid, gradient, pattern, image
            backgroundPattern: 'dots', // dots, lines, grid, none
            backgroundOpacity: 1,
            
            // Advanced
            enableAnimation: false,
            animationType: 'pulse', // pulse, rotate, slide, none
            animationSpeed: 1,
            
            // Export
            exportFormat: 'png',
            exportQuality: 1,
            includeTransparency: false,
        };

        this.canvas = null;
        this.context = null;
        this.previewPreset = this.presets['Square Logo'];
        this.animationFrame = 0;

        this.setup();
    }

    setup() {
        this.canvas = document.createElement('canvas');
        this.canvasContainer.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');

        this.createControls();
        this.appendDownloadControls(document.querySelector('.controls'));
        this.draw();

        this.boundDraw = this.draw.bind(this);
        window.addEventListener('resize', this.boundDraw, false);
    }

    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls');

        // Logo Style
        const styleControls = this._createfieldset('Logo Style');
        styleControls.appendChild(this._createSelect('logoStyle', 'Style', this.logoStyles));
        styleControls.appendChild(this._createSelect('textEffect', 'Text Effect', ['normal', 'outline', 'shadow', 'gradient']));
        styleControls.appendChild(this._createSlider('textRotation', 'Rotation', { min: -45, max: 45, unit: '°' }));
        styleControls.appendChild(this._createSlider('textSkew', 'Skew', { min: -30, max: 30, unit: '°' }));
        controlsContainer.appendChild(styleControls);

        // Text Content
        const textControls = this._createfieldset('Text Content');
        textControls.appendChild(this._createTextInput('logoText', 'Logo Text'));
        textControls.appendChild(this._createCheckbox('showTagline', 'Show Tagline'));
        textControls.appendChild(this._createTextInput('taglineText', 'Tagline Text'));
        controlsContainer.appendChild(textControls);

        // Typography
        const typographyControls = this._createfieldset('Typography');
        typographyControls.appendChild(this._createSelect('fontFamily', 'Font', this.fontFamilies));
        typographyControls.appendChild(this._createSelect('fontWeight', 'Weight', ['100', '200', '300', '400', '500', '600', '700', '800', '900']));
        typographyControls.appendChild(this._createSlider('fontSize', 'Size', { min: 20, max: 300 }));
        typographyControls.appendChild(this._createSlider('letterSpacing', 'Letter Spacing', { min: -5, max: 20 }));
        typographyControls.appendChild(this._createSlider('lineHeight', 'Line Height', { min: 0.8, max: 2.0, step: 0.1 }));
        typographyControls.appendChild(this._createSelect('textAlign', 'Alignment', ['left', 'center', 'right']));
        controlsContainer.appendChild(typographyControls);

        // Tagline Typography
        const taglineControls = this._createfieldset('Tagline Typography');
        taglineControls.appendChild(this._createSelect('taglineFontFamily', 'Font', this.fontFamilies));
        taglineControls.appendChild(this._createSelect('taglineFontWeight', 'Weight', ['100', '200', '300', '400', '500', '600', '700', '800', '900']));
        taglineControls.appendChild(this._createSlider('taglineFontSize', 'Size', { min: 10, max: 80 }));
        taglineControls.appendChild(this._createSlider('taglineLetterSpacing', 'Letter Spacing', { min: -2, max: 10 }));
        taglineControls.appendChild(this._createSlider('taglineGap', 'Gap from Logo', { min: 5, max: 100 }));
        controlsContainer.appendChild(taglineControls);

        // Layout
        const layoutControls = this._createfieldset('Layout');
        layoutControls.appendChild(this._createSelect('layout', 'Layout', ['horizontal', 'vertical', 'stacked', 'circular']));
        layoutControls.appendChild(this._createSlider('spacing', 'Spacing', { min: 0, max: 100 }));
        layoutControls.appendChild(this._createSlider('padding', 'Padding', { min: 20, max: 200 }));
        controlsContainer.appendChild(layoutControls);

        // Colors
        const colorControls = this._createfieldset('Colors');
        colorControls.appendChild(this._createColorInput('textColor', 'Text Color'));
        colorControls.appendChild(this._createColorInput('accentColor', 'Accent Color'));
        colorControls.appendChild(this._createColorInput('gradientStart', 'Gradient Start'));
        colorControls.appendChild(this._createColorInput('gradientEnd', 'Gradient End'));
        controlsContainer.appendChild(colorControls);

        // Background
        const backgroundControls = this._createfieldset('Background');
        backgroundControls.appendChild(this._createSelect('backgroundType', 'Type', ['solid', 'gradient', 'pattern', 'transparent']));
        backgroundControls.appendChild(this._createColorInput('backgroundColor', 'Background Color'));
        backgroundControls.appendChild(this._createSelect('backgroundPattern', 'Pattern', ['none', 'dots', 'lines', 'grid', 'diagonal']));
        backgroundControls.appendChild(this._createSlider('backgroundOpacity', 'Opacity', { min: 0, max: 1, step: 0.1 }));
        controlsContainer.appendChild(backgroundControls);

        // Effects
        const effectsControls = this._createfieldset('Effects');
        effectsControls.appendChild(this._createSlider('shadowBlur', 'Shadow Blur', { min: 0, max: 50 }));
        effectsControls.appendChild(this._createSlider('shadowOffsetX', 'Shadow X', { min: -50, max: 50 }));
        effectsControls.appendChild(this._createSlider('shadowOffsetY', 'Shadow Y', { min: -50, max: 50 }));
        effectsControls.appendChild(this._createColorInput('shadowColor', 'Shadow Color'));
        controlsContainer.appendChild(effectsControls);

        // Animation
        const animationControls = this._createfieldset('Animation');
        animationControls.appendChild(this._createCheckbox('enableAnimation', 'Enable Animation'));
        animationControls.appendChild(this._createSelect('animationType', 'Type', ['pulse', 'rotate', 'slide', 'fade', 'bounce']));
        animationControls.appendChild(this._createSlider('animationSpeed', 'Speed', { min: 0.1, max: 3, step: 0.1 }));
        controlsContainer.appendChild(animationControls);

        this.uiContainer.appendChild(controlsContainer);
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

        if (this.settings.enableAnimation) {
            this.animationFrame = requestAnimationFrame((t) => this.draw(t));
        }
    }

    renderArtwork(ctx, width, height, settings, time = 0) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background
        this._drawBackground(ctx, width, height, settings);

        // Apply animation transforms
        if (settings.enableAnimation) {
            this._applyAnimation(ctx, width, height, settings, time);
        }

        // Draw logo
        this._drawLogo(ctx, width, height, settings, time);

        // Draw tagline
        if (settings.showTagline) {
            this._drawTagline(ctx, width, height, settings, time);
        }
    }

    _drawBackground(ctx, width, height, settings) {
        if (settings.backgroundType === 'transparent') return;

        ctx.save();

        if (settings.backgroundType === 'gradient') {
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, settings.gradientStart);
            gradient.addColorStop(1, settings.gradientEnd);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = settings.backgroundColor;
        }

        ctx.globalAlpha = settings.backgroundOpacity;
        ctx.fillRect(0, 0, width, height);

        // Draw pattern if enabled
        if (settings.backgroundPattern !== 'none') {
            this._drawPattern(ctx, width, height, settings);
        }

        ctx.restore();
    }

    _drawPattern(ctx, width, height, settings) {
        ctx.save();
        ctx.strokeStyle = settings.textColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.1;

        const patternSize = 20;
        
        switch (settings.backgroundPattern) {
            case 'dots':
                for (let x = 0; x < width; x += patternSize) {
                    for (let y = 0; y < height; y += patternSize) {
                        ctx.beginPath();
                        ctx.arc(x, y, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                break;
            case 'lines':
                for (let x = 0; x < width; x += patternSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                break;
            case 'grid':
                for (let x = 0; x < width; x += patternSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let y = 0; y < height; y += patternSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                break;
            case 'diagonal':
                for (let i = -height; i < width + height; i += patternSize) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i + height, height);
                    ctx.stroke();
                }
                break;
        }

        ctx.restore();
    }

    _drawLogo(ctx, width, height, settings, time) {
        ctx.save();

        // Set up text properties
        ctx.font = `${settings.fontWeight} ${settings.fontSize}px ${settings.fontFamily}`;
        ctx.textAlign = settings.textAlign;
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = settings.letterSpacing;

        // Apply rotation and skew
        const centerX = width / 2;
        const centerY = height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((settings.textRotation * Math.PI) / 180);
        ctx.transform(1, Math.tan((settings.textSkew * Math.PI) / 180), 0, 1, 0, 0);

        // Apply text effects
        this._applyTextEffect(ctx, settings);

        // Draw text
        const lines = settings.logoText.split('\n');
        const lineHeight = settings.fontSize * settings.lineHeight;
        const totalHeight = lines.length * lineHeight;
        let startY = -totalHeight / 2;

        lines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            ctx.fillText(line, 0, y);
        });

        ctx.restore();
    }

    _drawTagline(ctx, width, height, settings, time) {
        if (!settings.taglineText.trim()) return;

        ctx.save();

        // Set up tagline properties
        ctx.font = `${settings.taglineFontWeight} ${settings.taglineFontSize}px ${settings.taglineFontFamily}`;
        ctx.textAlign = settings.textAlign;
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = settings.taglineLetterSpacing;

        // Position tagline
        const centerX = width / 2;
        const centerY = height / 2 + settings.fontSize / 2 + settings.taglineGap;

        ctx.fillStyle = settings.textColor;
        ctx.fillText(settings.taglineText, centerX, centerY);

        ctx.restore();
    }

    _applyTextEffect(ctx, settings) {
        switch (settings.textEffect) {
            case 'outline':
                ctx.strokeStyle = settings.accentColor;
                ctx.lineWidth = 2;
                ctx.strokeText = ctx.strokeText.bind(ctx);
                break;
            case 'shadow':
                ctx.shadowBlur = settings.shadowBlur;
                ctx.shadowOffsetX = settings.shadowOffsetX;
                ctx.shadowOffsetY = settings.shadowOffsetY;
                ctx.shadowColor = settings.shadowColor;
                break;
            case 'gradient':
                const gradient = ctx.createLinearGradient(-200, 0, 200, 0);
                gradient.addColorStop(0, settings.gradientStart);
                gradient.addColorStop(1, settings.gradientEnd);
                ctx.fillStyle = gradient;
                break;
            default:
                ctx.fillStyle = settings.textColor;
        }
    }

    _applyAnimation(ctx, width, height, settings, time) {
        const speed = settings.animationSpeed;
        const centerX = width / 2;
        const centerY = height / 2;

        switch (settings.animationType) {
            case 'pulse':
                const pulseScale = 1 + Math.sin(time * speed * 0.01) * 0.1;
                ctx.scale(pulseScale, pulseScale);
                break;
            case 'rotate':
                const rotation = (time * speed * 0.01) % (Math.PI * 2);
                ctx.translate(centerX, centerY);
                ctx.rotate(rotation);
                ctx.translate(-centerX, -centerY);
                break;
            case 'slide':
                const slideX = Math.sin(time * speed * 0.01) * 20;
                ctx.translate(slideX, 0);
                break;
            case 'fade':
                const fadeAlpha = (Math.sin(time * speed * 0.01) + 1) / 2;
                ctx.globalAlpha = fadeAlpha;
                break;
            case 'bounce':
                const bounceY = Math.abs(Math.sin(time * speed * 0.01)) * 10;
                ctx.translate(0, -bounceY);
                break;
        }
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        window.removeEventListener('resize', this.boundDraw, false);
        super.destroy();
    }
}
