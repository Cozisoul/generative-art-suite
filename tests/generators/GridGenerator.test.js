import GridGenerator from '../../src/generators/sketch-01.js';

describe('GridGenerator', () => {
  let canvasContainer;
  let uiContainer;
  let generator;

  beforeEach(() => {
    canvasContainer = document.createElement('div');
    uiContainer = document.createElement('div');
    document.body.appendChild(canvasContainer);
    document.body.appendChild(uiContainer);
    
    generator = new GridGenerator(canvasContainer, uiContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with correct default settings', () => {
      expect(generator.settings).toHaveProperty('backgroundColor');
      expect(generator.settings).toHaveProperty('margin');
      expect(generator.settings).toHaveProperty('count');
      expect(generator.settings).toHaveProperty('padding');
      expect(generator.settings).toHaveProperty('lineColor');
      expect(generator.settings).toHaveProperty('gridSystem');
      expect(generator.settings).toHaveProperty('lineWidth');
      expect(generator.settings).toHaveProperty('shapeProbability');
      expect(generator.settings).toHaveProperty('shapeType');
      expect(generator.settings).toHaveProperty('blendMode');
      expect(generator.settings).toHaveProperty('paletteName');
    });

    test('should have correct presets', () => {
      expect(generator.presets).toHaveProperty('Square');
      expect(generator.presets).toHaveProperty('Portrait');
      expect(generator.presets).toHaveProperty('Landscape');
      expect(generator.presets).toHaveProperty('Instagram Square');
      expect(generator.presets).toHaveProperty('Instagram Story');
    });
  });

  describe('UI Controls', () => {
    test('should create all control groups', () => {
      generator.createControls();
      
      const controlGroups = uiContainer.querySelectorAll('.control-group');
      expect(controlGroups.length).toBeGreaterThan(0);
      
      // Check for specific control groups
      const groupHeaders = Array.from(controlGroups).map(group => 
        group.querySelector('.control-group-header').innerText
      );
      
      expect(groupHeaders).toContain('Grid');
      expect(groupHeaders).toContain('Shape');
      expect(groupHeaders).toContain('Text');
    });

    test('should create grid controls', () => {
      generator.createControls();
      
      const gridGroup = Array.from(uiContainer.querySelectorAll('.control-group'))
        .find(group => group.querySelector('.control-group-header').innerText === 'Grid');
      
      expect(gridGroup).toBeTruthy();
      
      // Check for specific controls
      expect(gridGroup.querySelector('input[type="color"][data-setting="backgroundColor"]')).toBeTruthy();
      expect(gridGroup.querySelector('input[type="range"][data-setting="margin"]')).toBeTruthy();
      expect(gridGroup.querySelector('input[type="range"][data-setting="count"]')).toBeTruthy();
      expect(gridGroup.querySelector('input[type="range"][data-setting="padding"]')).toBeTruthy();
      expect(gridGroup.querySelector('input[type="color"][data-setting="lineColor"]')).toBeTruthy();
      expect(gridGroup.querySelector('select[data-setting="gridSystem"]')).toBeTruthy();
    });

    test('should create shape controls', () => {
      generator.createControls();
      
      const shapeGroup = Array.from(uiContainer.querySelectorAll('.control-group'))
        .find(group => group.querySelector('.control-group-header').innerText === 'Shape');
      
      expect(shapeGroup).toBeTruthy();
      
      // Check for specific controls
      expect(shapeGroup.querySelector('input[type="range"][data-setting="lineWidth"]')).toBeTruthy();
      expect(shapeGroup.querySelector('input[type="range"][data-setting="shapeProbability"]')).toBeTruthy();
      expect(shapeGroup.querySelector('select[data-setting="shapeType"]')).toBeTruthy();
      expect(shapeGroup.querySelector('select[data-setting="blendMode"]')).toBeTruthy();
      expect(shapeGroup.querySelector('select[data-setting="paletteName"]')).toBeTruthy();
    });

    test('should create text controls', () => {
      generator.createControls();
      
      const textGroup = Array.from(uiContainer.querySelectorAll('.control-group'))
        .find(group => group.querySelector('.control-group-header').innerText === 'Text');
      
      expect(textGroup).toBeTruthy();
      
      // Check for specific controls
      expect(textGroup.querySelector('input[type="text"][data-setting="textContent"]')).toBeTruthy();
      expect(textGroup.querySelector('input[type="range"][data-setting="textSize"]')).toBeTruthy();
    });
  });

  describe('Control Interactions', () => {
    test('should update settings when slider changes', () => {
      generator.createControls();
      
      const marginSlider = uiContainer.querySelector('input[data-setting="margin"]');
      marginSlider.value = '100';
      marginSlider.dispatchEvent(new Event('input'));
      
      expect(generator.settings.margin).toBe(100);
    });

    test('should update settings when color input changes', () => {
      generator.createControls();
      
      const colorInput = uiContainer.querySelector('input[data-setting="backgroundColor"]');
      colorInput.value = '#ff0000';
      colorInput.dispatchEvent(new Event('change'));
      
      expect(generator.settings.backgroundColor).toBe('#ff0000');
    });

    test('should update settings when select changes', () => {
      generator.createControls();
      
      const shapeSelect = uiContainer.querySelector('select[data-setting="shapeType"]');
      shapeSelect.value = 'circle';
      shapeSelect.dispatchEvent(new Event('change'));
      
      expect(generator.settings.shapeType).toBe('circle');
    });

    test('should update settings when text input changes', () => {
      generator.createControls();
      
      const textInput = uiContainer.querySelector('input[data-setting="textContent"]');
      textInput.value = 'New Text';
      textInput.dispatchEvent(new Event('input'));
      
      expect(generator.settings.textContent).toBe('New Text');
    });
  });

  describe('Download Functionality', () => {
    test('should download artwork with correct dimensions', () => {
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test Preset';
      
      const renderSpy = jest.spyOn(generator, 'renderArtwork');
      
      generator.downloadArtwork(mockPreset, mockPresetName);
      
      expect(renderSpy).toHaveBeenCalledWith(
        expect.any(Object), // context
        800, // width
        600, // height
        generator.settings, // settings
        0 // frame
      );
    });

    test('should generate correct filename', () => {
      const filename = generator._getDownloadFilename('Test Preset');
      expect(filename).toBe('artwork-Test_Preset.png');
    });
  });

  describe('Color Palettes', () => {
    test('should have color palettes defined', () => {
      expect(generator.colorPalettes).toBeDefined();
      expect(Object.keys(generator.colorPalettes).length).toBeGreaterThan(0);
    });

    test('should apply color palette', () => {
      const originalPalette = generator.settings.paletteName;
      const drawSpy = jest.spyOn(generator, 'draw');
      
      generator._applyPalette('monochrome');
      
      expect(generator.settings.paletteName).toBe('monochrome');
      expect(drawSpy).toHaveBeenCalled();
    });
  });

  describe('Preset Management', () => {
    test('should load preset correctly', () => {
      const preset = generator.presets['Square'];
      expect(preset).toHaveProperty('width');
      expect(preset).toHaveProperty('height');
      expect(preset.width).toBe(preset.height); // Square should have equal width and height
    });

    test('should create preset select element', () => {
      const presetSelect = generator._createPresetSelect();
      expect(presetSelect).toBeInstanceOf(HTMLElement);
      
      const selectElement = presetSelect.querySelector('select');
      expect(selectElement).toBeTruthy();
      
      const options = selectElement.querySelectorAll('option');
      expect(options.length).toBe(Object.keys(generator.presets).length);
    });
  });

  describe('Rendering', () => {
    test('should render artwork without errors', () => {
      const mockContext = {
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        scale: jest.fn(),
        globalCompositeOperation: 'source-over'
      };
      
      expect(() => {
        generator.renderArtwork(mockContext, 800, 600, generator.settings, 0);
      }).not.toThrow();
    });
  });
});
