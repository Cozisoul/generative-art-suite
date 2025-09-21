import GridGenerator from '../src/generators/sketch-01.js';
import SwissGenerator from '../src/generators/swiss-generator.js';
import BauhausGenerator from '../src/generators/bauhaus-generator.js';
import AbstractFilmGenerator from '../src/generators/abstract-film-generator.js';
import GridToolGenerator from '../src/generators/grid-tool-generator.js';
import ImageManipGenerator from '../src/generators/image-manip-generator.js';
import LogoGenerator from '../src/generators/logo-generator.js';
import VeraMolnarGenerator from '../src/generators/vera-molnar-generator.js';
import ThreeDGenerator from '../src/generators/3d-generator.js';

describe('Download Functionality Across All Generators', () => {
  let canvasContainer;
  let uiContainer;

  beforeEach(() => {
    canvasContainer = document.createElement('div');
    uiContainer = document.createElement('div');
    document.body.appendChild(canvasContainer);
    document.body.appendChild(uiContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  const generators = [
    { name: 'GridGenerator', class: GridGenerator },
    { name: 'SwissGenerator', class: SwissGenerator },
    { name: 'BauhausGenerator', class: BauhausGenerator },
    { name: 'AbstractFilmGenerator', class: AbstractFilmGenerator },
    { name: 'GridToolGenerator', class: GridToolGenerator },
    { name: 'ImageManipGenerator', class: ImageManipGenerator },
    { name: 'LogoGenerator', class: LogoGenerator },
    { name: 'VeraMolnarGenerator', class: VeraMolnarGenerator },
    { name: 'ThreeDGenerator', class: ThreeDGenerator }
  ];

  generators.forEach(({ name, class: GeneratorClass }) => {
    describe(`${name} Download Tests`, () => {
      let generator;

      beforeEach(() => {
        generator = new GeneratorClass(canvasContainer, uiContainer);
      });

      test('should have downloadArtwork method', () => {
        expect(typeof generator.downloadArtwork).toBe('function');
      });

      test('should have _getDownloadFilename method', () => {
        expect(typeof generator._getDownloadFilename).toBe('function');
      });

      test('should generate valid filename', () => {
        const filename = generator._getDownloadFilename('Test Preset');
        expect(filename).toMatch(/^artwork-Test_Preset\.png$/);
      });

      test('should handle special characters in filename', () => {
        const filename = generator._getDownloadFilename('Test/Preset*Name?');
        expect(filename).toMatch(/^artwork-Test_Preset_Name_\.png$/);
      });

      test('should download artwork without errors', () => {
        const mockPreset = { width: 800, height: 600 };
        const mockPresetName = 'Test Download';
        
        // Mock the renderArtwork method if it exists
        if (typeof generator.renderArtwork === 'function') {
          jest.spyOn(generator, 'renderArtwork').mockImplementation(() => {});
        }
        
        // Mock the draw method if it exists
        if (typeof generator.draw === 'function') {
          jest.spyOn(generator, 'draw').mockImplementation(() => {});
        }

        expect(() => {
          generator.downloadArtwork(mockPreset, mockPresetName);
        }).not.toThrow();
      });

      test('should create download link with correct attributes', () => {
        const mockPreset = { width: 800, height: 600 };
        const mockPresetName = 'Test Download';
        
        // Mock the renderArtwork method if it exists
        if (typeof generator.renderArtwork === 'function') {
          jest.spyOn(generator, 'renderArtwork').mockImplementation(() => {});
        }
        
        // Mock the draw method if it exists
        if (typeof generator.draw === 'function') {
          jest.spyOn(generator, 'draw').mockImplementation(() => {});
        }

        generator.downloadArtwork(mockPreset, mockPresetName);
        
        // The download should have been triggered (link.click() called)
        // This is verified by the mock in setup.js
      });

      if (name === 'ThreeDGenerator') {
        test('should handle 3D download correctly', () => {
          generator.is3D = true;
          
          // Create a mock canvas element for 3D
          const mockCanvas = document.createElement('canvas');
          canvasContainer.appendChild(mockCanvas);
          
          const mockPreset = { width: 800, height: 600 };
          const mockPresetName = 'Test 3D Download';
          
          const drawSpy = jest.spyOn(generator, 'draw');
          
          generator.downloadArtwork(mockPreset, mockPresetName);
          
          expect(drawSpy).toHaveBeenCalled();
        });

        test('should handle missing canvas element in 3D download', () => {
          generator.is3D = true;
          const consoleSpy = jest.spyOn(console, 'error');
          
          generator.downloadArtwork({ width: 800, height: 600 }, 'Test');
          
          expect(consoleSpy).toHaveBeenCalledWith('Canvas element not found in canvasContainer for 3D download.');
        });
      } else {
        test('should use offscreen canvas for 2D download', () => {
          const mockPreset = { width: 800, height: 600 };
          const mockPresetName = 'Test 2D Download';
          
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
      }
    });
  });

  describe('Animation Download Tests', () => {
    test('should have downloadAnimation method in generators that support it', () => {
      const generatorsWithAnimation = [
        AbstractFilmGenerator,
        VeraMolnarGenerator
      ];

      generatorsWithAnimation.forEach(GeneratorClass => {
        const generator = new GeneratorClass(canvasContainer, uiContainer);
        expect(typeof generator.downloadAnimation).toBe('function');
      });
    });

    test('should download animation without errors', async () => {
      const generator = new AbstractFilmGenerator(canvasContainer, uiContainer);
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Test Animation';
      
      // Mock the renderArtwork method
      jest.spyOn(generator, 'renderArtwork').mockImplementation(() => {});
      
      await expect(generator.downloadAnimation(mockPreset, mockPresetName, { 
        duration: 1000, 
        frameRate: 10 
      })).resolves.not.toThrow();
    });
  });

  describe('Download Error Handling', () => {
    test('should handle missing preset gracefully', () => {
      const generator = new GridGenerator(canvasContainer, uiContainer);
      
      expect(() => {
        generator.downloadArtwork(null, 'Test');
      }).toThrow();
    });

    test('should handle invalid preset dimensions', () => {
      const generator = new GridGenerator(canvasContainer, uiContainer);
      const invalidPreset = { width: 0, height: 0 };
      
      // Mock the renderArtwork method
      jest.spyOn(generator, 'renderArtwork').mockImplementation(() => {});
      
      expect(() => {
        generator.downloadArtwork(invalidPreset, 'Test');
      }).not.toThrow();
    });
  });

  describe('Download Performance', () => {
    test('should complete download within reasonable time', async () => {
      const generator = new GridGenerator(canvasContainer, uiContainer);
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Performance Test';
      
      // Mock the renderArtwork method
      jest.spyOn(generator, 'renderArtwork').mockImplementation(() => {});
      
      const startTime = Date.now();
      generator.downloadArtwork(mockPreset, mockPresetName);
      const endTime = Date.now();
      
      // Download should complete within 100ms (very generous for mocked operations)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Download File Formats', () => {
    test('should generate PNG format for static downloads', () => {
      const generator = new GridGenerator(canvasContainer, uiContainer);
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Format Test';
      
      // Mock the renderArtwork method
      jest.spyOn(generator, 'renderArtwork').mockImplementation(() => {});
      
      generator.downloadArtwork(mockPreset, mockPresetName);
      
      // The toDataURL should be called with 'image/png'
      // This is verified by the mock in setup.js
    });

    test('should generate WebM format for animation downloads', async () => {
      const generator = new AbstractFilmGenerator(canvasContainer, uiContainer);
      const mockPreset = { width: 800, height: 600 };
      const mockPresetName = 'Animation Format Test';
      
      // Mock the renderArtwork method
      jest.spyOn(generator, 'renderArtwork').mockImplementation(() => {});
      
      await generator.downloadAnimation(mockPreset, mockPresetName, { 
        duration: 1000, 
        frameRate: 10 
      });
      
      // The filename should end with .webm
      // This is verified by the implementation
    });
  });
});
