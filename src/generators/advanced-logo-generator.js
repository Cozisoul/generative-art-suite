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
            'Favicon': { width: 512, height: 512 },
            'Letterhead': { width: 1200, height: 300 },
            'Website Header': { width: 1920, height: 200 },
        };

        this.fontFamilies = [
            'Inter', 'Poppins', 'Montserrat', 'Oswald', 'Raleway', 
            'Roboto Mono', 'DM Sans', 'Space Grotesk', 'Playfair Display',
            'Merriweather', 'Lato', 'Open Sans', 'Source Sans Pro',
            'Nunito', 'Work Sans', 'Fira Sans', 'IBM Plex Sans'
        ];

        this.logoStyles = {
            'Modern Minimal': {
                description: 'Clean, simple, contemporary',
                characteristics: ['Sans-serif', 'High contrast', 'Geometric shapes', 'Minimal color']
            },
            'Vintage Classic': {
                description: 'Timeless, elegant, traditional',
                characteristics: ['Serif fonts', 'Warm colors', 'Ornamental elements', 'Classic proportions']
            },
            'Tech Startup': {
                description: 'Bold, innovative, digital-first',
                characteristics: ['Bold typography', 'Bright colors', 'Geometric icons', 'Modern spacing']
            },
            'Creative Agency': {
                description: 'Artistic, expressive, unique',
                characteristics: ['Custom typography', 'Creative layouts', 'Unique shapes', 'Expressive colors']
            },
            'Corporate Professional': {
                description: 'Trustworthy, established, formal',
                characteristics: ['Professional fonts', 'Conservative colors', 'Clean layout', 'Stable design']
            },
            'Eco Natural': {
                description: 'Organic, sustainable, earth-friendly',
                characteristics: ['Natural colors', 'Organic shapes', 'Hand-drawn elements', 'Earthy tones']
            }
        };

        this.iconShapes = [
            'Circle', 'Square', 'Rounded Square', 'Hexagon', 'Triangle',
            'Diamond', 'Star', 'Heart', 'Arrow', 'Shield', 'Badge',
            'Custom Geometric', 'Abstract', 'Letter-based', 'Symbol-based'
        ];

        this.settings = {
            // Text Content
            primaryText: 'LOGO',
            secondaryText: 'DESIGN',
            tagline: 'Creative Solutions',
            showTagline: true,
            
            // Typography
            primaryFont: 'Inter',
            secondaryFont: 'Inter',
            primaryWeight: '700',
            secondaryWeight: '400',
            primarySize: 120,
            secondarySize: 60,
            taglineSize: 24,
            letterSpacing: 0,
            lineHeight: 1.2,
            
            // Layout
            layoutStyle: 'horizontal',
            textAlignment: 'center',
            iconPosition: 'left',
            iconSize: 80,
            spacing: 20,
            padding: 60,
            
            // Icon/Logo Mark
            iconType: 'geometric',
            iconShape: 'Circle',
            iconStyle: 'filled',
            iconRotation: 0,
            iconScale: 1.0,
            customIcon: '',
            
            // Colors
            primaryColor: '#000000',
            secondaryColor: '#666666',
            accentColor: '#007AFF',
            backgroundColor: '#FFFFFF',
            useGradient: false,
            gradientStart: '#007AFF',
            gradientEnd: '#00D4FF',
            gradientAngle: 45,
            
            // Effects
            shadowEnabled: false,
            shadowColor: '#000000',
            shadowBlur: 10,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            borderEnabled: false,
            borderColor: '#000000',
            borderWidth: 2,
            
            // Style Presets
            logoStyle: 'Modern Minimal',
            colorScheme: 'monochrome',
            
            // Advanced
            kerning: 0,
            textTransform: 'none',
            iconOpacity: 1.0,
            backgroundOpacity: 1.0,
            textOpacity: 1.0,
        };

        this.previewPreset = this.presets['Square Logo'];
        this.colorSchemes = {
            'monochrome': ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF'],
            'blue': ['#001F3F', '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970', '#2ECC40'],
            'red': ['#85144B', '#FF4136', '#FF851B', '#FFDC00', '#FF6B6B', '#FFE66D'],
            'green': ['#2D5016', '#2ECC40', '#01FF70', '#39CCCC', '#0074D9', '#B10DC9'],
            'purple': ['#4B0082', '#8A2BE2', '#DA70D6', '#FF69B4', '#FF1493', '#FFB6C1'],
            'orange': ['#FF8C00', '#FFA500', '#FFD700', '#FFFF00', '#ADFF2F', '#00FF7F'],
            'neutral': ['#2C2C2C', '#696969', '#A9A9A9', '#D3D3D3', '#F5F5F5', '#FFFFFF'],
            'vibrant': ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
        };

        this.setup();
    }

    setup() {
        this.canvas = document.createElement('canvas');
        this.canvasContainer.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');

        this.createControls();
        this._createPreviewModal();
        this.boundDraw = this.draw.bind(this);
        window.addEventListener('resize', this.boundDraw, false);
        this.draw();
    }

    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls');

        // Style Presets
        const styleControls = this._createfieldset('Style Presets');
        styleControls.appendChild(this._createSelect('logoStyle', 'Logo Style', Object.keys(this.logoStyles)));
        styleControls.appendChild(this._createSelect('colorScheme', 'Color Scheme', Object.keys(this.colorSchemes)));
        controlsContainer.appendChild(styleControls);

        // Text Content
        const textControls = this._createfieldset('Text Content');
        textControls.appendChild(this._createTextInput('primaryText', 'Primary Text'));
        textControls.appendChild(this._createTextInput('secondaryText', 'Secondary Text'));
        textControls.appendChild(this._createTextInput('tagline', 'Tagline'));
        textControls.appendChild(this._createCheckbox('showTagline', 'Show Tagline'));
        controlsContainer.appendChild(textControls);

        // Typography
        const typographyControls = this._createfieldset('Typography');
        typographyControls.appendChild(this._createSelect('primaryFont', 'Primary Font', this.fontFamilies));
        typographyControls.appendChild(this._createSelect('primaryWeight', 'Primary Weight', ['300', '400', '500', '600', '700', '800', '900']));
        typographyControls.appendChild(this._createSlider('primarySize', 'Primary Size', { min: 20, max: 300 }));
        typographyControls.appendChild(this._createSelect('secondaryFont', 'Secondary Font', this.fontFamilies));
        typographyControls.appendChild(this._createSelect('secondaryWeight', 'Secondary Weight', ['300', '400', '500', '600', '700', '800', '900']));
        typographyControls.appendChild(this._createSlider('secondarySize', 'Secondary Size', { min: 10, max: 150 }));
        typographyControls.appendChild(this._createSlider('letterSpacing', 'Letter Spacing', { min: -5, max: 20 }));
        typographyControls.appendChild(this._createSelect('textTransform', 'Text Transform', ['none', 'uppercase', 'lowercase', 'capitalize']));
        controlsContainer.appendChild(typographyControls);

        // Layout
        const layoutControls = this._createfieldset('Layout');
        layoutControls.appendChild(this._createSelect('layoutStyle', 'Layout Style', ['horizontal', 'vertical', 'stacked', 'overlay']));
        layoutControls.appendChild(this._createSelect('textAlignment', 'Text Alignment', ['left', 'center', 'right']));
        layoutControls.appendChild(this._createSelect('iconPosition', 'Icon Position', ['left', 'right', 'top', 'bottom', 'center']));
        layoutControls.appendChild(this._createSlider('iconSize', 'Icon Size', { min: 20, max: 200 }));
        layoutControls.appendChild(this._createSlider('spacing', 'Element Spacing', { min: 0, max: 100 }));
        layoutControls.appendChild(this._createSlider('padding', 'Padding', { min: 0, max: 150 }));
        controlsContainer.appendChild(layoutControls);

        // Icon/Logo Mark
        const iconControls = this._createfieldset('Icon/Logo Mark');
        iconControls.appendChild(this._createSelect('iconType', 'Icon Type', ['geometric', 'text-based', 'symbol', 'custom', 'none']));
        iconControls.appendChild(this._createSelect('iconShape', 'Icon Shape', this.iconShapes));
        iconControls.appendChild(this._createSelect('iconStyle', 'Icon Style', ['filled', 'outline', 'gradient', 'pattern']));
        iconControls.appendChild(this._createSlider('iconRotation', 'Icon Rotation', { min: 0, max: 360, unit: '°' }));
        iconControls.appendChild(this._createSlider('iconScale', 'Icon Scale', { min: 0.5, max: 2.0, step: 0.1 }));
        iconControls.appendChild(this._createTextInput('customIcon', 'Custom Icon (Unicode)'));
        controlsContainer.appendChild(iconControls);

        // Colors
        const colorControls = this._createfieldset('Colors');
        colorControls.appendChild(this._createColorInput('primaryColor', 'Primary Color'));
        colorControls.appendChild(this._createColorInput('secondaryColor', 'Secondary Color'));
        colorControls.appendChild(this._createColorInput('accentColor', 'Accent Color'));
        colorControls.appendChild(this._createColorInput('backgroundColor', 'Background Color'));
        colorControls.appendChild(this._createCheckbox('useGradient', 'Use Gradient'));
        colorControls.appendChild(this._createColorInput('gradientStart', 'Gradient Start'));
        colorControls.appendChild(this._createColorInput('gradientEnd', 'Gradient End'));
        colorControls.appendChild(this._createSlider('gradientAngle', 'Gradient Angle', { min: 0, max: 360, unit: '°' }));
        controlsContainer.appendChild(colorControls);

        // Effects
        const effectControls = this._createfieldset('Effects');
        effectControls.appendChild(this._createCheckbox('shadowEnabled', 'Enable Shadow'));
        effectControls.appendChild(this._createColorInput('shadowColor', 'Shadow Color'));
        effectControls.appendChild(this._createSlider('shadowBlur', 'Shadow Blur', { min: 0, max: 50 }));
        effectControls.appendChild(this._createSlider('shadowOffsetX', 'Shadow X Offset', { min: -20, max: 20 }));
        effectControls.appendChild(this._createSlider('shadowOffsetY', 'Shadow Y Offset', { min: -20, max: 20 }));
        effectControls.appendChild(this._createCheckbox('borderEnabled', 'Enable Border'));
        effectControls.appendChild(this._createColorInput('borderColor', 'Border Color'));
        effectControls.appendChild(this._createSlider('borderWidth', 'Border Width', { min: 1, max: 20 }));
        controlsContainer.appendChild(effectControls);

        // Advanced
        const advancedControls = this._createfieldset('Advanced');
        advancedControls.appendChild(this._createSlider('kerning', 'Kerning', { min: -10, max: 10 }));
        advancedControls.appendChild(this._createSlider('iconOpacity', 'Icon Opacity', { min: 0, max: 1, step: 0.1 }));
        advancedControls.appendChild(this._createSlider('textOpacity', 'Text Opacity', { min: 0, max: 1, step: 0.1 }));
        advancedControls.appendChild(this._createSlider('backgroundOpacity', 'Background Opacity', { min: 0, max: 1, step: 0.1 }));
        controlsContainer.appendChild(advancedControls);

        this.appendDownloadControls(controlsContainer);
        this.uiContainer.appendChild(controlsContainer);
    }

    draw() {
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

        this.renderArtwork(this.context, this.previewPreset.width, this.previewPreset.height, this.settings);

        this.context.restore();
    }

    renderArtwork(ctx, width, height, settings) {
        // Clear canvas
        ctx.fillStyle = settings.backgroundColor;
        ctx.globalAlpha = settings.backgroundOpacity;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;

        const centerX = width / 2;
        const centerY = height / 2;
        const padding = settings.padding;

        // Calculate text dimensions
        const primaryText = this._transformText(settings.primaryText, settings.textTransform);
        const secondaryText = this._transformText(settings.secondaryText, settings.textTransform);
        const tagline = this._transformText(settings.tagline, settings.textTransform);

        // Set up fonts
        ctx.font = `${settings.primaryWeight} ${settings.primarySize}px ${settings.primaryFont}`;
        const primaryMetrics = ctx.measureText(primaryText);
        const primaryWidth = primaryMetrics.width;

        ctx.font = `${settings.secondaryWeight} ${settings.secondarySize}px ${settings.secondaryFont}`;
        const secondaryMetrics = ctx.measureText(secondaryText);
        const secondaryWidth = secondaryMetrics.width;

        ctx.font = `${settings.secondaryWeight} ${settings.taglineSize}px ${settings.secondaryFont}`;
        const taglineMetrics = ctx.measureText(tagline);
        const taglineWidth = taglineMetrics.width;

        // Calculate total dimensions
        const iconSize = settings.iconSize;
        const spacing = settings.spacing;
        const totalHeight = settings.primarySize + settings.secondarySize + (settings.showTagline ? settings.taglineSize + spacing : 0) + spacing * 2;
        const totalWidth = Math.max(primaryWidth, secondaryWidth, taglineWidth) + iconSize + spacing;

        // Calculate starting positions
        let startX = centerX - totalWidth / 2;
        let startY = centerY - totalHeight / 2;

        // Adjust for padding
        startX = Math.max(padding, startX);
        startY = Math.max(padding, startY);

        // Draw icon/logo mark
        if (settings.iconType !== 'none') {
            const iconX = settings.iconPosition === 'left' ? startX : 
                        settings.iconPosition === 'right' ? startX + totalWidth - iconSize :
                        centerX - iconSize / 2;
            const iconY = settings.iconPosition === 'top' ? startY :
                        settings.iconPosition === 'bottom' ? startY + totalHeight - iconSize :
                        centerY - iconSize / 2;

            this._drawIcon(ctx, iconX, iconY, iconSize, settings);
        }

        // Draw text elements
        let textX = settings.iconPosition === 'left' ? startX + iconSize + spacing : startX;
        let textY = startY + settings.primarySize;

        // Primary text
        ctx.font = `${settings.primaryWeight} ${settings.primarySize}px ${settings.primaryFont}`;
        ctx.fillStyle = settings.primaryColor;
        ctx.globalAlpha = settings.textOpacity;
        this._applyTextEffects(ctx, settings);
        this._drawTextWithKerning(ctx, primaryText, textX, textY, settings.kerning);

        // Secondary text
        textY += settings.primarySize + spacing;
        ctx.font = `${settings.secondaryWeight} ${settings.secondarySize}px ${settings.secondaryFont}`;
        ctx.fillStyle = settings.secondaryColor;
        this._drawTextWithKerning(ctx, secondaryText, textX, textY, settings.kerning);

        // Tagline
        if (settings.showTagline) {
            textY += settings.secondarySize + spacing;
            ctx.font = `${settings.secondaryWeight} ${settings.taglineSize}px ${settings.secondaryFont}`;
            ctx.fillStyle = settings.accentColor;
            this._drawTextWithKerning(ctx, tagline, textX, textY, settings.kerning);
        }

        ctx.globalAlpha = 1.0;
    }

    _transformText(text, transform) {
        switch (transform) {
            case 'uppercase': return text.toUpperCase();
            case 'lowercase': return text.toLowerCase();
            case 'capitalize': return text.replace(/\b\w/g, l => l.toUpperCase());
            default: return text;
        }
    }

    _drawTextWithKerning(ctx, text, x, y, kerning) {
        let currentX = x;
        for (let i = 0; i < text.length; i++) {
            ctx.fillText(text[i], currentX, y);
            const metrics = ctx.measureText(text[i]);
            currentX += metrics.width + kerning;
        }
    }

    _applyTextEffects(ctx, settings) {
        if (settings.shadowEnabled) {
            ctx.shadowColor = settings.shadowColor;
            ctx.shadowBlur = settings.shadowBlur;
            ctx.shadowOffsetX = settings.shadowOffsetX;
            ctx.shadowOffsetY = settings.shadowOffsetY;
        }

        if (settings.borderEnabled) {
            ctx.strokeStyle = settings.borderColor;
            ctx.lineWidth = settings.borderWidth;
        }
    }

    _drawIcon(ctx, x, y, size, settings) {
        ctx.save();
        ctx.globalAlpha = settings.iconOpacity;
        
        // Apply rotation
        if (settings.iconRotation !== 0) {
            ctx.translate(x + size / 2, y + size / 2);
            ctx.rotate((settings.iconRotation * Math.PI) / 180);
            ctx.translate(-size / 2, -size / 2);
            x = 0;
            y = 0;
        }

        // Apply scale
        if (settings.iconScale !== 1.0) {
            ctx.scale(settings.iconScale, settings.iconScale);
            size = size / settings.iconScale;
        }

        // Set up icon style
        if (settings.iconStyle === 'outline') {
            ctx.strokeStyle = settings.accentColor;
            ctx.lineWidth = 3;
        } else if (settings.iconStyle === 'gradient' && settings.useGradient) {
            const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
            gradient.addColorStop(0, settings.gradientStart);
            gradient.addColorStop(1, settings.gradientEnd);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = settings.accentColor;
        }

        // Draw icon based on shape
        this._drawIconShape(ctx, x, y, size, settings);

        ctx.restore();
    }

    _drawIconShape(ctx, x, y, size, settings) {
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = size / 2;

        switch (settings.iconShape) {
            case 'Circle':
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                if (settings.iconStyle === 'outline') {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
                break;

            case 'Square':
                if (settings.iconStyle === 'outline') {
                    ctx.strokeRect(x, y, size, size);
                } else {
                    ctx.fillRect(x, y, size, size);
                }
                break;

            case 'Rounded Square':
                const cornerRadius = size * 0.2;
                ctx.beginPath();
                ctx.roundRect(x, y, size, size, cornerRadius);
                if (settings.iconStyle === 'outline') {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
                break;

            case 'Hexagon':
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i * 60 * Math.PI) / 180;
                    const px = centerX + radius * Math.cos(angle);
                    const py = centerY + radius * Math.sin(angle);
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                if (settings.iconStyle === 'outline') {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
                break;

            case 'Triangle':
                ctx.beginPath();
                ctx.moveTo(centerX, y);
                ctx.lineTo(x, y + size);
                ctx.lineTo(x + size, y + size);
                ctx.closePath();
                if (settings.iconStyle === 'outline') {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
                break;

            case 'Diamond':
                ctx.beginPath();
                ctx.moveTo(centerX, y);
                ctx.lineTo(x + size, centerY);
                ctx.lineTo(centerX, y + size);
                ctx.lineTo(x, centerY);
                ctx.closePath();
                if (settings.iconStyle === 'outline') {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
                break;

            case 'Star':
                ctx.beginPath();
                for (let i = 0; i < 10; i++) {
                    const angle = (i * 36 * Math.PI) / 180;
                    const r = i % 2 === 0 ? radius : radius * 0.5;
                    const px = centerX + r * Math.cos(angle - Math.PI / 2);
                    const py = centerY + r * Math.sin(angle - Math.PI / 2);
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                if (settings.iconStyle === 'outline') {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
                break;

            case 'Arrow':
                ctx.beginPath();
                ctx.moveTo(x, centerY);
                ctx.lineTo(x + size * 0.7, centerY);
                ctx.lineTo(x + size * 0.7, y);
                ctx.lineTo(x + size, centerY);
                ctx.lineTo(x + size * 0.7, y + size);
                ctx.lineTo(x + size * 0.7, centerY);
                ctx.closePath();
                if (settings.iconStyle === 'outline') {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
                break;

            case 'Shield':
                ctx.beginPath();
                ctx.moveTo(centerX, y);
                ctx.lineTo(x, y + size * 0.3);
                ctx.lineTo(x, y + size * 0.7);
                ctx.quadraticCurveTo(x, y + size, centerX, y + size);
                ctx.quadraticCurveTo(x + size, y + size, x + size, y + size * 0.7);
                ctx.lineTo(x + size, y + size * 0.3);
                ctx.closePath();
                if (settings.iconStyle === 'outline') {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
                break;

            case 'Letter-based':
                ctx.font = `${settings.primaryWeight} ${size * 0.8}px ${settings.primaryFont}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(settings.primaryText[0] || 'L', centerX, centerY);
                break;

            case 'Custom':
                if (settings.customIcon) {
                    ctx.font = `${size}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(settings.customIcon, centerX, centerY);
                }
                break;

            default:
                // Default to circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                if (settings.iconStyle === 'outline') {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
        }
    }

    _applyStylePreset(styleName) {
        const style = this.logoStyles[styleName];
        if (!style) return;

        switch (styleName) {
            case 'Modern Minimal':
                this.settings.primaryFont = 'Inter';
                this.settings.primaryWeight = '700';
                this.settings.primaryColor = '#000000';
                this.settings.backgroundColor = '#FFFFFF';
                this.settings.iconStyle = 'filled';
                this.settings.iconShape = 'Circle';
                break;

            case 'Vintage Classic':
                this.settings.primaryFont = 'Playfair Display';
                this.settings.primaryWeight = '400';
                this.settings.primaryColor = '#8B4513';
                this.settings.backgroundColor = '#F5F5DC';
                this.settings.iconStyle = 'outline';
                this.settings.iconShape = 'Shield';
                break;

            case 'Tech Startup':
                this.settings.primaryFont = 'Space Grotesk';
                this.settings.primaryWeight = '700';
                this.settings.primaryColor = '#007AFF';
                this.settings.backgroundColor = '#000000';
                this.settings.iconStyle = 'gradient';
                this.settings.iconShape = 'Hexagon';
                break;

            case 'Creative Agency':
                this.settings.primaryFont = 'Poppins';
                this.settings.primaryWeight = '600';
                this.settings.primaryColor = '#FF6B6B';
                this.settings.backgroundColor = '#F8F9FA';
                this.settings.iconStyle = 'filled';
                this.settings.iconShape = 'Custom';
                break;

            case 'Corporate Professional':
                this.settings.primaryFont = 'Inter';
                this.settings.primaryWeight = '500';
                this.settings.primaryColor = '#2C3E50';
                this.settings.backgroundColor = '#FFFFFF';
                this.settings.iconStyle = 'outline';
                this.settings.iconShape = 'Square';
                break;

            case 'Eco Natural':
                this.settings.primaryFont = 'Nunito';
                this.settings.primaryWeight = '600';
                this.settings.primaryColor = '#27AE60';
                this.settings.backgroundColor = '#F1F8E9';
                this.settings.iconStyle = 'filled';
                this.settings.iconShape = 'Circle';
                break;
        }

        this.draw();
    }

    _applyColorScheme(schemeName) {
        const colors = this.colorSchemes[schemeName];
        if (!colors) return;

        this.settings.primaryColor = colors[0];
        this.settings.secondaryColor = colors[1];
        this.settings.accentColor = colors[2];
        this.settings.backgroundColor = colors[5];

        this.draw();
    }

    // Override the setting change handler to apply presets
    _handleSettingChange(key, value) {
        // Update the setting
        this.settings[key] = value;

        if (key === 'logoStyle') {
            this._applyStylePreset(value);
        } else if (key === 'colorScheme') {
            this._applyColorScheme(value);
        }
    }
}
