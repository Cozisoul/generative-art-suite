import BaseGenerator from '../src/BaseGenerator.js';

// Mock generator class for testing
class MockGenerator extends BaseGenerator {
  constructor(canvasContainer, uiContainer) {
    super(canvasContainer, uiContainer);
    this.settings = {
      testSlider: 50,
      testColor: '#ff0000',
      testText: 'test',
      testCheckbox: true,
      testSelect: 'option1'
    };
    this.presets = {
      'Test Preset': { width: 800, height: 600 }
    };
  }

  setup() {
    // Mock setup
  }

  createControls() {
    // Mock controls creation
  }

  draw() {
    // Mock draw method
  }

  renderArtwork(context, width, height, settings, frame) {
    // Mock render method
    context.fillRect(0, 0, width, height);
  }
}

describe('BaseGenerator', () => {
  let canvasContainer;
  let uiContainer;
  let generator;

  beforeEach(() => {
    // Create mock DOM elements
    canvasContainer = document.createElement('div');
    uiContainer = document.createElement('div');
    document.body.appendChild(canvasContainer);
    document.body.appendChild(uiContainer);
    
    generator = new MockGenerator(canvasContainer, uiContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should throw error when instantiated directly', () => {
      expect(() => new BaseGenerator(canvasContainer, uiContainer)).toThrow();
    });

    test('should initialize with correct properties', () => {
      expect(generator.canvasContainer).toBe(canvasContainer);
      expect(generator.uiContainer).toBe(uiContainer);
      expect(generator.is3D).toBe(false);
    });
  });

  describe('UI Control Creation', () => {
    test('should create fieldset with toggle functionality', () => {
      const fieldset = generator._createfieldset('Test Group');
      
      expect(fieldset).toBeInstanceOf(HTMLElement);
      expect(fieldset.classList.contains('control-group')).toBe(true);
      
      const header = fieldset.querySelector('.control-group-header');
      const content = fieldset.querySelector('.control-group-content');
      
      expect(header).toBeTruthy();
      expect(content).toBeTruthy();
      expect(header.innerText).toBe('Test Group');
    });

    test('should create slider control', () => {
      const slider = generator._createSlider('testSlider', 'Test Slider', { min: 0, max: 100 });
      
      expect(slider).toBeInstanceOf(HTMLElement);
      const input = slider.querySelector('input[type="range"]');
      const label = slider.querySelector('label');
      
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input.min).toBe('0');
      expect(input.max).toBe('100');
      expect(input.value).toBe('50'); // Should match settings value
    });

    test('should create color input control', () => {
      const colorInput = generator._createColorInput('testColor', 'Test Color');
      
      expect(colorInput).toBeInstanceOf(HTMLElement);
      const input = colorInput.querySelector('input[type="color"]');
      const label = colorInput.querySelector('label');
      
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input.value).toBe('#ff0000'); // Should match settings value
    });

    test('should create text input control', () => {
      const textInput = generator._createTextInput('testText', 'Test Text');
      
      expect(textInput).toBeInstanceOf(HTMLElement);
      const input = textInput.querySelector('input[type="text"]');
      const label = textInput.querySelector('label');
      
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input.value).toBe('test'); // Should match settings value
    });

    test('should create checkbox control', () => {
      const checkbox = generator._createCheckbox('testCheckbox', 'Test Checkbox');
      
      expect(checkbox).toBeInstanceOf(HTMLElement);
      const input = checkbox.querySelector('input[type="checkbox"]');
      const label = checkbox.querySelector('label');
      
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input.checked).toBe(true); // Should match settings value
    });

    test('should create select control', () => {
      const options = ['option1', 'option2', 'option3'];
      const select = generator._createSelect('testSelect', 'Test Select', options);
      
      expect(select).toBeInstanceOf(HTMLElement);
      const selectElement = select.querySelector('select');
      const label = select.querySelector('label');
      
      expect(selectElement).toBeTruthy();
      expect(label).toBeTruthy();
      expect(selectElement.value).toBe('option1'); // Should match settings value
      
      const optionElements = selectElement.querySelectorAll('option');
      expect(optionElements).toHaveLength(3);
    });

    test('should create button control', () => {
      const button = generator._createButton('Test Button', () => {});
      
      expect(button).toBeInstanceOf(HTMLElement);
      expect(button.tagName).toBe('BUTTON');
      expect(button.innerText).toBe('Test Button');
    });
  });

  describe('Download Functionality', () => {
    test('should download artwork for 2D generators', () => {
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test Preset';
      
      // Mock the renderArtwork method
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

    test('should download artwork for 3D generators', () => {
      generator.is3D = true;
      
      // Create a mock canvas element
      const mockCanvas = document.createElement('canvas');
      canvasContainer.appendChild(mockCanvas);
      
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test Preset';
      
      const drawSpy = jest.spyOn(generator, 'draw');
      
      generator.downloadArtwork(mockPreset, mockPresetName);
      
      expect(drawSpy).toHaveBeenCalled();
    });

    test('should generate correct filename', () => {
      const filename = generator._getDownloadFilename('Test Preset Name');
      expect(filename).toBe('artwork-Test_Preset_Name.png');
    });

    test('should handle filename with special characters', () => {
      const filename = generator._getDownloadFilename('Test/Preset*Name?');
      expect(filename).toBe('artwork-Test_Preset_Name_.png');
    });
  });

  describe('Preset Management', () => {
    test('should find preset by name', () => {
      const preset = generator._findPreset('Test Preset');
      expect(preset).toEqual({ width: 800, height: 600 });
    });

    test('should return undefined for non-existent preset', () => {
      const preset = generator._findPreset('Non-existent Preset');
      expect(preset).toBeUndefined();
    });
  });

  describe('Setting Changes', () => {
    test('should handle setting changes', () => {
      const onSettingChangeSpy = jest.spyOn(generator, 'onSettingChange');
      
      generator._handleSettingChange('testSlider', 75);
      
      expect(generator.settings.testSlider).toBe(75);
      expect(onSettingChangeSpy).toHaveBeenCalledWith('testSlider', 75);
    });
  });

  describe('Animation Download', () => {
    test('should download animation', async () => {
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test Animation';
      
      // Mock the renderArtwork method
      const renderSpy = jest.spyOn(generator, 'renderArtwork');
      
      await generator.downloadAnimation(mockPreset, mockPresetName, { duration: 1000, frameRate: 10 });
      
      // Should have been called multiple times for animation frames
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing canvas element in 3D download', () => {
      generator.is3D = true;
      const consoleSpy = jest.spyOn(console, 'error');
      
      generator.downloadArtwork({ width: 800, height: 600 }, 'Test');
      
      expect(consoleSpy).toHaveBeenCalledWith('Canvas element not found in canvasContainer for 3D download.');
    });
  });
});
