import LogoGenerator from '../../src/generators/logo-generator.js';

describe('LogoGenerator', () => {
  let canvasContainer;
  let uiContainer;
  let generator;

  beforeEach(() => {
    canvasContainer = document.createElement('div');
    uiContainer = document.createElement('div');
    document.body.appendChild(canvasContainer);
    document.body.appendChild(uiContainer);
    
    generator = new LogoGenerator(canvasContainer, uiContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with correct default settings', () => {
      expect(generator.settings).toHaveProperty('logoText');
      expect(generator.settings).toHaveProperty('fontSize');
      expect(generator.settings).toHaveProperty('fontFamily');
      expect(generator.settings).toHaveProperty('textColor');
      expect(generator.settings).toHaveProperty('backgroundColor');
      expect(generator.settings).toHaveProperty('transparentBg');
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
      
      const groupHeaders = Array.from(controlGroups).map(group => 
        group.querySelector('.control-group-header').innerText
      );
      
      expect(groupHeaders).toContain('Text');
      expect(groupHeaders).toContain('Style');
      expect(groupHeaders).toContain('Background');
      expect(groupHeaders).toContain('Color Palette');
    });

    test('should create text controls', () => {
      generator.createControls();
      
      const textGroup = Array.from(uiContainer.querySelectorAll('.control-group'))
        .find(group => group.querySelector('.control-group-header').innerText === 'Text');
      
      expect(textGroup).toBeTruthy();
      
      expect(textGroup.querySelector('input[data-setting="logoText"]')).toBeTruthy();
      expect(textGroup.querySelector('input[data-setting="fontSize"]')).toBeTruthy();
      expect(textGroup.querySelector('select[data-setting="fontFamily"]')).toBeTruthy();
      expect(textGroup.querySelector('input[data-setting="textColor"]')).toBeTruthy();
    });

    test('should create style controls', () => {
      generator.createControls();
      
      const styleGroup = Array.from(uiContainer.querySelectorAll('.control-group'))
        .find(group => group.querySelector('.control-group-header').innerText === 'Style');
      
      expect(styleGroup).toBeTruthy();
      
      expect(styleGroup.querySelector('input[data-setting="textRotation"]')).toBeTruthy();
      expect(styleGroup.querySelector('input[data-setting="letterSpacing"]')).toBeTruthy();
      expect(styleGroup.querySelector('input[data-setting="lineHeight"]')).toBeTruthy();
    });

    test('should create background controls', () => {
      generator.createControls();
      
      const backgroundGroup = Array.from(uiContainer.querySelectorAll('.control-group'))
        .find(group => group.querySelector('.control-group-header').innerText === 'Background');
      
      expect(backgroundGroup).toBeTruthy();
      
      expect(backgroundGroup.querySelector('input[data-setting="backgroundColor"]')).toBeTruthy();
      expect(backgroundGroup.querySelector('input[data-setting="transparentBg"]')).toBeTruthy();
    });
  });

  describe('Control Interactions', () => {
    test('should update text settings', () => {
      generator.createControls();
      
      const textInput = uiContainer.querySelector('input[data-setting="logoText"]');
      textInput.value = 'New Logo';
      textInput.dispatchEvent(new Event('input'));
      
      expect(generator.settings.logoText).toBe('New Logo');
    });

    test('should update font size', () => {
      generator.createControls();
      
      const fontSizeSlider = uiContainer.querySelector('input[data-setting="fontSize"]');
      fontSizeSlider.value = '72';
      fontSizeSlider.dispatchEvent(new Event('input'));
      
      expect(generator.settings.fontSize).toBe(72);
    });

    test('should update font family', () => {
      generator.createControls();
      
      const fontSelect = uiContainer.querySelector('select[data-setting="fontFamily"]');
      fontSelect.value = 'Arial';
      fontSelect.dispatchEvent(new Event('change'));
      
      expect(generator.settings.fontFamily).toBe('Arial');
    });

    test('should toggle transparent background', () => {
      generator.createControls();
      
      const transparentCheckbox = uiContainer.querySelector('input[data-setting="transparentBg"]');
      transparentCheckbox.checked = true;
      transparentCheckbox.dispatchEvent(new Event('change'));
      
      expect(generator.settings.transparentBg).toBe(true);
    });
  });

  describe('Download Functionality', () => {
    test('should download artwork with transparent background when enabled', () => {
      generator.settings.transparentBg = true;
      
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test Logo';
      
      const renderSpy = jest.spyOn(generator, 'renderArtwork');
      
      generator.downloadArtwork(mockPreset, mockPresetName);
      
      expect(renderSpy).toHaveBeenCalledWith(
        expect.any(Object), // context
        800, // width
        600, // height
        expect.objectContaining({
          skipBackground: true
        }) // settings with skipBackground flag
      );
    });

    test('should download artwork with background when transparent is disabled', () => {
      generator.settings.transparentBg = false;
      
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test Logo';
      
      const renderSpy = jest.spyOn(generator, 'renderArtwork');
      
      generator.downloadArtwork(mockPreset, mockPresetName);
      
      expect(renderSpy).toHaveBeenCalledWith(
        expect.any(Object), // context
        800, // width
        600, // height
        expect.objectContaining({
          skipBackground: false
        }) // settings without skipBackground flag
      );
    });

    test('should generate correct filename', () => {
      const filename = generator._getDownloadFilename('Test Logo');
      expect(filename).toBe('artwork-Test_Logo.png');
    });
  });

  describe('Color Palettes', () => {
    test('should have color palettes defined', () => {
      expect(generator.colorPalettes).toBeDefined();
      expect(Object.keys(generator.colorPalettes).length).toBeGreaterThan(0);
    });

    test('should apply color palette', () => {
      const drawSpy = jest.spyOn(generator, 'draw');
      
      generator._applyPalette('monochrome');
      
      expect(generator.settings.paletteName).toBe('monochrome');
      expect(drawSpy).toHaveBeenCalled();
    });

    test('should update colors when palette changes', () => {
      const originalTextColor = generator.settings.textColor;
      const originalBackgroundColor = generator.settings.backgroundColor;
      
      generator._applyPalette('vibrant');
      
      // Colors should change when palette is applied
      expect(generator.settings.textColor).not.toBe(originalTextColor);
      expect(generator.settings.backgroundColor).not.toBe(originalBackgroundColor);
    });
  });

  describe('Font Management', () => {
    test('should have font families defined', () => {
      expect(generator.fontFamilies).toBeDefined();
      expect(Array.isArray(generator.fontFamilies)).toBe(true);
      expect(generator.fontFamilies.length).toBeGreaterThan(0);
    });

    test('should create font family select with all options', () => {
      generator.createControls();
      
      const fontSelect = uiContainer.querySelector('select[data-setting="fontFamily"]');
      const options = fontSelect.querySelectorAll('option');
      
      expect(options.length).toBe(generator.fontFamilies.length);
      
      generator.fontFamilies.forEach(font => {
        const option = Array.from(options).find(opt => opt.value === font);
        expect(option).toBeTruthy();
      });
    });
  });

  describe('Rendering', () => {
    test('should render artwork without errors', () => {
      const mockContext = {
        fillRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 100 })),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        globalCompositeOperation: 'source-over',
        font: '16px Arial',
        textAlign: 'center',
        textBaseline: 'middle',
        fillStyle: '#000000'
      };
      
      expect(() => {
        generator.renderArtwork(mockContext, 800, 600, generator.settings, 0);
      }).not.toThrow();
    });

    test('should skip background when skipBackground flag is true', () => {
      const mockContext = {
        fillRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 100 })),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        globalCompositeOperation: 'source-over',
        font: '16px Arial',
        textAlign: 'center',
        textBaseline: 'middle',
        fillStyle: '#000000'
      };
      
      const settingsWithSkipBackground = { ...generator.settings, skipBackground: true };
      
      generator.renderArtwork(mockContext, 800, 600, settingsWithSkipBackground, 0);
      
      // fillRect should not be called for background when skipBackground is true
      expect(mockContext.fillRect).not.toHaveBeenCalledWith(0, 0, 800, 600);
    });
  });

  describe('Text Handling', () => {
    test('should handle empty text gracefully', () => {
      generator.settings.logoText = '';
      
      const mockContext = {
        fillRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        globalCompositeOperation: 'source-over',
        font: '16px Arial',
        textAlign: 'center',
        textBaseline: 'middle',
        fillStyle: '#000000'
      };
      
      expect(() => {
        generator.renderArtwork(mockContext, 800, 600, generator.settings, 0);
      }).not.toThrow();
    });

    test('should handle long text', () => {
      generator.settings.logoText = 'This is a very long text that might need to be handled specially';
      
      const mockContext = {
        fillRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn(() => ({ width: 500 })),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        globalCompositeOperation: 'source-over',
        font: '16px Arial',
        textAlign: 'center',
        textBaseline: 'middle',
        fillStyle: '#000000'
      };
      
      expect(() => {
        generator.renderArtwork(mockContext, 800, 600, generator.settings, 0);
      }).not.toThrow();
    });
  });
});
