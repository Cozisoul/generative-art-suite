import BaseGenerator from '../src/BaseGenerator.js';

// Mock generator class for testing all download functionality
class MockGenerator extends BaseGenerator {
  constructor(canvasContainer, uiContainer) {
    super(canvasContainer, uiContainer);
    this.settings = {
      testSetting: 'test',
      backgroundColor: '#ffffff',
      animationDuration: 3000
    };
    this.presets = {
      'Test Preset': { width: 800, height: 600 }
    };
    this.isAnimatable = true;
  }

  setup() {}
  createControls() {}
  draw() {
    // Mock draw method that creates a simple canvas
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    canvas.id = 'main-canvas';
    this.canvasContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 400, 300);
  }
  
  renderArtwork(context, width, height, settings, frame) {
    // Mock render method that draws a simple pattern
    context.fillStyle = settings.backgroundColor || '#ffffff';
    context.fillRect(0, 0, width, height);
    
    context.fillStyle = '#ff0000';
    context.fillRect(50, 50, width - 100, height - 100);
    
    // Add some animation based on frame
    if (frame > 0) {
      context.fillStyle = '#00ff00';
      context.fillRect(100 + (frame / 100), 100, 50, 50);
    }
  }
}

describe('Complete Download Functionality Test', () => {
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

  describe('Canvas Capture - Image Download', () => {
    test('should capture and download canvas as PNG', () => {
      // Set up the generator
      generator.setup();
      generator.createControls();
      
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test Canvas Capture';
      
      // Mock the renderArtwork method
      const renderSpy = jest.spyOn(generator, 'renderArtwork');
      
      generator.downloadArtwork(mockPreset, mockPresetName);
      
      // Verify renderArtwork was called
      expect(renderSpy).toHaveBeenCalledWith(
        expect.any(Object), // context
        800, // width
        600, // height
        generator.settings, // settings
        0 // frame
      );
      
      // Verify draw was called to ensure main canvas is rendered
      const drawSpy = jest.spyOn(generator, 'draw');
      generator.downloadArtwork(mockPreset, mockPresetName);
      expect(drawSpy).toHaveBeenCalled();
    });

    test('should handle 3D canvas capture', () => {
      generator.is3D = true;
      
      // Create a mock canvas element
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 800;
      mockCanvas.height = 600;
      canvasContainer.appendChild(mockCanvas);
      
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test 3D Capture';
      
      const drawSpy = jest.spyOn(generator, 'draw');
      
      generator.downloadArtwork(mockPreset, mockPresetName);
      
      expect(drawSpy).toHaveBeenCalled();
    });
  });

  describe('Video Download', () => {
    test('should create video download without errors', async () => {
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test Video';
      
      // Mock the renderArtwork method
      const renderSpy = jest.spyOn(generator, 'renderArtwork');
      
      // Mock requestAnimationFrame to control the animation loop
      const mockRAF = jest.fn((callback) => {
        // Simulate one frame
        callback(performance.now());
        return 1;
      });
      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = mockRAF;
      
      await generator.downloadAnimation(mockPreset, mockPresetName, { 
        duration: 1000, 
        frameRate: 10 
      });
      
      // Should have been called for animation frames
      expect(renderSpy).toHaveBeenCalled();
      
      // Restore original RAF
      window.requestAnimationFrame = originalRAF;
    });

    test('should handle video download errors gracefully', async () => {
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test Video Error';
      
      // Mock captureStream to throw an error
      const originalCaptureStream = HTMLCanvasElement.prototype.captureStream;
      HTMLCanvasElement.prototype.captureStream = jest.fn(() => {
        throw new Error('Capture stream failed');
      });
      
      const consoleSpy = jest.spyOn(console, 'error');
      
      await generator.downloadAnimation(mockPreset, mockPresetName, { 
        duration: 1000, 
        frameRate: 10 
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Error creating video:', expect.any(Error));
      
      // Restore original method
      HTMLCanvasElement.prototype.captureStream = originalCaptureStream;
    });
  });

  describe('GIF Download', () => {
    test('should create GIF download without errors', async () => {
      // Mock GIF library
      global.GIF = jest.fn().mockImplementation(() => ({
        addFrame: jest.fn(),
        on: jest.fn(),
        render: jest.fn()
      }));
      
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test GIF';
      
      // Mock the renderArtwork method
      const renderSpy = jest.spyOn(generator, 'renderArtwork');
      
      await generator.downloadGif(mockPreset, mockPresetName, { 
        duration: 1000, 
        frameRate: 5 
      });
      
      // Should have been called multiple times for GIF frames
      expect(renderSpy).toHaveBeenCalled();
    });

    test('should handle missing GIF library gracefully', async () => {
      // Ensure GIF library is undefined
      delete global.GIF;
      
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test GIF Error';
      
      const consoleSpy = jest.spyOn(console, 'error');
      const alertSpy = jest.spyOn(window, 'alert');
      
      await generator.downloadGif(mockPreset, mockPresetName, { 
        duration: 1000, 
        frameRate: 5 
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('GIF.js library not found. Please include it in your HTML.');
      expect(alertSpy).toHaveBeenCalledWith('GIF.js library not found. Cannot generate GIF. Please check console for details.');
    });
  });

  describe('Download Controls UI', () => {
    test('should create download controls', () => {
      const container = document.createElement('div');
      generator.appendDownloadControls(container);
      
      const downloadContainer = container.querySelector('.control-group');
      expect(downloadContainer).toBeTruthy();
      
      const downloadButton = downloadContainer.querySelector('button');
      expect(downloadButton).toBeTruthy();
      expect(downloadButton.innerText).toBe('Download Image');
    });

    test('should create animation download controls for animatable generators', () => {
      const container = document.createElement('div');
      generator.appendDownloadControls(container);
      
      const videoButton = container.querySelector('button[data-format="webm"]');
      const gifButton = container.querySelector('button[data-format="gif"]');
      
      expect(videoButton).toBeTruthy();
      expect(gifButton).toBeTruthy();
      expect(videoButton.innerText).toBe('Download Video');
      expect(gifButton.innerText).toBe('Download GIF');
    });

    test('should handle download button clicks', () => {
      const container = document.createElement('div');
      generator.appendDownloadControls(container);
      
      // Create a mock preset select
      const presetSelect = generator._createPresetSelect();
      generator.presetSelectElement = presetSelect.querySelector('select');
      
      const downloadButton = container.querySelector('button');
      const downloadSpy = jest.spyOn(generator, 'downloadArtwork');
      
      downloadButton.click();
      
      expect(downloadSpy).toHaveBeenCalledWith(
        generator.presets['Test Preset'],
        'Test Preset'
      );
    });
  });

  describe('Filename Generation', () => {
    test('should generate correct filenames for different formats', () => {
      const baseFilename = generator._getDownloadFilename('Test Preset');
      expect(baseFilename).toBe('artwork-Test_Preset.png');
      
      // Test special characters
      const specialFilename = generator._getDownloadFilename('Test/Preset*Name?');
      expect(specialFilename).toBe('artwork-Test_Preset_Name_.png');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing preset gracefully', () => {
      const container = document.createElement('div');
      generator.appendDownloadControls(container);
      
      // Create a mock preset select with invalid preset
      const presetSelect = generator._createPresetSelect();
      generator.presetSelectElement = presetSelect.querySelector('select');
      
      // Add an option for the non-existent preset
      const invalidOption = document.createElement('option');
      invalidOption.value = 'Non-existent Preset';
      invalidOption.textContent = 'Non-existent Preset';
      generator.presetSelectElement.appendChild(invalidOption);
      
      // Set the value to the invalid preset
      generator.presetSelectElement.value = 'Non-existent Preset';
      
      const consoleSpy = jest.spyOn(console, 'error');
      const downloadButton = container.querySelector('button');
      
      downloadButton.click();
      
      expect(consoleSpy).toHaveBeenCalledWith('Preset "Non-existent Preset" not found.');
    });

    test('should handle missing canvas element in 3D download', () => {
      generator.is3D = true;
      // Ensure no canvas is in the container
      canvasContainer.innerHTML = '';
      
      // Mock the draw method to not create a canvas
      const originalDraw = generator.draw;
      generator.draw = jest.fn();
      
      const consoleSpy = jest.spyOn(console, 'error');
      
      generator.downloadArtwork({ width: 800, height: 600 }, 'Test');
      
      expect(consoleSpy).toHaveBeenCalledWith('Canvas element not found in canvasContainer for 3D download.');
      
      // Restore original draw method
      generator.draw = originalDraw;
    });
  });

  describe('Performance', () => {
    test('should complete image download within reasonable time', () => {
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Performance Test';
      
      const startTime = Date.now();
      generator.downloadArtwork(mockPreset, mockPresetName);
      const endTime = Date.now();
      
      // Download should complete within 100ms (very generous for mocked operations)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
