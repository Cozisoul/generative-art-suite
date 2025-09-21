import BaseGenerator from '../BaseGenerator.js';

export default class SwissGenerator extends BaseGenerator {
    constructor(canvasContainer, uiContainer) {
        super(canvasContainer, uiContainer);

        this.presets = {
            'A4 Poster (Portrait)': { width: 2480, height: 3508 },
            'Book Cover (6:9)': { width: 1800, height: 2700 },
            'Presentation (16:9)': { width: 1920, height: 1080 },
            'CD Cover (1:1)': { width: 1500, height: 1500 },
            'Logo (1:1)': { width: 1000, height: 1000 },
        };

        this.settings = {
            backgroundColor: '#f1f1f1',
            textColor: '#111111',
            accentColor: '#E31B23',
            scenario: 'Classic Left',
            layoutStyle: 'left-accent',
            headingText: 'Design',
            bodyText: 'Helvetica is a widely used sans-serif typeface developed in 1957 by Swiss typeface designer Max Miedinger with input from Eduard Hoffmann.',
            columns: 12,
            margin: 150,
            headingSize: 250,
            headingWeight: 'bold',
            bodySize: 60,
            lineHeight: 1.4,
            textAlign: 'left',
            numBodyTexts: 1,
            numCircles: 3,
            circleSize: 50,
            numLines: 5,
            lineWeight: 10,
            numSquares: 2,
            squareSize: 50,
            numTriangles: 1,
            triangleSize: 50,
            shapeFill: 'fill',
            showImagePlaceholder: false,
            gridOverlay: 'none',
            backgroundStyle: 'accent-blocks', // New setting
            showGraphicElements: true,      // New setting
            animationDuration: 3000, // New setting for animation duration in ms
            isAnimatable: true, // Enable animation downloads for this generator
        };

        this.scenarioDefinitions = {
            'Custom': {}, // For when user makes manual changes
            'Classic Left': {
                pageSize: 'A4 Poster (Portrait)',
                backgroundStyle: 'accent-blocks',
                layoutStyle: 'left-accent',
                showGraphicElements: true,
                textAlign: 'left',
            },
            'Image Dominant': {
                pageSize: 'A4 Poster (Portrait)',
                backgroundStyle: 'image-placeholder',
                showGraphicElements: true,
                showImagePlaceholder: true,
            },
            'Typographic Focus': {
                pageSize: 'Book Cover (6:9)',
                backgroundStyle: 'none',
                showGraphicElements: false,
                layoutStyle: 'text-only',
                textAlign: 'left',
            },
            'Bauhaus Homage': {
                pageSize: 'CD Cover (1:1)',
                backgroundStyle: 'accent-blocks',
                layoutStyle: 'diagonal',
                showGraphicElements: true,
                textAlign: 'center',
                headingSize: 350,
                numCircles: 5,
                numLines: 0,
            },
            'Grid Emphasis': {
                pageSize: 'Presentation (16:9)',
                gridOverlay: 'columns',
                backgroundStyle: 'accent-blocks',
                layoutStyle: 'right-accent',
                showGraphicElements: true,
                textAlign: 'right',
            },
            'Minimalist': {
                pageSize: 'Logo (1:1)',
                backgroundStyle: 'none',
                layoutStyle: 'text-only',
                showGraphicElements: false,
                textAlign: 'center',
                headingSize: 150,
                bodySize: 40,
                numCircles: 1,
                numLines: 0,
                margin: 250,
            },
            'Bold Top Accent': {
                pageSize: 'A4 Poster (Portrait)',
                backgroundStyle: 'accent-blocks',
                layoutStyle: 'top-accent',
                showGraphicElements: true,
                textAlign: 'left',
            },
        };

        this.canvas = null;
        this.context = null;
        this.previewPreset = this.presets['A4 Poster (Portrait)'];
        this.isApplyingPreset = false;

        this.setup();
    }

    setup() {
        this.canvas = document.createElement('canvas');
        this.canvasContainer.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');

        this.createControls();

        // Create hidden preview modal
        this._createPreviewModal();

        this.boundDraw = this.draw.bind(this);
        window.addEventListener('resize', this.boundDraw, false);

        this.draw();
    }

    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls');

        const pageSetupControls = this._createfieldset('Page Setup');
        pageSetupControls.appendChild(this._createPresetSelect());
        controlsContainer.appendChild(pageSetupControls);

        const layoutControls = this._createfieldset('Layout');
        layoutControls.appendChild(this._createSlider('margin', 'Margin', { min: 0, max: 500, unit: 'px' }));
        layoutControls.appendChild(this._createSlider('columns', 'Columns', { min: 2, max: 18 }));
        layoutControls.appendChild(this._createSelect('scenario', 'Scenario', Object.keys(this.scenarioDefinitions)));
        layoutControls.appendChild(this._createSelect('layoutStyle', 'Layout Style', ['left-accent', 'right-accent', 'top-accent', 'diagonal', 'text-only']));
        layoutControls.appendChild(this._createCheckbox('showImagePlaceholder', 'Show Image Placeholder'));
        layoutControls.appendChild(this._createSelect('gridOverlay', 'Grid Overlay', ['none', 'columns', 'thirds']));
        
        const graphicsControls = this._createfieldset('Graphic Elements');
        graphicsControls.appendChild(this._createSlider('numCircles', 'Circles', { min: 0, max: 20 }));
        graphicsControls.appendChild(this._createSlider('circleSize', 'Circle Size', { min: 5, max: 200 }));
        graphicsControls.appendChild(this._createSlider('numLines', 'Lines', { min: 0, max: 20 }));
        graphicsControls.appendChild(this._createSlider('lineWeight', 'Line Weight', { min: 1, max: 100 }));
        graphicsControls.appendChild(this._createSlider('numSquares', 'Squares', { min: 0, max: 20 }));
        graphicsControls.appendChild(this._createSlider('squareSize', 'Square Size', { min: 5, max: 200 }));
        graphicsControls.appendChild(this._createSlider('numTriangles', 'Triangles', { min: 0, max: 20 }));
        graphicsControls.appendChild(this._createSlider('triangleSize', 'Triangle Size', { min: 5, max: 200 }));
        graphicsControls.appendChild(this._createSelect('shapeFill', 'Shape Style', ['fill', 'stroke', 'mixed']));
        controlsContainer.appendChild(layoutControls);

        const colorControls = this._createfieldset('Color');
        colorControls.appendChild(this._createColorInput('backgroundColor', 'Background'));
        colorControls.appendChild(this._createColorInput('textColor', 'Text'));
        colorControls.appendChild(this._createColorInput('accentColor', 'Accent'));
        controlsContainer.appendChild(colorControls);
        controlsContainer.appendChild(graphicsControls);

        const textControls = this._createfieldset('Typography');
        textControls.appendChild(this._createTextInput('headingText', 'Heading Text'));
        textControls.appendChild(this._createSlider('headingSize', 'Heading Size', { min: 20, max: 500, unit: 'px' }));
        textControls.appendChild(this._createSelect('headingWeight', 'Heading Weight', ['bold', 'normal']));
        textControls.appendChild(this._createTextInput('bodyText', 'Body Text'));
        textControls.appendChild(this._createSlider('bodySize', 'Body Size', { min: 10, max: 100, unit: 'px' }));
        textControls.appendChild(this._createSlider('numBodyTexts', 'Body Text Count', { min: 0, max: 10 }));
        textControls.appendChild(this._createSlider('lineHeight', 'Line Height', { min: 0.8, max: 3, step: 0.1 }));
        textControls.appendChild(this._createSelect('textAlign', 'Text Align', ['left', 'center', 'right']));
        controlsContainer.appendChild(textControls);

        // --- Actions ---
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

        if (key === 'scenario') {
            this._applyScenarioSettings(value);
        } else {
            // If a setting controlled by a scenario is changed, switch to 'Custom'
            const currentScenarioName = this.settings.scenario;
            if (currentScenarioName !== 'Custom') {
                const currentScenario = this.scenarioDefinitions[currentScenarioName];
                if (currentScenario && currentScenario.hasOwnProperty(key)) {
                    this.settings.scenario = 'Custom';
                    const scenarioControl = this.uiContainer.querySelector('select[data-setting="scenario"]');
                    if (scenarioControl) {
                        scenarioControl.value = 'Custom';
                    }
                }
            }
        }
    }

    _applyScenarioSettings(scenarioName) {
        const scenarioSettings = this.scenarioDefinitions[scenarioName];
        if (!scenarioSettings || scenarioName === 'Custom') return;

        this.isApplyingPreset = true;

        // Apply all settings from the scenario
        for (const key in scenarioSettings) {
            const value = scenarioSettings[key];
            this.settings[key] = value;

            // Update the UI control to match
            const control = this.uiContainer.querySelector(`[data-setting="${key}"]`);
            if (control) {
                if (control.type === 'checkbox') {
                    control.checked = value;
                } else {
                    control.value = value;
                }
                if (control.type === 'range') {
                    const span = control.previousElementSibling?.querySelector('span');
                    if (span) span.innerText = value;
                }
            }
        }

        // Special handling for page size
        if (scenarioSettings.pageSize) {
            this.previewPreset = this.presets[scenarioSettings.pageSize];
            const downloadSelect = this.uiContainer.querySelector('.download-preset-select');
            if (downloadSelect) {
                downloadSelect.value = scenarioSettings.pageSize;
            }
        }

        this.isApplyingPreset = false;
        this.draw();
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
            backgroundColor, textColor, accentColor, headingText, bodyText, columns, margin,
            headingSize, bodySize, layoutStyle, headingWeight, lineHeight, textAlign, gridOverlay,
            showImagePlaceholder, numBodyTexts, backgroundStyle, showGraphicElements
        } = settings;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const gridWidth = width - 2 * margin;
        const colWidth = gridWidth / columns;
        const gutter = colWidth * 0.2; // Gutter is proportional to column width

        let textX = margin;
        let textY = margin;
        let textBlockWidth = gridWidth;

        if (gridOverlay === 'columns') {
            this._drawGridOverlay(ctx, width, height, settings);
        } else if (gridOverlay === 'thirds') {
            this._drawRuleOfThirds(ctx, width, height, settings);
        }

        if (showImagePlaceholder) {
            this._drawImagePlaceholder(ctx, width, height, settings);
        }

        // --- Handle Background Style ---
        if (backgroundStyle === 'image-placeholder') {
            ctx.fillStyle = accentColor;
            // Use a pseudo-random number based on text length for stable randomness
            const textSeed = (headingText.length + bodyText.length) / 100;
            const pRandom = (val) => (Math.sin(textSeed * val) + 1) / 2;

            // Asymmetrical placement for a more dynamic feel
            const imgWidth = gridWidth * (pRandom(1) * 0.3 + 0.6); // 60-90% width
            const imgHeight = height * (pRandom(2) * 0.2 + 0.5); // 50-70% height
            const imgX = margin + (pRandom(3) > 0.5 ? 0 : gridWidth - imgWidth); // Pin to left or right
            const imgY = margin;
            ctx.fillRect(imgX, imgY, imgWidth, imgHeight);
            textY = margin + imgHeight + gutter * 2; // Text starts below the image block
        } else if (backgroundStyle === 'accent-blocks') {
            ctx.fillStyle = accentColor;
            if (layoutStyle === 'left-accent') {
                const accentCols = 4;
                ctx.fillRect(margin, margin, (colWidth * accentCols) - gutter, height - 2 * margin);
                textX = margin + (colWidth * accentCols);
                textBlockWidth = gridWidth - (colWidth * accentCols);
            } else if (layoutStyle === 'right-accent') {
                const accentCols = 4;
                ctx.fillRect(width - margin - (colWidth * accentCols) + gutter, margin, (colWidth * accentCols) - gutter, height - 2 * margin);
                textBlockWidth = gridWidth - (colWidth * accentCols);
            } else if (layoutStyle === 'top-accent') {
                const accentHeight = height * 0.3;
                ctx.fillRect(margin, margin, gridWidth, accentHeight);
                textY = margin + accentHeight + gutter * 2;
            } else if (layoutStyle === 'diagonal') {
                ctx.save();
                ctx.translate(width / 2, height / 2);
                ctx.rotate(-Math.PI / 6);
                ctx.fillRect(-width, -height * 0.1, width * 2, height * 0.2);
                ctx.restore();
                textX = margin * 2;
                textY = height / 2 - headingSize;
                textBlockWidth = width - margin * 4;
            }
        }

        // --- Draw Graphic Elements ---
        if (showGraphicElements) {
            this._drawGraphicElements(ctx, width, height, settings, time);
        }

        // --- Draw Heading ---
        ctx.fillStyle = textColor;
        ctx.font = `${headingWeight} ${headingSize}px Helvetica, sans-serif`;
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'top';
        let headingX = textX;
        if (textAlign === 'center') headingX += textBlockWidth / 2;
        if (textAlign === 'right') headingX += textBlockWidth;
        ctx.fillText(headingText, headingX, textY);

        // --- Draw Body Text ---
        ctx.font = `${bodySize}px Helvetica, sans-serif`;
        let currentY = textY + headingSize + (gutter * 2);
        let bodyX = textX;
        if (textAlign === 'center') bodyX += textBlockWidth / 2;
        if (textAlign === 'right') bodyX += textBlockWidth;

        for (let i = 0; i < numBodyTexts; i++) {
            if (currentY > height - margin) break; // Don't draw off-canvas
            const blockHeight = this._wrapText(ctx, bodyText, bodyX, currentY, textBlockWidth, bodySize * lineHeight);
            currentY += blockHeight + gutter; // Add a gutter between blocks
        }
    }

    _drawImagePlaceholder(ctx, width, height, settings) {
        const { margin, textColor } = settings;
        const rectX = margin;
        const rectY = margin;
        const rectW = width - margin * 2;
        const rectH = height * 0.6;

        ctx.strokeStyle = textColor;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.2;
        ctx.strokeRect(rectX, rectY, rectW, rectH);
        ctx.beginPath();
        ctx.moveTo(rectX, rectY); ctx.lineTo(rectX + rectW, rectY + rectH);
        ctx.moveTo(rectX + rectW, rectY); ctx.lineTo(rectX, rectY + rectH);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    _drawRuleOfThirds(ctx, width, height, settings) {
        const { margin, textColor } = settings;
        ctx.save();
        ctx.strokeStyle = textColor;
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 2;

        const contentWidth = width - margin * 2;
        const contentHeight = height - margin * 2;

        const x1 = margin + contentWidth / 3;
        const x2 = margin + contentWidth * 2 / 3;
        const y1 = margin + contentHeight / 3;
        const y2 = margin + contentHeight * 2 / 3;

        ctx.beginPath();
        ctx.moveTo(x1, margin); ctx.lineTo(x1, height - margin);
        ctx.moveTo(x2, margin); ctx.lineTo(x2, height - margin);
        ctx.moveTo(margin, y1); ctx.lineTo(width - margin, y1);
        ctx.moveTo(margin, y2); ctx.lineTo(width - margin, y2);
        ctx.stroke();

        ctx.restore();
    }

    _drawGridOverlay(ctx, width, height, settings) {
        const { margin, columns, textColor } = settings;
        const gridWidth = width - 2 * margin;
        const colWidth = gridWidth / columns;

        ctx.save();
        ctx.strokeStyle = textColor;
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1;

        for (let i = 1; i < columns; i++) {
            const x = margin + i * colWidth;
            ctx.beginPath();
            ctx.moveTo(x, margin);
            ctx.lineTo(x, height - margin);
            ctx.stroke();
        }

        // Can add row lines here too if desired
        ctx.restore();
    }

    _drawGraphicElements(ctx, width, height, settings, time) {
        const { 
            margin, columns, 
            numCircles, circleSize, 
            numLines, lineWeight,
            numSquares, squareSize,
            numTriangles, triangleSize,
            shapeFill,
            textColor, accentColor 
        } = settings;
        const gridWidth = width - 2 * margin;
        const colWidth = gridWidth / columns;
        const colors = [textColor, accentColor];

        const applyStyle = () => {
            let style = shapeFill;
            if (style === 'mixed') {
                style = Math.random() > 0.5 ? 'fill' : 'stroke';
            }
            if (style === 'fill') {
                ctx.fill();
            } else {
                ctx.stroke();
            }
        };

        // Draw Lines
        ctx.lineWidth = lineWeight;
        for (let i = 0; i < numLines; i++) {
            ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
            const y = margin + Math.random() * (height - 2 * margin);
            const startCol = Math.floor(Math.random() * columns / 2);
            const endCol = startCol + Math.floor(Math.random() * columns / 2) + 1;
            const x1 = margin + startCol * colWidth;
            const x2 = margin + endCol * colWidth;
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke(); // Lines are always stroked
        }

        // Set a thinner line width for stroked shapes
        ctx.lineWidth = Math.max(2, lineWeight / 4);

        // Draw Circles
        for (let i = 0; i < numCircles; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            const x = margin + Math.random() * gridWidth;
            // Animate y position based on time
            const y = margin + Math.random() * (height - 2 * margin) + Math.sin(time + i) * 20; 
            ctx.beginPath();
            ctx.arc(x, y, circleSize / 2, 0, Math.PI * 2);
            applyStyle();
        }

        // Draw Squares
        for (let i = 0; i < numSquares; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            const x = margin + Math.random() * (gridWidth - squareSize);
            // Animate size based on time
            const animatedSquareSize = squareSize + Math.sin(time + i) * 10;
            const y = margin + Math.random() * (height - 2 * margin - animatedSquareSize);
            ctx.beginPath();
            ctx.rect(x, y, animatedSquareSize, animatedSquareSize);
            applyStyle();
        }

        // Draw Triangles
        for (let i = 0; i < numTriangles; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            const x = margin + Math.random() * (gridWidth - triangleSize);
            const y = margin + Math.random() * (height - 2 * margin - triangleSize);
            ctx.beginPath();
            ctx.moveTo(x + triangleSize / 2, y);
            ctx.lineTo(x, y + triangleSize);
            ctx.lineTo(x + triangleSize, y + triangleSize);
            ctx.closePath();
            applyStyle();
        }
    }

    _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        const startY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
        y += lineHeight; // Account for the last line
        return y - startY; // Return the total height of the block
    }

    destroy() {
        super.destroy();
    }
}