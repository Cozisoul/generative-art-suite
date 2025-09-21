import BaseGenerator from '../src/BaseGenerator.js';

// Mock generator class for testing UI controls
class MockGenerator extends BaseGenerator {
  constructor(canvasContainer, uiContainer) {
    super(canvasContainer, uiContainer);
    this.settings = {
      testSlider: 50,
      testColor: '#ff0000',
      testText: 'test',
      testCheckbox: true,
      testSelect: 'option1',
      testNumber: 42,
      testRange: 75
    };
  }

  setup() {}
  createControls() {}
  draw() {}
  renderArtwork() {}
}

describe('UI Controls', () => {
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

  describe('Slider Control', () => {
    test('should create slider with correct attributes', () => {
      const slider = generator._createSlider('testSlider', 'Test Slider', { 
        min: 0, 
        max: 100, 
        step: 1, 
        unit: 'px' 
      });
      
      expect(slider).toBeInstanceOf(HTMLElement);
      
      const input = slider.querySelector('input[type="range"]');
      const label = slider.querySelector('label');
      
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input.min).toBe('0');
      expect(input.max).toBe('100');
      expect(input.step).toBe('1');
      expect(input.value).toBe('50');
      expect(label.textContent).toContain('Test Slider');
      expect(label.textContent).toContain('50px');
    });

    test('should update label when slider value changes', () => {
      const slider = generator._createSlider('testSlider', 'Test Slider', { 
        min: 0, 
        max: 100, 
        unit: 'px' 
      });
      
      const input = slider.querySelector('input[type="range"]');
      const label = slider.querySelector('label');
      
      input.value = '75';
      input.dispatchEvent(new Event('input'));
      
      expect(label.textContent).toContain('75px');
      expect(generator.settings.testSlider).toBe(75);
    });

    test('should handle decimal step values', () => {
      const slider = generator._createSlider('testSlider', 'Test Slider', { 
        min: 0, 
        max: 1, 
        step: 0.01 
      });
      
      const input = slider.querySelector('input[type="range"]');
      expect(input.step).toBe('0.01');
    });
  });

  describe('Color Input Control', () => {
    test('should create color input with correct attributes', () => {
      const colorInput = generator._createColorInput('testColor', 'Test Color');
      
      expect(colorInput).toBeInstanceOf(HTMLElement);
      
      const input = colorInput.querySelector('input[type="color"]');
      const label = colorInput.querySelector('label');
      
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input.value).toBe('#ff0000');
      expect(label.textContent).toContain('Test Color');
    });

    test('should update settings when color changes', () => {
      const colorInput = generator._createColorInput('testColor', 'Test Color');
      
      const input = colorInput.querySelector('input[type="color"]');
      
      input.value = '#00ff00';
      input.dispatchEvent(new Event('change'));
      
      expect(generator.settings.testColor).toBe('#00ff00');
    });
  });

  describe('Text Input Control', () => {
    test('should create text input with correct attributes', () => {
      const textInput = generator._createTextInput('testText', 'Test Text');
      
      expect(textInput).toBeInstanceOf(HTMLElement);
      
      const input = textInput.querySelector('input[type="text"]');
      const label = textInput.querySelector('label');
      
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input.value).toBe('test');
      expect(label.textContent).toContain('Test Text');
    });

    test('should update settings when text changes', () => {
      const textInput = generator._createTextInput('testText', 'Test Text');
      
      const input = textInput.querySelector('input[type="text"]');
      
      input.value = 'new text';
      input.dispatchEvent(new Event('input'));
      
      expect(generator.settings.testText).toBe('new text');
    });

    test('should create textarea for multiline text', () => {
      const textarea = generator._createTextInput('testText', 'Test Text', true);
      
      const input = textarea.querySelector('textarea');
      expect(input).toBeTruthy();
    });
  });

  describe('Checkbox Control', () => {
    test('should create checkbox with correct attributes', () => {
      const checkbox = generator._createCheckbox('testCheckbox', 'Test Checkbox');
      
      expect(checkbox).toBeInstanceOf(HTMLElement);
      
      const input = checkbox.querySelector('input[type="checkbox"]');
      const label = checkbox.querySelector('label');
      
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input.checked).toBe(true);
      expect(label.textContent).toContain('Test Checkbox');
    });

    test('should update settings when checkbox changes', () => {
      const checkbox = generator._createCheckbox('testCheckbox', 'Test Checkbox');
      
      const input = checkbox.querySelector('input[type="checkbox"]');
      
      input.checked = false;
      input.dispatchEvent(new Event('change'));
      
      expect(generator.settings.testCheckbox).toBe(false);
    });
  });

  describe('Select Control', () => {
    test('should create select with correct options', () => {
      const options = ['option1', 'option2', 'option3'];
      const select = generator._createSelect('testSelect', 'Test Select', options);
      
      expect(select).toBeInstanceOf(HTMLElement);
      
      const selectElement = select.querySelector('select');
      const label = select.querySelector('label');
      
      expect(selectElement).toBeTruthy();
      expect(label).toBeTruthy();
      expect(selectElement.value).toBe('option1');
      expect(label.textContent).toContain('Test Select');
      
      const optionElements = selectElement.querySelectorAll('option');
      expect(optionElements).toHaveLength(3);
      
      options.forEach((option, index) => {
        expect(optionElements[index].value).toBe(option);
        expect(optionElements[index].textContent).toBe(option);
      });
    });

    test('should update settings when select changes', () => {
      const options = ['option1', 'option2', 'option3'];
      const select = generator._createSelect('testSelect', 'Test Select', options);
      
      const selectElement = select.querySelector('select');
      
      selectElement.value = 'option2';
      selectElement.dispatchEvent(new Event('change'));
      
      expect(generator.settings.testSelect).toBe('option2');
    });
  });

  describe('Number Input Control', () => {
    test('should create number input with correct attributes', () => {
      const numberInput = generator._createNumberInput('testNumber', 'Test Number', { 
        min: 0, 
        max: 100, 
        step: 1 
      });
      
      expect(numberInput).toBeInstanceOf(HTMLElement);
      
      const input = numberInput.querySelector('input[type="number"]');
      const label = numberInput.querySelector('label');
      
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input.value).toBe('42');
      expect(input.min).toBe('0');
      expect(input.max).toBe('100');
      expect(input.step).toBe('1');
      expect(label.textContent).toContain('Test Number');
    });

    test('should update settings when number changes', () => {
      const numberInput = generator._createNumberInput('testNumber', 'Test Number');
      
      const input = numberInput.querySelector('input[type="number"]');
      
      input.value = '99';
      input.dispatchEvent(new Event('input'));
      
      expect(generator.settings.testNumber).toBe(99);
    });
  });

  describe('Button Control', () => {
    test('should create button with correct attributes', () => {
      const clickHandler = jest.fn();
      const button = generator._createButton('Test Button', clickHandler);
      
      expect(button).toBeInstanceOf(HTMLElement);
      expect(button.tagName).toBe('BUTTON');
      expect(button.textContent).toBe('Test Button');
      
      button.click();
      expect(clickHandler).toHaveBeenCalled();
    });

    test('should create button with custom class', () => {
      const button = generator._createButton('Test Button', () => {}, 'custom-class');
      
      expect(button.classList.contains('custom-class')).toBe(true);
    });
  });

  describe('Fieldset Control', () => {
    test('should create fieldset with toggle functionality', () => {
      const fieldset = generator._createfieldset('Test Group');
      
      expect(fieldset).toBeInstanceOf(HTMLElement);
      expect(fieldset.classList.contains('control-group')).toBe(true);
      
      const header = fieldset.querySelector('.control-group-header');
      const content = fieldset.querySelector('.control-group-content');
      
      expect(header).toBeTruthy();
      expect(content).toBeTruthy();
      expect(header.textContent).toBe('Test Group');
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

  describe('Control Event Handling', () => {
    test('should call onSettingChange when setting changes', () => {
      const onSettingChangeSpy = jest.spyOn(generator, 'onSettingChange');
      
      const slider = generator._createSlider('testSlider', 'Test Slider', { min: 0, max: 100 });
      const input = slider.querySelector('input[type="range"]');
      
      input.value = '75';
      input.dispatchEvent(new Event('input'));
      
      expect(onSettingChangeSpy).toHaveBeenCalledWith('testSlider', 75);
    });

    test('should handle multiple control types in same container', () => {
      const container = document.createElement('div');
      
      container.appendChild(generator._createSlider('testSlider', 'Slider', { min: 0, max: 100 }));
      container.appendChild(generator._createColorInput('testColor', 'Color'));
      container.appendChild(generator._createTextInput('testText', 'Text'));
      container.appendChild(generator._createCheckbox('testCheckbox', 'Checkbox'));
      
      const controls = container.querySelectorAll('input, select, textarea');
      expect(controls).toHaveLength(5); // 1 slider + 1 color + 1 text + 1 checkbox + 1 hidden input for color
    });
  });

  describe('Control Validation', () => {
    test('should handle invalid input values gracefully', () => {
      const slider = generator._createSlider('testSlider', 'Test Slider', { min: 0, max: 100 });
      const input = slider.querySelector('input[type="range"]');
      
      // Set invalid value
      input.value = 'invalid';
      input.dispatchEvent(new Event('input'));
      
      // Should not crash and should handle gracefully
      expect(generator.settings.testSlider).toBeDefined();
    });

    test('should clamp values to min/max bounds', () => {
      const slider = generator._createSlider('testSlider', 'Test Slider', { min: 0, max: 100 });
      const input = slider.querySelector('input[type="range"]');
      
      // Set value below min
      input.value = '-10';
      input.dispatchEvent(new Event('input'));
      
      // HTML5 range input should handle this automatically
      expect(Number(input.value)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Control Accessibility', () => {
    test('should have proper labels for screen readers', () => {
      const slider = generator._createSlider('testSlider', 'Test Slider', { min: 0, max: 100 });
      const input = slider.querySelector('input[type="range"]');
      const label = slider.querySelector('label');
      
      expect(label.textContent).toContain('Test Slider');
      expect(input.getAttribute('aria-label')).toBe('Test Slider');
    });

    test('should have proper form associations', () => {
      const textInput = generator._createTextInput('testText', 'Test Text');
      const input = textInput.querySelector('input[type="text"]');
      const label = textInput.querySelector('label');
      
      expect(label.getAttribute('for')).toBe(input.id);
    });
  });
});
