import BaseGenerator from '../BaseGenerator.js';

export default class VeraMolnarGenerator extends BaseGenerator {
    constructor(canvasContainer, uiContainer) {
        super(canvasContainer, uiContainer);

        this.presets = {
            'Square (1:1)': { width: 2000, height: 2000 },
            'A3 (Portrait)': { width: 3508, height: 4961 },
            'A3 (Landscape)': { width: 4961, height: 3508 },
        };

        this.settings = {
            backgroundColor: '#f0f0f0',
            lineColor: '#222222',
            gridCount: 10,
            shape: 'lines',
            disorderPosition: 0.1,
            disorderRotation: 0.1,
            disorderSize: 0,
            lineWidth: 5,
            skipChance: 0.1,
            margin: 200,
        };
        this.settings.isAnimated = false;
        this.settings.animationSpeed = 1;
        this.settings.isGameOfLife = false;
        this.settings.simulationSpeed = 1;
        this.settings.animationType = 'disorder';
        this.settings.gameOfLifeSeed = 'random';

        this.canvas = null;
        this.context = null;
        this.previewPreset = this.presets['Square (1:1)'];

        this.isAnimatable = true;
        this.animationFrameId = null;
        this.lifeGrid = [];
        this.lastLifeUpdateTime = 0;

        this.setup();
    }

    setup() {
        this.canvas = document.createElement('canvas');
        this.canvasContainer.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');

        this.createControls();
        this._createPreviewModal();

        // Bind the animate method for the animation loop
        this.boundAnimate = this.animate.bind(this);

        // Add a listener to redraw when the window is resized
        this.boundDraw = this.draw.bind(this);
        window.addEventListener('resize', this.boundDraw, false);

        // Initial draw
        this.draw();
    }

    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls');

        const pageSetupControls = this._createfieldset('Page Setup');
        pageSetupControls.appendChild(this._createPresetSelect());
        controlsContainer.appendChild(pageSetupControls);

        const gridControls = this._createfieldset('Grid & Layout');
        gridControls.appendChild(this._createSlider('gridCount', 'Grid Count', { min: 2, max: 50 }));
        gridControls.appendChild(this._createSlider('margin', 'Margin', { min: 0, max: 1000 }));
        gridControls.appendChild(this._createSlider('skipChance', 'Skip Chance', { min: 0, max: 1, step: 0.01 }));
        controlsContainer.appendChild(gridControls);

        const shapeControls = this._createfieldset('Shape & Disorder');
        shapeControls.appendChild(this._createSelect('shape', 'Shape', ['lines', 'squares']));
        shapeControls.appendChild(this._createSlider('lineWidth', 'Line Width', { min: 1, max: 50 }));
        shapeControls.appendChild(this._createSlider('disorderPosition', 'Position Disorder', { min: 0, max: 1, step: 0.01 }));
        shapeControls.appendChild(this._createSlider('disorderRotation', 'Rotation Disorder', { min: 0, max: 1, step: 0.01 }));
        shapeControls.appendChild(this._createSlider('disorderSize', 'Size Disorder', { min: 0, max: 1, step: 0.01 }));
        controlsContainer.appendChild(shapeControls);

        const colorControls = this._createfieldset('Color');
        colorControls.appendChild(this._createColorInput('backgroundColor', 'Background'));
        colorControls.appendChild(this._createColorInput('lineColor', 'Line Color'));
        controlsContainer.appendChild(colorControls);

        const animControls = this._createfieldset('Animation & Simulation');
        animControls.appendChild(this._createCheckbox('isAnimated', 'Animate'));
        animControls.appendChild(this._createSlider('animationSpeed', 'Animation Speed', { min: 0.1, max: 5, step: 0.1 }));
        animControls.appendChild(this._createSelect('animationType', 'Animation Type', ['disorder', 'rotate', 'pulse']));
        animControls.appendChild(this._createCheckbox('isGameOfLife', 'Game of Life'));
        animControls.appendChild(this._createSlider('simulationSpeed', 'Simulation Speed', { min: 0.1, max: 10, step: 0.1 }));
        animControls.appendChild(this._createSelect('gameOfLifeSeed', 'GoL Seed', ['random', 'glider', 'pulsar']));
        controlsContainer.appendChild(animControls);

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
        if (key === 'isAnimated') {
            this._handleAnimationToggle(value);
        }
        if ((key === 'isGameOfLife' && value) || (key === 'gameOfLifeSeed' && this.settings.isGameOfLife)) {
            this._initializeLifeGrid();
        }
    }

    _handleAnimationToggle(isChecked) {
        if (isChecked && !this.animationFrameId) {
            this.animate(0);
        } else if (!isChecked && this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            this.draw(0); // Draw a final static frame
        }
    }

    draw(time = 0) {
        if (!this.canvas) return;

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

    renderArtwork(ctx, width, height, settings, time = 0) {
        const {
            backgroundColor, lineColor, gridCount, shape,
            disorderPosition, disorderRotation, disorderSize,
            lineWidth, skipChance, margin, isAnimated, animationSpeed, isGameOfLife, animationType
        } = settings;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const gridWidth = width - margin * 2;
        const gridHeight = height - margin * 2;
        const cellWidth = gridWidth / gridCount;
        const cellHeight = gridHeight / gridCount;

        for (let i = 0; i < gridCount; i++) {
            for (let j = 0; j < gridCount; j++) {
                const isCellActive = isGameOfLife ? this.lifeGrid[i]?.[j] === 1 : Math.random() > skipChance;

                if (!isCellActive) {
                    continue;
                }

                const x = margin + i * cellWidth;
                const y = margin + j * cellHeight;

                const timeFactor = isAnimated ? time * 0.0005 * animationSpeed : 0;
                
                let currentDisorderPosition = disorderPosition;
                let currentDisorderRotation = disorderRotation;
                let currentDisorderSize = disorderSize;
                let additionalRotation = 0;
                let sizeMultiplier = 1;

                if (isAnimated) {
                    switch (animationType) {
                        case 'disorder':
                            const dynamicDisorder = (Math.sin(timeFactor + i * 0.5 + j * 0.3) + 1) / 2;
                            currentDisorderPosition *= dynamicDisorder;
                            currentDisorderRotation *= dynamicDisorder;
                            currentDisorderSize *= dynamicDisorder;
                            break;
                        case 'rotate':
                            additionalRotation = timeFactor * 5;
                            break;
                        case 'pulse':
                            sizeMultiplier = (Math.sin(timeFactor + i * 0.2 + j * 0.2) + 1) / 2 * 0.8 + 0.2; // Pulse between 0.2 and 1.0
                            break;
                    }
                }

                ctx.save();
                
                const posX = x + cellWidth / 2 + (Math.random() - 0.5) * cellWidth * currentDisorderPosition;
                const posY = y + cellHeight / 2 + (Math.random() - 0.5) * cellHeight * currentDisorderPosition;
                ctx.translate(posX, posY);

                const rotation = (Math.random() - 0.5) * Math.PI * currentDisorderRotation + additionalRotation;
                ctx.rotate(rotation);

                const sizeFactor = 1 - (Math.random() * currentDisorderSize);
                const w = cellWidth * 0.8 * sizeFactor * sizeMultiplier;
                const h = cellHeight * 0.8 * sizeFactor * sizeMultiplier;

                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = lineColor;
                ctx.fillStyle = lineColor;

                if (shape === 'lines') {
                    ctx.beginPath();
                    ctx.moveTo(-w / 2, 0);
                    ctx.lineTo(w / 2, 0);
                    ctx.stroke();
                } else if (shape === 'squares') {
                    ctx.fillRect(-w / 2, -h / 2, w, h);
                }

                ctx.restore();
            }
        }
    }

    animate(time) {
        if (!this.settings.isAnimated) {
            this.animationFrameId = null;
            return;
        }

        if (this.settings.isGameOfLife) {
            const interval = 1000 / this.settings.simulationSpeed;
            if (time - this.lastLifeUpdateTime > interval) {
                this._updateLifeGrid();
                this.lastLifeUpdateTime = time;
            }
        }

        this.draw(time);
        this.animationFrameId = requestAnimationFrame(this.boundAnimate);
    }

    _initializeLifeGrid() {
        const { gridCount, skipChance, gameOfLifeSeed } = this.settings;
        this.lifeGrid = Array(gridCount).fill(null).map(() => Array(gridCount).fill(0));

        if (gameOfLifeSeed === 'random') {
            for (let i = 0; i < gridCount; i++) {
                for (let j = 0; j < gridCount; j++) {
                    this.lifeGrid[i][j] = Math.random() > skipChance ? 1 : 0;
                }
            }
        } else if (gameOfLifeSeed === 'glider' && gridCount >= 5) {
            const cx = Math.floor(gridCount / 2) - 1;
            const cy = Math.floor(gridCount / 2) - 1;
            this.lifeGrid[cy][cx + 1] = 1;
            this.lifeGrid[cy + 1][cx + 2] = 1;
            this.lifeGrid[cy + 2][cx] = 1;
            this.lifeGrid[cy + 2][cx + 1] = 1;
            this.lifeGrid[cy + 2][cx + 2] = 1;
        } else if (gameOfLifeSeed === 'pulsar' && gridCount >= 17) {
            const cx = Math.floor(gridCount / 2);
            const cy = Math.floor(gridCount / 2);
            const pulsarCoords = [
                [-6, -4], [-6, -3], [-6, -2], [-6, 2], [-6, 3], [-6, 4],
                [-4, -6], [-4, -1], [-4, 1], [-4, 6],
                [-3, -6], [-3, -1], [-3, 1], [-3, 6],
                [-2, -6], [-2, -1], [-2, 1], [-2, 6],
                [-1, -4], [-1, -3], [-1, -2], [-1, 2], [-1, 3], [-1, 4],
                [1, -4], [1, -3], [1, -2], [1, 2], [1, 3], [1, 4],
                [2, -6], [2, -1], [2, 1], [2, 6],
                [3, -6], [3, -1], [3, 1], [3, 6],
                [4, -6], [4, -1], [4, 1], [4, 6],
                [6, -4], [6, -3], [6, -2], [6, 2], [6, 3], [6, 4],
            ];
            pulsarCoords.forEach(([x, y]) => {
                if (this.lifeGrid[cy + y] && this.lifeGrid[cy + y][cx + x] !== undefined) {
                    this.lifeGrid[cy + y][cx + x] = 1;
                }
            });
        }
    }

    _updateLifeGrid() {
        const count = this.settings.gridCount;
        const newGrid = Array(count).fill(null).map(() => Array(count).fill(0));

        for (let i = 0; i < count; i++) {
            for (let j = 0; j < count; j++) {
                let liveNeighbors = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (x === 0 && y === 0) continue;
                        const ni = (i + x + count) % count;
                        const nj = (j + y + count) % count;
                        if (this.lifeGrid[ni]?.[nj] === 1) {
                            liveNeighbors++;
                        }
                    }
                }

                const state = this.lifeGrid[i]?.[j];
                if (state === undefined) continue; // Skip if the cell is out of bounds

                if (state === 1 && (liveNeighbors < 2 || liveNeighbors > 3)) newGrid[i][j] = 0;
                else if (state === 0 && liveNeighbors === 3) newGrid[i][j] = 1;
                else newGrid[i][j] = state;
            }
        }
        this.lifeGrid = newGrid;
    }

    destroy() {
        super.destroy();
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    }
}