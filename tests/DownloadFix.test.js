import BaseGenerator from '../src/BaseGenerator.js';

// Mock generator class for testing download functionality
class MockGenerator extends BaseGenerator {
  constructor(canvasContainer, uiContainer) {
    super(canvasContainer, uiContainer);
    this.settings = {
      testSetting: 'test'
    };
    this.presets = {
      'Test Preset': { width: 800, height: 600 }
    };
  }

  setup() {}
  createControls() {}
  draw() {}
  renderArtwork(context, width, height, settings, frame) {
    context.fillRect(0, 0, width, height);
  }
}

describe('Download Functionality Fix', () => {
  let canvasContainer;
  let uiContainer;
  let generator;

  beforeEach(() => {
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

  describe('Download Artwork', () => {
    test('should download artwork for 2D generators', () => {
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

    test('should download artwork for 3D generators', () => {
      generator.is3D = true;
      
      // Create a mock canvas element
      const mockCanvas = document.createElement('canvas');
      canvasContainer.appendChild(mockCanvas);
      
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test 3D Preset';
      
      const drawSpy = jest.spyOn(generator, 'draw');
      
      generator.downloadArtwork(mockPreset, mockPresetName);
      
      expect(drawSpy).toHaveBeenCalled();
    });

    test('should generate correct filename', () => {
      const filename = generator._getDownloadFilename('Test Preset');
      expect(filename).toBe('artwork-Test_Preset.png');
    });

    test('should handle special characters in filename', () => {
      const filename = generator._getDownloadFilename('Test/Preset*Name?');
      expect(filename).toBe('artwork-Test_Preset_Name_.png');
    });
  });

  describe('Download Error Handling', () => {
    test('should handle missing canvas element in 3D download', () => {
      generator.is3D = true;
      const consoleSpy = jest.spyOn(console, 'error');
      
      generator.downloadArtwork({ width: 800, height: 600 }, 'Test');
      
      expect(consoleSpy).toHaveBeenCalledWith('Canvas element not found in canvasContainer for 3D download.');
    });
  });

  describe('UI Controls', () => {
    test('should create slider control', () => {
      const slider = generator._createSlider('testSetting', 'Test Slider', { min: 0, max: 100 });
      
      expect(slider).toBeInstanceOf(HTMLElement);
      const input = slider.querySelector('input[type="range"]');
      expect(input).toBeTruthy();
      expect(input.min).toBe('0');
      expect(input.max).toBe('100');
    });

    test('should create color input control', () => {
      const colorInput = generator._createColorInput('testSetting', 'Test Color');
      
      expect(colorInput).toBeInstanceOf(HTMLElement);
      const input = colorInput.querySelector('input[type="color"]');
      expect(input).toBeTruthy();
    });

    test('should create text input control', () => {
      const textInput = generator._createTextInput('testSetting', 'Test Text');
      
      expect(textInput).toBeInstanceOf(HTMLElement);
      const input = textInput.querySelector('input[type="text"]');
      expect(input).toBeTruthy();
    });

    test('should create checkbox control', () => {
      const checkbox = generator._createCheckbox('testSetting', 'Test Checkbox');
      
      expect(checkbox).toBeInstanceOf(HTMLElement);
      const input = checkbox.querySelector('input[type="checkbox"]');
      expect(input).toBeTruthy();
    });

    test('should create select control', () => {
      const options = ['option1', 'option2', 'option3'];
      const select = generator._createSelect('testSetting', 'Test Select', options);
      
      expect(select).toBeInstanceOf(HTMLElement);
      const selectElement = select.querySelector('select');
      expect(selectElement).toBeTruthy();
      
      const optionElements = selectElement.querySelectorAll('option');
      expect(optionElements).toHaveLength(3);
    });
  });

  describe('Control Event Handling', () => {
    test('should update settings when slider changes', () => {
      const slider = generator._createSlider('testSetting', 'Test Slider', { min: 0, max: 100 });
      const input = slider.querySelector('input[type="range"]');
      
      input.value = '75';
      input.dispatchEvent(new Event('input'));
      
      expect(generator.settings.testSetting).toBe(75);
    });

    test('should update settings when color changes', () => {
      const colorInput = generator._createColorInput('testSetting', 'Test Color');
      const input = colorInput.querySelector('input[type="color"]');
      
      input.value = '#ff0000';
      input.dispatchEvent(new Event('input'));
      
      expect(generator.settings.testSetting).toBe('#ff0000');
    });

    test('should update settings when text changes', () => {
      const textInput = generator._createTextInput('testSetting', 'Test Text');
      const input = textInput.querySelector('input[type="text"]');
      
      input.value = 'new text';
      input.dispatchEvent(new Event('input'));
      
      expect(generator.settings.testSetting).toBe('new text');
    });

    test('should update settings when checkbox changes', () => {
      const checkbox = generator._createCheckbox('testSetting', 'Test Checkbox');
      const input = checkbox.querySelector('input[type="checkbox"]');
      
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      
      expect(generator.settings.testSetting).toBe(true);
    });

    test('should update settings when select changes', () => {
      const options = ['option1', 'option2', 'option3'];
      const select = generator._createSelect('testSetting', 'Test Select', options);
      const selectElement = select.querySelector('select');
      
      selectElement.value = 'option2';
      selectElement.dispatchEvent(new Event('change'));
      
      expect(generator.settings.testSetting).toBe('option2');
    });
  });

  describe('Fieldset Controls', () => {
    test('should create fieldset with toggle functionality', () => {
      const fieldset = generator._createfieldset('Test Group');
      
      expect(fieldset).toBeInstanceOf(HTMLElement);
      expect(fieldset.classList.contains('control-group')).toBe(true);
      
      const header = fieldset.querySelector('.control-group-header');
      const content = fieldset.querySelector('.control-group-content');
      
      expect(header).toBeTruthy();
      expect(content).toBeTruthy();
    });

    test('should toggle content visibility when header is clicked', () => {
      const fieldset = generator._createfieldset('Test Group');
      
      const header = fieldset.querySelector('.control-group-header');
      const content = fieldset.querySelector('.control-group-content');
      
      // Initially should be active (first fieldset)
      expect(content.classList.contains('active')).toBe(true);
      expect(header.classList.contains('active')).toBe(true);
      
      // Click to toggle
      header.click();
      expect(content.classList.contains('active')).toBe(false);
      expect(header.classList.contains('active')).toBe(false);
      
      // Click again to toggle back
      header.click();
      expect(content.classList.contains('active')).toBe(true);
      expect(header.classList.contains('active')).toBe(true);
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
});
