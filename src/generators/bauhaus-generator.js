import BaseGenerator from '../BaseGenerator.js';

/**
 * A generator for creating posters in the Bauhaus style.
 * @extends BaseGenerator
 */
export default class BauhausGenerator extends BaseGenerator {
    /**
     * @param {HTMLElement} canvasContainer - The container for the canvas element.
     * @param {HTMLElement} uiContainer - The container for the UI controls.
     */
    constructor(canvasContainer, uiContainer) {
        super(canvasContainer, uiContainer);

        this.presets = {
            'A3 Poster (Portrait)': { width: 3508, height: 4961 },
            'A3 Poster (Landscape)': { width: 4961, height: 3508 },
            'Square': { width: 4000, height: 4000 },
        };

        this.settings = {
            backgroundColor: '#f0e9d9',
            paletteColor1: '#d52b1e', // Red
            paletteColor2: '#f9d616', // Yellow
            paletteColor3: '#00579d', // Blue
            paletteColor4: '#222222', // Black
            numShapes: 15,
            shapeSizeMin: 5,
            shapeSizeMax: 40,
            useDiagonals: true,
            numDiagonals: 3,
            diagonalWeight: 20,
            mainText: 'BAUHAUS',
            mainTextSize: 400,
            mainTextRotation: -15,
            subText: 'Dessau Weimar Berlin',
            subTextSize: 100,
            detailText: 'Kunst und Technik: Eine neue Einheit',
            detailTextSize: 40,
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
        };

        this.canvas = null;
        this.context = null;
        this.previewPreset = this.presets['A3 Poster (Portrait)'];

        this.setup();
    }

    /**
     * Sets up the canvas, UI controls, and initial state.
     * @memberof BauhausGenerator
     */
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

    /**
     * Creates and appends all the UI controls for this generator.
     * @memberof BauhausGenerator
     */
    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls');

        const layoutControls = this._createfieldset('Layout & Shapes');
        layoutControls.appendChild(this._createSlider('numShapes', 'Shape Count', { min: 1, max: 50 }));
        layoutControls.appendChild(this._createSlider('shapeSizeMin', 'Min Shape Size %', { min: 1, max: 100 }));
        layoutControls.appendChild(this._createSlider('shapeSizeMax', 'Max Shape Size %', { min: 1, max: 100 }));
        layoutControls.appendChild(this._createCheckbox('useDiagonals', 'Use Diagonals'));
        layoutControls.appendChild(this._createSlider('numDiagonals', 'Diagonal Count', { min: 0, max: 10 }));
        layoutControls.appendChild(this._createSlider('diagonalWeight', 'Diagonal Weight', { min: 1, max: 100 }));
        controlsContainer.appendChild(layoutControls);

        const colorControls = this._createfieldset('Color');
        colorControls.appendChild(this._createColorInput('backgroundColor', 'Background'));
        colorControls.appendChild(this._createColorInput('paletteColor1', 'Color 1 (Red)'));
        colorControls.appendChild(this._createColorInput('paletteColor2', 'Color 2 (Yellow)'));
        colorControls.appendChild(this._createColorInput('paletteColor3', 'Color 3 (Blue)'));
        colorControls.appendChild(this._createColorInput('paletteColor4', 'Color 4 (Black)'));
        controlsContainer.appendChild(colorControls);

        const textControls = this._createfieldset('Typography');
        textControls.appendChild(this._createTextInput('mainText', 'Main Text'));
        textControls.appendChild(this._createSlider('mainTextSize', 'Main Text Size', { min: 20, max: 1000 }));
        textControls.appendChild(this._createSlider('mainTextRotation', 'Main Text Angle', { min: -90, max: 90 }));
        textControls.appendChild(this._createTextInput('subText', 'Sub Text'));
        textControls.appendChild(this._createSlider('subTextSize', 'Sub Text Size', { min: 10, max: 500 }));
        textControls.appendChild(this._createTextInput('detailText', 'Detail Text'));
        textControls.appendChild(this._createSlider('detailTextSize', 'Detail Text Size', { min: 10, max: 100 }));
        textControls.appendChild(this._createSelect('fontFamily', 'Font', ['sans-serif', 'monospace']));
        textControls.appendChild(this._createSelect('fontWeight', 'Font Weight', ['bold', 'normal']));
        controlsContainer.appendChild(textControls);

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

    /**
     * Renders the final artwork on the given canvas context.
     * @param {CanvasRenderingContext2D} ctx - The context to draw on.
     * @param {number} width - The width of the artwork.
     * @param {number} height - The height of the artwork.
     * @param {object} settings - The current settings for the generator.
     */
    renderArtwork(ctx, width, height, settings, time = 0) {
        const {
            backgroundColor, paletteColor1, paletteColor2, paletteColor3, paletteColor4,
            numShapes, shapeSizeMin, shapeSizeMax,
            useDiagonals, numDiagonals, diagonalWeight,
            mainText, mainTextSize, mainTextRotation, subText, subTextSize, detailText, detailTextSize,
            fontFamily, fontWeight
        } = settings;

        const palette = [paletteColor1, paletteColor2, paletteColor3, paletteColor4];

        // --- Pseudo-random seed for stable layouts ---
        const textSeed = (mainText.length + subText.length + detailText.length);
        const pRandom = (val) => (Math.sin(textSeed * val * 100) + 1) / 2;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        if (useDiagonals) {
            ctx.strokeStyle = palette[3]; // Black
            ctx.lineWidth = diagonalWeight;
            for (let i = 0; i < numDiagonals; i++) {
                ctx.beginPath();
                const start = this._getRandomEdgePoint(width, height, pRandom(i * 2));
                const end = this._getRandomEdgePoint(width, height, pRandom(i * 2 + 1));
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }

        const shapes = ['rect', 'circle', 'triangle', 'line'];
        for (let i = 0; i < numShapes; i++) {
            ctx.save();
            const shapeType = shapes[Math.floor(pRandom(i * 3) * shapes.length)];
            const color = palette[Math.floor(pRandom(i * 4) * palette.length)];
            ctx.fillStyle = color;

            const sizePercent = pRandom(i * 5) * (shapeSizeMax - shapeSizeMin) + shapeSizeMin;
            const size = (Math.min(width, height) * sizePercent) / 100;
            const x = pRandom(i * 6) * width;
            const y = pRandom(i * 7) * height;
            const rotation = pRandom(i * 8) * Math.PI * 2;

            ctx.translate(x, y);
            ctx.rotate(rotation);

            switch (shapeType) {
                case 'rect':
                    ctx.fillRect(-size / 2, -size / 2, size, size * (pRandom(i * 9) * 1.5 + 0.5));
                    break;
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'triangle':
                    this._drawTriangle(ctx, 0, 0, size);
                    break;
                case 'line':
                    ctx.strokeStyle = color;
                    ctx.lineWidth = size / 5;
                    ctx.beginPath();
                    ctx.moveTo(-size / 2, 0);
                    ctx.lineTo(size / 2, 0);
                    ctx.stroke();
                    break;
            }
            ctx.restore();
        }

        ctx.save();
        ctx.font = `${fontWeight} ${mainTextSize}px ${fontFamily}`;
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(width * (pRandom(99) * 0.4 + 0.3), height * (pRandom(100) * 0.4 + 0.3));
        ctx.rotate(mainTextRotation * Math.PI / 180);
        ctx.fillText(mainText.toUpperCase(), 0, 0);
        ctx.restore();

        ctx.save();
        ctx.font = `${fontWeight} ${subTextSize}px ${fontFamily}`;
        ctx.fillStyle = palette[3]; // Black
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.translate(width * 0.1, height * 0.85);
        ctx.fillText(subText, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.font = `${fontWeight} ${detailTextSize}px ${fontFamily}`;
        ctx.fillStyle = palette[3]; // Black
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.translate(width - (width * 0.1), height - (height * 0.05));
        ctx.fillText(detailText, 0, 0);
        ctx.restore();
    }

    _getRandomEdgePoint(width, height, seed) {
        const edge = Math.floor(seed * 4);
        switch (edge) {
            case 0: return { x: seed * width, y: 0 }; // Top
            case 1: return { x: width, y: seed * height }; // Right
            case 2: return { x: seed * width, y: height }; // Bottom
            default: return { x: 0, y: seed * height }; // Left
        }
    }

    _drawTriangle(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.closePath();
        ctx.fill();
    }

    destroy() {
        super.destroy();
    }
}