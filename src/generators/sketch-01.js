import BaseGenerator from '../BaseGenerator.js';
import GridGeneratorDrawer from '../utils/grid-generator-drawer.js';

export default class GridGenerator extends BaseGenerator {
  constructor(canvasContainer, uiContainer) {
    super(canvasContainer, uiContainer);

    // --- 1. CONFIGURATION ---
    this.presets = {
      'Poster (A2)': { width: 4961, height: 7016 },
      'Magazine (A4)': { width: 2480, height: 3508 },
      'Social (Square)': { width: 1080, height: 1080 },
      'Social (Story)': { width: 1080, height: 1920 },
      'Book Spread': { width: 3508, height: 2480 },
    };

    this.colorPalettes = {
      'Vibrant': ['#D4483D', '#00A599', '#F2C249', '#3E5A97', '#FFFFFF'],
      'Warm': ['#FFD700', '#FF8C00', '#FF0000'],
      'BlackConsciousness': ['#E31B23', '#000000', '#009444', '#F9D616'], // Red, Black, Green, Gold
      'RYGB': ['#FF0000', '#FFFF00', '#00FF00', '#0000FF'],
      'Primary': ['#FF0000', '#0000FF', '#00FF00'],
      'Pastel': ['#fec5bb', '#fcd5ce', '#fae1dd', '#f8edeb', '#e8e8e4'],
      'Monochrome': ['#222222', '#555555', '#888888', '#BBBBBB', '#EEEEEE'],
      'Neon': ['#39ff14', '#fe019a', '#00f0ff', '#ff073a', '#cfff04'],
      'Earthy': ['#4a442d', '#a39978', '#d7c38f', '#a15c38', '#592d22'],
    };

    this.settings = {
      backgroundColor: '#111111',
      margin: 150,
      count: 5,
      gridSystem: 'uniform',
      shapeType: 'rectangle',
      shapeProbability: 0.8,
      lineWidth: 30,
      padding: 150,
      lineColor: '#FFF8E7',
      blendMode: 'source-over',
      paletteName: 'Vibrant',
      textContent: 'ART',
      fontSizeMultiplier: 1.5,
      fontFamily: 'Helvetica',
      isAnimated: false,
      animationSpeed: 0.5,
      animationType: 'rotate',
      simulationSpeed: 1,
      isGameOfLife: false,
      gameOfLifeSeed: 'random',
      gameOfLifeRuleset: 'standard',
      isSoundEnabled: false,
      soundVolume: 0.05,
      soundWaveform: 'sine',
    };

    this.canvas = null;
    this.context = null;
    this.previewPreset = this.presets['Poster (A2)'];
    this.animationFrameId = null;
    this.lastTime = 0;
    this.lifeGrid = [];
    this.lastLifeUpdateTime = 0;
    this.audioCtx = null;
    this.gainNode = null;
    this.oscillator = null;
    this.filterNode = null;
    this.isSoundPlaying = false;
    this.drawer = null;
    this.isAnimatable = true;

    // --- KICK-OFF ---
    this.setup();
  }

  destroy() {
    super.destroy();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
  }

  /**
   * Sets up the canvas, UI controls, and initial state.
   * @memberof GridGenerator
   */
  setup() {
    // Create and configure the canvas for preview
    this.canvas = document.createElement('canvas');
    this.canvasContainer.appendChild(this.canvas);
    this.context = this.canvas.getContext('2d');
    this.drawer = new GridGeneratorDrawer(this.context);

    // Create UI controls
    this.createControls();

    // Create hidden preview modal
    this._createPreviewModal();

    // Add a listener to redraw when the window is resized
    this.boundDraw = this.draw.bind(this);
    window.addEventListener('resize', this.boundDraw, false);

    // Initial draw
    this.draw();
  }

  /**
   * Creates and appends all the UI controls for this generator.
   * @memberof GridGenerator
   */
  createControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('controls');

    // --- Grid Controls ---
    const gridControls = this._createfieldset('Grid');
    gridControls.appendChild(this._createColorInput('backgroundColor', 'Background'));
    gridControls.appendChild(this._createSlider('margin', 'Margin', { min: -500, max: 1000, unit: 'px' }));
    gridControls.appendChild(this._createSlider('count', 'Count', { min: 1, max: 100 }));
    gridControls.appendChild(this._createSlider('padding', 'Padding', { min: -200, max: 500, unit: 'px' }));
    gridControls.appendChild(this._createColorInput('lineColor', 'Line Color'));
    gridControls.appendChild(this._createSelect('gridSystem', 'Grid System', ['uniform', 'randomized']));
    controlsContainer.appendChild(gridControls);

    // --- Shape Controls ---
    const shapeControls = this._createfieldset('Shape');
    shapeControls.appendChild(this._createSlider('lineWidth', 'Line Width', { min: 1, max: 200, unit: 'px' }));
    shapeControls.appendChild(this._createSlider('shapeProbability', 'Density', { min: 0, max: 1, step: 0.01 }));
    shapeControls.appendChild(this._createSelect('shapeType', 'Shape', ['rectangle', 'circle', 'arc', 'triangle', 'word', 'truchet']));
    const blendModes = ['source-over', 'multiply', 'screen', 'overlay', 'difference', 'exclusion', 'lighten', 'darken'];
    shapeControls.appendChild(this._createSelect('blendMode', 'Blend Mode', blendModes));
    shapeControls.appendChild(this._createSelect('paletteName', 'Palette', Object.keys(this.colorPalettes)));
    controlsContainer.appendChild(shapeControls);

    // --- Text Controls ---
    const textControls = this._createfieldset('Text');
    textControls.appendChild(this._createTextInput('textContent', 'Text'));
    textControls.appendChild(this._createSlider('fontSizeMultiplier', 'Font Size', { min: 0.1, max: 5, step: 0.1 }));
    textControls.appendChild(this._createSelect('fontFamily', 'Font', ['Helvetica', 'sans-serif', 'serif', 'monospace']));
    controlsContainer.appendChild(textControls);

    // --- Animation Controls ---
    const animControls = this._createfieldset('Animation');
    animControls.appendChild(this._createCheckbox('isAnimated', 'Animate'));
    animControls.appendChild(this._createSlider('animationSpeed', 'Speed', { min: 0.01, max: 1, step: 0.01 }));
    animControls.appendChild(this._createSlider('simulationSpeed', 'Sim Speed', { min: 0.1, max: 10, step: 0.1 }));
    animControls.appendChild(this._createSelect('animationType', 'Type', ['rotate', 'flash', 'move', 'wave', 'arc sweep']));
    controlsContainer.appendChild(animControls);

    // --- Simulation Controls ---
    const simControls = this._createfieldset('Simulation');
    simControls.appendChild(this._createCheckbox('isGameOfLife', 'Game of Life'));
    simControls.appendChild(this._createSelect('gameOfLifeSeed', 'Seed', ['random', 'glider', 'pulsar']));
    simControls.appendChild(this._createSelect('gameOfLifeRuleset', 'Ruleset', ['standard', 'highlife', 'day & night', 'seeds']));
    controlsContainer.appendChild(simControls);

    // --- Sound Controls ---
    const soundControls = this._createfieldset('Sound');
    const soundCheckbox = this._createCheckbox('isSoundEnabled', 'Enable Sound');
    soundControls.appendChild(soundCheckbox);
    soundControls.appendChild(this._createSlider('soundVolume', 'Volume', { min: 0, max: 0.2, step: 0.01 }));
    soundControls.appendChild(this._createSelect('soundWaveform', 'Waveform', ['sine', 'square', 'sawtooth', 'triangle']));
    const playButton = document.createElement('button');
    playButton.innerText = 'Play Sound';
    playButton.classList.add('action-button', 'sound-play-button'); // Add class for specific targeting
    playButton.style.display = this.settings.isSoundEnabled ? 'block' : 'none';
    playButton.addEventListener('click', () => this.toggleSoundPlayback(playButton));
    soundCheckbox.querySelector('input').addEventListener('change', (e) => {
        playButton.style.display = e.target.checked ? 'block' : 'none';
    });
    soundControls.appendChild(playButton);
    controlsContainer.appendChild(soundControls);

    // --- Actions ---
    const actionsControls = this._createfieldset('Actions');
    const randomizeButton = document.createElement('button');
    randomizeButton.innerText = 'Randomize';
    randomizeButton.classList.add('action-button');
    randomizeButton.addEventListener('click', this._randomizeSettings.bind(this));
    const previewButton = document.createElement('button');
    previewButton.innerText = 'Preview';
    previewButton.classList.add('action-button');
    previewButton.addEventListener('click', this._showPreview.bind(this));
    actionsControls.appendChild(previewButton);
    actionsControls.appendChild(randomizeButton);
    controlsContainer.appendChild(actionsControls);

    this.appendDownloadControls(controlsContainer);
    this.uiContainer.appendChild(controlsContainer);
  }

  onSettingChange(key, value) {
    if (key === 'count' && this.settings.isGameOfLife) {
      this._initializeLifeGrid();
    }
    if (key === 'gameOfLifeSeed' && this.settings.isGameOfLife) {
      this._initializeLifeGrid();
    }
    if (key === 'isAnimated') {
      this.handleAnimationToggle(value);
    }
    if (key === 'isGameOfLife') {
      this.handleGameOfLifeToggle(value);
    }
    if (key === 'isSoundEnabled') {
        if (value && !this.audioCtx) {
            this._setupAudio();
        } else if (!value && this.isSoundPlaying) {
            const playButton = this.uiContainer.querySelector('.sound-play-button'); // Find the specific play button
            this.toggleSoundPlayback(playButton); // Stop playback
        }
    }
    if (key === 'soundVolume' && this.gainNode) {
      this.gainNode.gain.setValueAtTime(value, this.audioCtx.currentTime);
    }
  }

  toggleSoundPlayback(button) {
      if (!this.settings.isSoundEnabled) return;
      this._setupAudio(); // Ensure context is ready
      this.isSoundPlaying = !this.isSoundPlaying;
      if (this.isSoundPlaying && this.audioCtx.state === 'running') {
          this.gainNode.gain.linearRampToValueAtTime(this.settings.soundVolume, this.audioCtx.currentTime + 0.1);
          button.innerText = 'Pause Sound';
      } else {
          if (this.gainNode) this.gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.1);
          button.innerText = 'Play Sound';
      }
  }

  animate(time) {
    if (!this.settings.isAnimated) {
      cancelAnimationFrame(this.animationFrameId);
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

    this._updateSound(time);
    this.draw(time);
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * Main drawing loop.
   * @param {number} [time=0] - The current time from requestAnimationFrame.
   */
  draw(time = 0) {
    // Calculate preview dimensions while maintaining A2 aspect ratio
    const aspectRatio = this.previewPreset.width / this.previewPreset.height;
    let previewWidth = window.innerWidth * 0.9;
    let previewHeight = previewWidth / aspectRatio;

    if (previewHeight > window.innerHeight * 0.8) {
      previewHeight = window.innerHeight * 0.8;
      previewWidth = previewHeight * aspectRatio;
    }

    this.canvas.width = previewWidth;
    this.canvas.height = previewHeight;

    // Scale the drawing context to match the preview size
    const scale = previewWidth / this.previewPreset.width;
    this.context.save();
    this.context.scale(scale, scale);

    // Call the core drawing function with A2 dimensions
    this.renderArtwork(this.context, this.previewPreset.width, this.previewPreset.height, this.settings, time);

    this.context.restore();
  }

  _generateGrid(width, height, settings) {
    const cells = [];
    const { count, margin, gridSystem } = settings;
    const gridWidth = width - 2 * margin;
    const gridHeight = height - 2 * margin;

    if (gridSystem === 'uniform' || count <= 1) {
      for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
          const tileWidth = gridWidth / count;
          const tileHeight = gridHeight / count;
          const x = margin + i * tileWidth;
          const y = margin + j * tileHeight;
          cells.push({ x, y, width: tileWidth, height: tileHeight });
        }
      }
    } else if (gridSystem === 'randomized') {
      const xPoints = [0, ...Array.from({ length: count - 1 }, () => Math.random()), 1].sort();
      const yPoints = [0, ...Array.from({ length: count - 1 }, () => Math.random()), 1].sort();

      for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
          const x = margin + xPoints[i] * gridWidth;
          const y = margin + yPoints[j] * gridHeight;
          const tileWidth = (xPoints[i + 1] - xPoints[i]) * gridWidth;
          const tileHeight = (yPoints[j + 1] - yPoints[j]) * gridHeight;
          cells.push({ x, y, width: tileWidth, height: tileHeight });
        }
      }
    }
    return cells;
  }

  _getPaletteBrightness() {
    const palette = this.colorPalettes[this.settings.paletteName];
    if (!palette || palette.length === 0) return 0.5; // Default brightness

    let totalBrightness = 0;
    for (const hex of palette) {
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        // Calculate luminance (perceptual brightness)
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        totalBrightness += brightness;
    }
    // Return average brightness (0-1)
    return totalBrightness / palette.length;
  }

  _initializeLifeGrid() {
    const { count, shapeProbability, gameOfLifeSeed } = this.settings;
    this.lifeGrid = Array(count).fill(null).map(() => Array(count).fill(0));

    if (gameOfLifeSeed === 'random') {
      for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
          this.lifeGrid[i][j] = Math.random() < shapeProbability ? 1 : 0;
        }
      }
    } else if (gameOfLifeSeed === 'glider' && count >= 5) {
      const cx = Math.floor(count / 2) - 1;
      const cy = Math.floor(count / 2) - 1;
      this.lifeGrid[cy][cx + 1] = 1;
      this.lifeGrid[cy + 1][cx + 2] = 1;
      this.lifeGrid[cy + 2][cx] = 1;
      this.lifeGrid[cy + 2][cx + 1] = 1;
      this.lifeGrid[cy + 2][cx + 2] = 1;
    } else if (gameOfLifeSeed === 'pulsar' && count >= 17) {
      const cx = Math.floor(count / 2);
      const cy = Math.floor(count / 2);
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
        if (this.lifeGrid[cy + y] && this.lifeGrid[cy + y][cx + x] !== undefined) this.lifeGrid[cy + y][cx + x] = 1;
      });
    }
  }

  _updateLifeGrid() {
    const { count, gameOfLifeRuleset } = this.settings;
    const newGrid = Array(count).fill(null).map(() => Array(count).fill(0));

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        let liveNeighbors = 0;
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            if (x === 0 && y === 0) continue;
            const ni = (i + x + count) % count;
            const nj = (j + y + count) % count;
            if (this.lifeGrid[ni] && this.lifeGrid[ni][nj] === 1) {
              liveNeighbors++;
            }
          }
        }

        const state = this.lifeGrid[i][j];
        let newState = state;

        // Determine which rules to apply
        let birth, survival;
        switch (gameOfLifeRuleset) {
            case 'highlife':
                birth = [3, 6]; survival = [2, 3];
                break;
            case 'day & night':
                birth = [3, 6, 7, 8]; survival = [3, 4, 6, 7, 8];
                break;
            case 'seeds':
                birth = [2]; survival = [];
                break;
            case 'standard':
            default:
                birth = [3]; survival = [2, 3];
                break;
        }

        if (state === 1) { // Cell is alive
            if (!survival.includes(liveNeighbors)) {
                newState = 0; // Dies
            }
        } else { // Cell is dead
            if (birth.includes(liveNeighbors)) {
                newState = 1; // Is born
            }
        }
        newGrid[i][j] = newState;
      }
    }
    this.lifeGrid = newGrid;
  }

  handleAnimationToggle(isChecked) {
    this.settings.isAnimated = isChecked;
    if (this.settings.isAnimated) {
      this.animate(0);
    } else {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      this.draw(); // Draw a final static frame
    }
  }

  handleGameOfLifeToggle(isChecked) {
    const animCheckbox = this.uiContainer.querySelector('[data-setting="isAnimated"]');
    const gridSystemSelect = this.uiContainer.querySelector('[data-setting="gridSystem"]');

    if (isChecked) {
      if (animCheckbox && !animCheckbox.checked) animCheckbox.click();
      this.settings.gridSystem = 'uniform';
      if (gridSystemSelect) {
        gridSystemSelect.value = 'uniform';
        gridSystemSelect.disabled = true;
      }
      this._initializeLifeGrid();
    } else {
      if (gridSystemSelect) gridSystemSelect.disabled = false;
      this.draw();
    }
  }

  _setupAudio() {
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      // If context exists but is suspended, try to resume it.
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return;
    }
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.oscillator = this.audioCtx.createOscillator();
    this.gainNode = this.audioCtx.createGain();
    this.filterNode = this.audioCtx.createBiquadFilter();

    this.oscillator.type = this.settings.soundWaveform;
    this.oscillator.frequency.setValueAtTime(110, this.audioCtx.currentTime); // Start at A2
    this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime); // Start silent

    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(20000, this.audioCtx.currentTime); // Start wide open

    this.oscillator.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
    this.oscillator.start();
  }

  _updateSound(time) {
    if (!this.isSoundPlaying || !this.audioCtx || !this.oscillator || this.audioCtx.state !== 'running') return;

    // Update oscillator type if changed
    if (this.oscillator.type !== this.settings.soundWaveform) {
        this.oscillator.type = this.settings.soundWaveform;
    }

    const { count, isAnimated, animationType, animationSpeed, padding } = this.settings;
    const effectiveTime = time * animationSpeed;

    // --- Base Frequency from Game of Life ---
    const totalCells = count * count;
    const liveCellCount = this.lifeGrid.flat().reduce((sum, cell) => sum + cell, 0);

    // --- Modulation from Color ---
    const paletteBrightness = this._getPaletteBrightness(); // 0 to 1
    const freqRange = 440 + (paletteBrightness * 440); // Brighter palettes have a higher range (440Hz to 880Hz)
    const baseFreq = 110 + (liveCellCount / totalCells) * freqRange;

    let finalFreq = baseFreq;
    let volume = this.settings.soundVolume;

    // --- Modulation from Animation ---
    if (isAnimated) {
        switch (animationType) {
            case 'flash':
                // Modulate volume to match visual flash, from 0 to target volume
                volume *= (Math.sin(effectiveTime * 0.005) + 1) * 0.5;
                break;
            case 'rotate':
                // Add a vibrato effect
                finalFreq += Math.sin(effectiveTime * 0.005) * 5; // Vibrato of +/- 5Hz
                break;
            case 'move':
                // Modulate frequency based on position
                const moveRange = padding * 0.5;
                const offsetX = Math.sin(effectiveTime * 0.001) * moveRange;
                finalFreq += (offsetX / moveRange) * 10; // Modulate by +/- 10Hz
                break;
        }
    }

    // --- Modulation from Shape Size (Padding) ---
    // Map padding to filter cutoff. More padding = smaller shape = lower cutoff (more muffled)
    const paddingRange = 500 - (-200);
    const normalizedPadding = (padding - (-200)) / paddingRange; // 0 to 1
    const filterFreq = 10000 - (normalizedPadding * 9500); // Maps 0->10000, 1->500
    if (this.filterNode) {
        this.filterNode.frequency.linearRampToValueAtTime(Math.max(40, filterFreq), this.audioCtx.currentTime + 0.1);
    }

    // Smoothly transition to the new frequency and volume
    this.oscillator.frequency.linearRampToValueAtTime(finalFreq, this.audioCtx.currentTime + 0.1);
    this.gainNode.gain.linearRampToValueAtTime(volume, this.audioCtx.currentTime + 0.1);
  }

  renderArtwork(ctx, width, height, settings, time) {
    let { backgroundColor, shapeType, lineWidth, padding, shapeProbability, paletteName, textContent, fontSizeMultiplier, fontFamily, isAnimated, animationType, animationSpeed, lineColor, isGameOfLife, gridSystem, count, blendMode } = settings;
    const activePalette = this.colorPalettes[paletteName];
    const effectiveTime = time * animationSpeed;

    // Clear canvas / set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const grid = this._generateGrid(width, height, settings);
    const useLifeGrid = isGameOfLife && gridSystem === 'uniform';

    grid.forEach((cell, index) => {
      const { x, y, width: tileWidth, height: tileHeight } = cell;

      // Draw an outlined rectangle
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;

      const innerWidth = tileWidth - padding;
      const innerHeight = tileHeight - padding;

      ctx.strokeRect(x + padding / 2, y + padding / 2, innerWidth, innerHeight);

      // Draw a smaller, filled shape inside with varied probability
      let isCellActive = false;
      if (useLifeGrid) {
        const i = Math.floor(index / count);
        const j = index % count;
        isCellActive = this.lifeGrid[i] && this.lifeGrid[i][j] === 1;
      } else {
        isCellActive = Math.random() < shapeProbability;
      }

      // Always draw a shape, but color depends on active state
      const fillColor = isCellActive ? activePalette[Math.floor(Math.random() * activePalette.length)] : '#2a2a2a';
      
      if (fillColor) {
        ctx.save();
        ctx.fillStyle = fillColor;
        ctx.globalCompositeOperation = blendMode;
        ctx.strokeStyle = fillColor;
        ctx.lineWidth = lineWidth * 0.8;
        ctx.translate(x + tileWidth / 2, y + tileHeight / 2);
        if (isAnimated) {
          switch (animationType) {
            case 'rotate':
              ctx.rotate(effectiveTime * 0.001);
              break;
            case 'flash':
              // Pulse opacity between 0.2 and 1.0
              ctx.globalAlpha = (Math.sin(effectiveTime * 0.005) + 1) * 0.4 + 0.2;
              break;
            case 'move':
              const moveRange = padding * 0.5; // Move within the padding area
              const offsetX = Math.sin(effectiveTime * 0.001) * moveRange;
              const offsetY = Math.cos(effectiveTime * 0.001) * moveRange;
              ctx.translate(offsetX, offsetY);
              break;
            case 'wave':
              const waveFactor = Math.sin(effectiveTime * 0.002 + x * 0.01 + y * 0.01);
              const waveScale = 1 + waveFactor * 0.2;
              ctx.scale(waveScale, waveScale);
              break;
          }
        }
        const drawW = Math.max(0, tileWidth - padding * 1.5);
        const drawH = Math.max(0, tileHeight - padding * 1.5);

        switch (shapeType) {
            case 'circle':
            case 'arc':
            case 'triangle':
            case 'word':
            case 'truchet':
            case 'rectangle':
            default:
              const arcTime = (isAnimated && animationType === 'arc sweep') ? effectiveTime : 0;
              this.drawer.draw(shapeType, drawW, drawH, arcTime, {x, y}, textContent, fontFamily, fontSizeMultiplier);
              break;
        }
        ctx.restore();
      }
    });
  }

  // --- 5. HELPERS ---
  _getDownloadFilename(presetName) {
    // Provides a more detailed filename for this generator
    return `artwork-${presetName.replace(/\s+/g, '_')}-m${this.settings.margin}-c${this.settings.count}.png`;
  }
}