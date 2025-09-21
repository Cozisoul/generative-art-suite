import BaseGenerator from '../BaseGenerator.js';

export default class LogoGenerator extends BaseGenerator {
    constructor(canvasContainer, uiContainer) {
        super(canvasContainer, uiContainer);

        this.presets = {
            'Standard Logo': { width: 1000, height: 1000 },
            'Wide Banner': { width: 1500, height: 500 },
            'Social Profile': { width: 800, height: 800 },
        };

        this.colorPalettes = {
            'Swiss': { bg: '#f1f1f1', text: '#111111', mark: '#E31B23' },
            'Bauhaus': { bg: '#f0e9d9', text: '#222222', mark: '#00579d' },
            'Brutalist': { bg: '#e0e0e0', text: '#111111', mark: '#111111' },
            'Brutalist (Dark)': { bg: '#111111', text: '#e0e0e0', mark: '#00ff6a' },
            'Custom': {},
        };

        this.settings = {
            // Core
            logoText: 'GEMINI',
            fontFamily: 'DM Sans',
            fontWeight: '700',
            fontSize: 150,
            letterSpacing: 5,
            taglineText: 'Design Systems',
            taglineFontSize: 30,
            taglineFontWeight: '400',
            taglineGap: 15,
            // Mark
            markType: 'monogram',
            markComplexity: 3,
            markSize: 1.0,
            markPosition: 'left',
            markGap: 0.5,
            // Style
            designStyle: 'Swiss',
            paletteName: 'Swiss',
            backgroundColor: '#f1f1f1',
            textColor: '#111111',
            markColor: '#E31B23',
            // Bauhaus Specific
            textArrangement: 'horizontal',
            // Brutalist Specific
            distress: 0,
            jitter: 0,
            showGrid: false,
            brokenGrid: false,
            gridSize: 50,
            snapToGrid: false,
            markAlignment: 0, // -1 (top/left), 0 (center), 1 (bottom/right)
            offsetX: 0,
            offsetY: 0,
        };
        this.settings.useCase = Object.keys(this.presets)[0]; // Set default use case

        this.canvas = null;
        this.context = null;
        this.previewPreset = this.presets[this.settings.useCase];
        this.isApplyingPreset = false;

        this.setup();
    }

    setup() {
        this.canvas = document.createElement('canvas');
        this.canvasContainer.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');

        this.createControls();
        this._updateControlVisibility();
        this._createPreviewModal();

        this.boundDraw = this.draw.bind(this);
        window.addEventListener('resize', this.boundDraw, false);

        this.draw();
    }

    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls');

        const styleControls = this._createfieldset('Design Style');
        styleControls.appendChild(this._createSelect('designStyle', 'Style', ['Swiss', 'Bauhaus', 'Brutalist']));
        controlsContainer.appendChild(styleControls);

        const useCaseControls = this._createfieldset('Page Setup');
        useCaseControls.appendChild(this._createPresetSelect({ settingKey: 'useCase', labelText: 'Use Case' }));
        controlsContainer.appendChild(useCaseControls);

        const textControls = this._createfieldset('Logotype');
        textControls.appendChild(this._createTextInput('logoText', 'Text'));
        textControls.appendChild(this._createSelect('fontFamily', 'Font', ['Poppins', 'Montserrat', 'Oswald', 'Raleway', 'Roboto Mono', 'DM Sans', 'Space Grotesk']));
        textControls.appendChild(this._createSelect('fontWeight', 'Weight', ['400', '700', '900']));
        textControls.appendChild(this._createSlider('fontSize', 'Size', { min: 20, max: 400 }));
        textControls.appendChild(this._createSlider('letterSpacing', 'Spacing', { min: -10, max: 50 }));
        controlsContainer.appendChild(textControls);

        const taglineControls = this._createfieldset('Tagline');
        taglineControls.appendChild(this._createTextInput('taglineText', 'Text'));
        taglineControls.appendChild(this._createSelect('taglineFontWeight', 'Weight', ['400', '700', '900']));
        taglineControls.appendChild(this._createSlider('taglineFontSize', 'Size', { min: 10, max: 200 }));
        taglineControls.appendChild(this._createSlider('taglineGap', 'Gap', { min: 0, max: 100 }));
        controlsContainer.appendChild(taglineControls);

        const markControls = this._createfieldset('Mark');
        markControls.appendChild(this._createSelect('markType', 'Style', ['monogram', 'geometric', 'circle', 'grid', 'none']));
        markControls.appendChild(this._createSlider('markComplexity', 'Complexity', { min: 1, max: 10 }));
        markControls.appendChild(this._createSlider('markSize', 'Size', { min: 0.5, max: 3, step: 0.1 }));
        markControls.appendChild(this._createSelect('markPosition', 'Position', ['left', 'right', 'top', 'bottom', 'stacked', 'enclosed']));
        markControls.appendChild(this._createSlider('markGap', 'Mark Gap', { min: -0.5, max: 2, step: 0.1 }));
        controlsContainer.appendChild(markControls);

        const colorControls = this._createfieldset('Color');
        colorControls.appendChild(this._createSelect('paletteName', 'Color Palette', Object.keys(this.colorPalettes)));
        colorControls.appendChild(this._createColorInput('backgroundColor', 'Background'));
        colorControls.appendChild(this._createColorInput('textColor', 'Text Color'));
        colorControls.appendChild(this._createColorInput('markColor', 'Mark Color'));
        controlsContainer.appendChild(colorControls);

        const bauhausControls = this._createfieldset('Bauhaus Controls');
        bauhausControls.dataset.styleControl = 'Bauhaus';
        bauhausControls.appendChild(this._createSelect('textArrangement', 'Text Arrangement', ['horizontal', 'vertical', 'diagonal', 'wrapped']));
        controlsContainer.appendChild(bauhausControls);

        const brutalistControls = this._createfieldset('Brutalist Controls');
        brutalistControls.dataset.styleControl = 'Brutalist';
        brutalistControls.appendChild(this._createSlider('distress', 'Distress', { min: 0, max: 1, step: 0.01 }));
        brutalistControls.appendChild(this._createSlider('jitter', 'Jitter', { min: 0, max: 50 }));
        brutalistControls.appendChild(this._createCheckbox('showGrid', 'Show Grid'));
        brutalistControls.appendChild(this._createCheckbox('brokenGrid', 'Broken Grid'));
        controlsContainer.appendChild(brutalistControls);

        const placementControls = this._createfieldset('Placement');
        placementControls.appendChild(this._createSlider('markAlignment', 'Alignment', { min: -1, max: 1, step: 0.1 }));
        placementControls.appendChild(this._createSlider('offsetX', 'Offset X', { min: -500, max: 500 }));
        placementControls.appendChild(this._createSlider('offsetY', 'Offset Y', { min: -500, max: 500 }));
        controlsContainer.appendChild(placementControls);

        const gridSnappingControls = this._createfieldset('Grid & Snapping');
        gridSnappingControls.appendChild(this._createCheckbox('showGrid', 'Show Guide Grid'));
        gridSnappingControls.appendChild(this._createSlider('gridSize', 'Grid Size', { min: 10, max: 200 }));
        gridSnappingControls.appendChild(this._createCheckbox('snapToGrid', 'Snap to Grid'));
        controlsContainer.appendChild(gridSnappingControls);

        const exportControls = this._createfieldset('Export');
        exportControls.appendChild(this._createCheckbox('transparentBg', 'Transparent BG', false));
        controlsContainer.appendChild(exportControls);

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

        if (key === 'designStyle') {
            this._updateControlVisibility();
            this.settings.paletteName = value; // Default to the style's palette
            this._applyPalette(value);
        }

        // If a color is changed manually, switch palette to 'Custom'
        if (['backgroundColor', 'textColor', 'markColor'].includes(key)) {
            if (this.settings.paletteName !== 'Custom') {
                this.settings.paletteName = 'Custom';
                const paletteControl = this.uiContainer.querySelector('select[data-setting="paletteName"]');
                if (paletteControl) paletteControl.value = 'Custom';
            }
        }
    }

    _updateControlVisibility() {
        const style = this.settings.designStyle;
        const allStyleControls = this.uiContainer.querySelectorAll('[data-style-control]');
        allStyleControls.forEach(el => {
            if (el.dataset.styleControl === style) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    }

    _applyPalette(paletteName) {
        const palette = this.colorPalettes[paletteName];
        if (!palette || paletteName === 'Custom') return;

        this.isApplyingPreset = true;

        this.settings.backgroundColor = palette.bg;
        this.settings.textColor = palette.text;
        this.settings.markColor = palette.mark;

        // Update UI controls
        const bgColorInput = this.uiContainer.querySelector('[data-setting="backgroundColor"]');
        if (bgColorInput) bgColorInput.value = palette.bg;
        const textColorInput = this.uiContainer.querySelector('[data-setting="textColor"]');
        if (textColorInput) textColorInput.value = palette.text;
        const markColorInput = this.uiContainer.querySelector('[data-setting="markColor"]');
        if (markColorInput) markColorInput.value = palette.mark;

        this.isApplyingPreset = false;
        this.draw();
    }

    downloadArtwork(preset, presetName) {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = preset.width;
        offscreenCanvas.height = preset.height;
        const offscreenContext = offscreenCanvas.getContext('2d');

        const downloadSettings = { ...this.settings };
        if (this.settings.transparentBg) {
            // Pass a flag to the render function to skip drawing the background
            downloadSettings.skipBackground = true;
        }

        // Render the artwork onto the offscreen canvas
        this.renderArtwork(offscreenContext, preset.width, preset.height, downloadSettings);

        const link = document.createElement('a');
        link.download = this._getDownloadFilename(presetName);
        link.href = offscreenCanvas.toDataURL('image/png');
        link.click();
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

    renderArtwork(ctx, width, height, settings, time = 0) {
        const {
            designStyle, logoText, fontFamily, fontWeight, fontSize, letterSpacing, taglineText,
            taglineFontWeight, taglineFontSize, taglineGap,
            markType, markComplexity, markPosition, markSize, markGap,
            markColor, textColor, backgroundColor, distress, jitter, showGrid,
            textArrangement
        } = settings;

        // Background
        if (!settings.skipBackground) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
        }

        // --- 1. Measure all elements ---
        const jitterX = (Math.random() - 0.5) * jitter;
        const jitterY = (Math.random() - 0.5) * jitter;

        // Measure Logotype
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        let textWidth = 0;
        let textHeight = 0;
        if (textArrangement === 'vertical' && designStyle === 'Bauhaus') {
            textWidth = fontSize;
            textHeight = logoText.length * fontSize * 0.8;
        } else {
            const textMetrics = ctx.measureText(logoText);
            textWidth = textMetrics.width + (logoText.length > 1 ? (logoText.length - 1) * letterSpacing : 0);
            textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        }

        // Measure Tagline
        const hasTagline = taglineText && taglineText.trim() !== '';
        let taglineHeight = 0;
        let taglineWidth = 0;
        if (hasTagline) {
            ctx.font = `${taglineFontWeight} ${taglineFontSize}px ${fontFamily}`;
            const taglineMetrics = ctx.measureText(taglineText);
            taglineWidth = taglineMetrics.width; // No letter spacing for tagline
            taglineHeight = taglineMetrics.actualBoundingBoxAscent + taglineMetrics.actualBoundingBoxDescent;
        }

        // Combine text elements into a single conceptual block
        const combinedTextHeight = hasTagline ? textHeight + taglineGap + taglineHeight : textHeight;
        const combinedTextWidth = Math.max(textWidth, taglineWidth);

        // Measure Mark
        const markDim = textHeight * markSize;
        const hasMark = markType !== 'none';

        // --- 2. Calculate Layout Positions ---
        const layout = this._calculateLayout(width, height, {
            textWidth, textHeight, taglineWidth, taglineHeight, taglineGap, hasTagline,
            combinedTextWidth, combinedTextHeight,
            markDim, hasMark, markGap
        }, settings);

        // --- 3. Draw Elements ---

        // Draw enclosed mark background first
        if (markPosition === 'enclosed' && hasMark) {
            ctx.save();
            ctx.translate(layout.markPos.x + jitterX, layout.markPos.y + jitterY);
            this._drawMark(ctx, markDim, settings);
            ctx.restore();
        }

        // Draw Logotype
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        let finalTextColor = textColor;
        if (markPosition === 'enclosed' && hasMark) {
            const r = parseInt(markColor.slice(1, 3), 16);
            const g = parseInt(markColor.slice(3, 5), 16);
            const b = parseInt(markColor.slice(5, 7), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            finalTextColor = brightness > 128 ? '#111111' : '#FFFFFF';
        }
        ctx.fillStyle = finalTextColor;

        ctx.save();
        ctx.translate(layout.textPos.x + jitterX, layout.textPos.y + jitterY);
        if (designStyle === 'Bauhaus' && textArrangement === 'diagonal') {
            ctx.rotate(-Math.PI / 4);
        }

        if (designStyle === 'Bauhaus' && textArrangement === 'vertical') {
            for (let i = 0; i < logoText.length; i++) {
                ctx.fillText(logoText[i], 0, i * fontSize * 0.8 - textHeight / 2);
            }
        } else {
            this._drawLetterSpacedText(ctx, logoText, 0, 0, letterSpacing);
        }
        ctx.restore();

        // Draw Tagline
        if (hasTagline) {
            ctx.font = `${taglineFontWeight} ${taglineFontSize}px ${fontFamily}`;
            ctx.textAlign = 'center'; // Taglines are usually centered under the logotype
            ctx.fillText(taglineText, layout.taglinePos.x, layout.taglinePos.y);
        }

        // Draw non-enclosed mark
        if (hasMark && markPosition !== 'enclosed') {
            ctx.save();
            ctx.translate(layout.markPos.x + jitterX, layout.markPos.y + jitterY);
            this._drawMark(ctx, markDim, settings);
            ctx.restore();
        }

        // --- 4. Draw Style-Specific Overlays ---
        if (designStyle === 'Brutalist') {
            if (distress > 0) this._drawDistress(ctx, width, height, distress);
        }
        if (showGrid) this._drawGuideGrid(ctx, width, height, settings);
    }

    _drawLetterSpacedText(ctx, text, x, y, spacing) {
        let currentX = x;
        // To center the text block, we need to find its total width first
        let totalWidth = 0;
        for (let i = 0; i < text.length; i++) {
            totalWidth += ctx.measureText(text[i]).width;
            if (i < text.length - 1) totalWidth += spacing;
        }

        // Start drawing from a centered position
        currentX -= totalWidth / 2;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            ctx.fillText(char, currentX, y);
            currentX += ctx.measureText(char).width + spacing;
        }
    }

    _calculateLayout(width, height, dims, settings) {
        const { textWidth, textHeight, taglineWidth, taglineGap, hasTagline, combinedTextWidth, combinedTextHeight, markDim, hasMark, markGap } = dims;
        const { markPosition, offsetX, offsetY, markAlignment, snapToGrid, gridSize, designStyle, brokenGrid } = settings;
        const gap = textHeight * markGap;

        let totalWidth, totalHeight;
        let textX, textY, markX, markY, taglineX, taglineY;

        if (markPosition === 'left' && hasMark) {
            totalWidth = markDim + gap + combinedTextWidth;
            totalHeight = Math.max(markDim, combinedTextHeight);
            markX = (width - totalWidth) / 2;
            markY = (height - totalHeight) / 2 + (totalHeight - markDim) / 2 + (markAlignment * (totalHeight - markDim) / 2);
            textX = markX + markDim + gap + combinedTextWidth / 2;
            textY = (height - totalHeight) / 2 + (totalHeight - combinedTextHeight) / 2 + textHeight / 2;
        } else if (markPosition === 'right' && hasMark) {
            totalWidth = markDim + gap + combinedTextWidth;
            totalHeight = Math.max(markDim, combinedTextHeight);
            const textBlockStartX = (width - totalWidth) / 2;
            textX = textBlockStartX + combinedTextWidth / 2;
            textY = (height - totalHeight) / 2 + (totalHeight - combinedTextHeight) / 2 + textHeight / 2;
            markX = textBlockStartX + combinedTextWidth + gap;
            markY = (height - totalHeight) / 2 + (totalHeight - markDim) / 2 + (markAlignment * (totalHeight - markDim) / 2);
        } else if (markPosition === 'top' && hasMark) {
            totalWidth = Math.max(markDim, combinedTextWidth);
            totalHeight = markDim + gap + combinedTextHeight;
            markX = (width - totalWidth) / 2 + (totalWidth - markDim) / 2;
            markY = (height - totalHeight) / 2;
            textX = width / 2;
            textY = markY + markDim + gap + textHeight / 2;
        } else if (markPosition === 'bottom' && hasMark) {
            totalWidth = Math.max(markDim, combinedTextWidth);
            totalHeight = markDim + gap + combinedTextHeight;
            textX = width / 2;
            textY = (height - totalHeight) / 2 + textHeight / 2;
            markX = (width - totalWidth) / 2 + (totalWidth - markDim) / 2 + (markAlignment * (totalWidth - markDim) / 2);
            markY = (height - totalHeight) / 2 + combinedTextHeight + gap;
        } else if (markPosition === 'stacked' && hasMark) {
            totalWidth = Math.max(markDim, combinedTextWidth);
            totalHeight = markDim + gap + combinedTextHeight;
            markX = (width - markDim) / 2;
            markY = (height - totalHeight) / 2;
            textX = width / 2;
            textY = markY + markDim + gap + textHeight / 2;
        } else if (markPosition === 'enclosed' && hasMark) {
            totalWidth = Math.max(markDim, combinedTextWidth);
            totalHeight = Math.max(markDim, combinedTextHeight);
            markX = (width - markDim) / 2;
            markY = (height - markDim) / 2;
            textX = width / 2;
            textY = height / 2 - (hasTagline ? (taglineGap + dims.taglineHeight) / 2 : 0);
        } else { // No mark
            totalWidth = combinedTextWidth;
            totalHeight = combinedTextHeight;
            textX = (width - textWidth) / 2;
            textY = (height - totalHeight) / 2 + textHeight / 2;
            markX = -1; markY = -1;
        }

        // Calculate tagline position relative to the main text block
        taglineX = width / 2; // Always center tagline horizontally on canvas
        taglineY = textY + textHeight / 2 + taglineGap + (hasTagline ? dims.taglineHeight / 2 : 0);

        if (designStyle === 'Brutalist' && brokenGrid) {
            textX += (Math.random() - 0.5) * (width * 0.1);
            markY += (Math.random() - 0.5) * (height * 0.1);
        }

        if (snapToGrid) {
            textX = Math.round(textX / gridSize) * gridSize;
            textY = Math.round(textY / gridSize) * gridSize;
            markX = Math.round(markX / gridSize) * gridSize;
            markY = Math.round(markY / gridSize) * gridSize;
            taglineX = Math.round(taglineX / gridSize) * gridSize;
            taglineY = Math.round(taglineY / gridSize) * gridSize;
        }

        return {
            textPos: { x: textX + offsetX, y: textY + offsetY },
            markPos: { x: markX + offsetX, y: markY + offsetY },
            taglinePos: { x: taglineX + offsetX, y: taglineY + offsetY }
        };
    }

    _drawMark(ctx, size, settings) {
        const { designStyle, markType, markComplexity, markColor, logoText, fontFamily, fontWeight } = settings;
        ctx.strokeStyle = markColor;
        ctx.fillStyle = markColor;
        ctx.lineWidth = size * 0.1;
        ctx.lineCap = 'round';

        switch (markType) {
            case 'geometric': {
                // Rebuilt: More compositional geometric mark
                if (designStyle === 'Bauhaus') {
                    ctx.lineWidth = size * 0.05;
                    ctx.strokeStyle = '#222222';
                }
                ctx.translate(size / 2, size / 2); // Center the composition
                const shapeCount = Math.max(2, Math.floor(markComplexity / 3));
                for (let i = 0; i < shapeCount; i++) {
                    ctx.save();
                    const angle = (i / shapeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
                    ctx.rotate(angle);
                    const s = size * (0.3 + Math.random() * 0.4);
                    const offset = size * 0.15;
                    if (Math.random() > 0.5) {
                        ctx.fillRect(offset, -s / 2, s, s);
                        if (designStyle === 'Bauhaus') ctx.strokeRect(offset, -s / 2, s, s);
                    } else {
                        ctx.beginPath();
                        ctx.arc(offset + s / 2, 0, s / 2, 0, Math.PI * 2);
                        ctx.fill();
                        if (designStyle === 'Bauhaus') ctx.stroke();
                    }
                    ctx.restore();
                }
                break;
            }
            case 'lines': {
                // Rebuilt: Creates structured, parallel-ish lines
                ctx.translate(size / 2, size / 2);
                const angle = Math.random() * Math.PI;
                ctx.rotate(angle);
                const lineCount = markComplexity * 2;
                for (let i = 0; i < lineCount; i++) {
                    ctx.beginPath();
                    const y = (i / (lineCount - 1) - 0.5) * size;
                    const x1 = -size / 2 + (Math.random() - 0.5) * size * 0.2;
                    const x2 = size / 2 + (Math.random() - 0.5) * size * 0.2;
                    ctx.moveTo(x1, y);
                    ctx.lineTo(x2, y);
                    ctx.stroke();
                }
                break;
            }
            case 'circle': {
                // Rebuilt: Creates concentric circles
                ctx.translate(size / 2, size / 2);
                const steps = markComplexity + 1;
                for (let i = 1; i <= steps; i++) {
                    ctx.beginPath();
                    const radius = (size / 2) * (i / steps);
                    if (radius > ctx.lineWidth / 2) {
                        ctx.arc(0, 0, radius - ctx.lineWidth / 2, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
                break;
            }
            case 'monogram': {
                const initials = logoText.split(' ').map(word => word[0] || '').join('').slice(0, 2).toUpperCase();
                ctx.font = `${fontWeight} ${size * (initials.length > 1 ? 0.9 : 1.2)}px ${fontFamily}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (initials.length > 1) {
                    // Draw two initials with overlap for a more professional look
                    const firstLetter = initials[0];
                    const secondLetter = initials[1];
                    ctx.globalAlpha = 0.85;
                    ctx.fillText(firstLetter, size * 0.42, size * 0.5);
                    ctx.globalAlpha = 1.0;
                    ctx.fillText(secondLetter, size * 0.58, size * 0.5);
                } else {
                    // Draw single initial
                    ctx.fillText(initials[0] || 'A', size / 2, size / 2);
                }
                break;
            }
            case 'grid': {
                ctx.lineWidth = 0;
                const cells = markComplexity + 1;
                const cellSize = size / cells;

                // --- NEW: Choose a sub-algorithm for better structure ---
                const gridType = Math.floor(Math.random() * 3);

                switch (gridType) {
                    case 0: // Symmetrical Pattern (Quadrant Mirror)
                        const quadrant = [];
                        const halfCells = Math.ceil(cells / 2);
                        for (let i = 0; i < halfCells; i++) {
                            quadrant[i] = [];
                            for (let j = 0; j < halfCells; j++) {
                                quadrant[i][j] = Math.random() > 0.5;
                            }
                        }
                        for (let i = 0; i < cells; i++) {
                            for (let j = 0; j < cells; j++) {
                                const qi = i < halfCells ? i : cells - 1 - i;
                                const qj = j < halfCells ? j : cells - 1 - j;
                                if (quadrant[qi]?.[qj]) {
                                    ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                                }
                            }
                        }
                        break;

                    case 1: // Density Gradient (Center-focused)
                        const center = cells / 2;
                        for (let i = 0; i < cells; i++) {
                            for (let j = 0; j < cells; j++) {
                                const dist = Math.sqrt(Math.pow(i - center + 0.5, 2) + Math.pow(j - center + 0.5, 2));
                                const maxDist = Math.sqrt(2 * Math.pow(center, 2));
                                const probability = 0.8 - (dist / maxDist) * 0.6; // Higher probability near center
                                if (Math.random() < probability) {
                                    ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                                }
                            }
                        }
                        break;

                    case 2: // Random Walk Path
                        let x = Math.floor(Math.random() * cells);
                        let y = Math.floor(Math.random() * cells);
                        const pathLength = Math.floor(cells * cells * 0.5);
                        for (let i = 0; i < pathLength; i++) {
                            if (x >= 0 && x < cells && y >= 0 && y < cells) {
                                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                            }
                            const dir = Math.floor(Math.random() * 4);
                            if (dir === 0) x++;
                            else if (dir === 1) x--;
                            else if (dir === 2) y++;
                            else y--;
                        }
                        break;
                }
                break;
            }
        }
    }

    _drawDistress(ctx, width, height, amount) {
        if (amount <= 0) return;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const grain = (Math.random() - 0.5) * 255 * amount;
            data[i] += grain;
            data[i + 1] += grain;
            data[i + 2] += grain;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    _drawGuideGrid(ctx, width, height, settings) {
        ctx.strokeStyle = settings.textColor;
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1;
        const gridSize = settings.gridSize;

        for (let x = gridSize; x < width; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = gridSize; y < height; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
    }

    destroy() {
        super.destroy();
    }
}