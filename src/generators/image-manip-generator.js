import BaseGenerator from '../BaseGenerator.js';

export default class ImageManipGenerator extends BaseGenerator {
    constructor(canvasContainer, uiContainer) {
        super(canvasContainer, uiContainer);

        this.presets = {
            'Original Size': { width: 1, height: 1 }, // Special case
            '1:1 Square': { width: 1080, height: 1080 },
            '4:5 Portrait': { width: 1080, height: 1350 },
            '16:9 Widescreen': { width: 1920, height: 1080 },
        };

        this.settings = {
            effect: 'pixelate',
            pixelSize: 20,
            bitmapThreshold: 128,
            asciiPreset: 'medium',
            asciiChars: '`.-:+=*#%@', // Default for 'medium'
            halftoneShape: 'circle',
            anaglyphShift: 10,
            glitchSliceCount: 20,
            glitchColorShift: 10,
            brightness: 0,
            contrast: 0,
            voxelDepth: 5,
        };

        this.sourceImage = null;
        this.sourceImageName = null;
        this.sourceCanvas = document.createElement('canvas');
        this.sourceCtx = this.sourceCanvas.getContext('2d');
        this.previewPreset = this.presets['Original Size'];

        this.asciiPresets = {
            'simple': '`.-',
            'medium': '`.-:+=*#%@',
            'detailed': '`.-_:,;il!I><~+?][}{1)(|\\/tfjrxnuvczXYUJCQ0OZmwqpdbkhao*#MW&8%B@$',
            'blocks': ' ░▒▓█',
            'custom': '',
        };

        this.setup();
    }

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

    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls');

        // --- File Upload ---
        const uploadFieldset = this._createfieldset('Source Image');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', (e) => this._loadImage(e.target.files[0]));
        uploadFieldset.appendChild(fileInput);
        controlsContainer.appendChild(uploadFieldset);

        const adjustmentControls = this._createfieldset('Adjustments');
        adjustmentControls.appendChild(this._createSlider('brightness', 'Brightness', { min: -100, max: 100 }));
        adjustmentControls.appendChild(this._createSlider('contrast', 'Contrast', { min: -100, max: 100 }));
        controlsContainer.appendChild(adjustmentControls);


        // --- Effect Controls ---
        const effectControls = this._createfieldset('Effect');
        const effectSelect = this._createSelect('effect', 'Effect', ['pixelate', 'voxelize', 'bitmap', 'halftone', 'ascii', 'anaglyph', 'glitch']);
        effectControls.appendChild(effectSelect);

        // --- Effect-specific Sliders ---
        effectControls.appendChild(this._createSlider('pixelSize', 'Size / Density', { min: 2, max: 100 }));
        effectControls.appendChild(this._createSlider('voxelDepth', 'Voxel Depth', { min: 0, max: 20 }));
        effectControls.appendChild(this._createSlider('glitchSliceCount', 'Glitch Slices', { min: 0, max: 100 }));
        effectControls.appendChild(this._createSlider('glitchColorShift', 'Glitch Shift', { min: 0, max: 50 }));
        effectControls.appendChild(this._createSlider('anaglyphShift', '3D Shift', { min: -50, max: 50 }));
        effectControls.appendChild(this._createSlider('bitmapThreshold', 'Bitmap Threshold', { min: 1, max: 254 }));

        const asciiPresetSelect = this._createSelect('asciiPreset', 'ASCII Set', Object.keys(this.asciiPresets));
        asciiPresetSelect.querySelector('select').addEventListener('change', (e) => {
            const presetKey = e.target.value;
            if (presetKey !== 'custom') {
                const newChars = this.asciiPresets[presetKey];
                this.settings.asciiChars = newChars;
                const asciiCharsInput = this.uiContainer.querySelector('input[data-setting="asciiChars"]');
                if (asciiCharsInput) {
                    asciiCharsInput.value = newChars;
                }
            }
        });
        effectControls.appendChild(asciiPresetSelect);

        effectControls.appendChild(this._createTextInput('asciiChars', 'ASCII Chars'));
        effectControls.appendChild(this._createSelect('halftoneShape', 'Halftone Shape', ['circle', 'square']));

        controlsContainer.appendChild(effectControls);

        const actionsControls = this._createfieldset('Actions');
        const previewButton = document.createElement('button');
        previewButton.innerText = 'Preview';
        previewButton.addEventListener('click', this._showPreview.bind(this));
        actionsControls.appendChild(previewButton);
        controlsContainer.appendChild(actionsControls);

        this.appendDownloadControls(controlsContainer);
        this.uiContainer.appendChild(controlsContainer);

        this._updateControlVisibility(); // Initial setup
    }

    onSettingChange(key, value) {
        if (key === 'effect') {
            this._updateControlVisibility();
        }
        // If user types in the custom box, switch preset to 'custom'
        if (key === 'asciiChars') {
            this.settings.asciiPreset = 'custom';
            const asciiPresetSelect = this.uiContainer.querySelector('select[data-setting="asciiPreset"]');
            if (asciiPresetSelect) {
                asciiPresetSelect.value = 'custom';
            }
        }
    }

    _updateControlVisibility() {
        const effect = this.settings.effect;
        const controls = this.uiContainer.querySelector('.controls');

        const pixelSizeControl = controls.querySelector('[data-setting="pixelSize"]').parentElement;
        const bitmapThresholdControl = controls.querySelector('[data-setting="bitmapThreshold"]').parentElement;
        const asciiCharsControl = controls.querySelector('[data-setting="asciiChars"]').parentElement;
        const halftoneShapeControl = controls.querySelector('[data-setting="halftoneShape"]').parentElement;
        const anaglyphShiftControl = controls.querySelector('[data-setting="anaglyphShift"]').parentElement;
        const asciiPresetControl = controls.querySelector('[data-setting="asciiPreset"]').parentElement;
        const glitchSliceControl = controls.querySelector('[data-setting="glitchSliceCount"]').parentElement;
        const voxelDepthControl = controls.querySelector('[data-setting="voxelDepth"]').parentElement;
        const glitchColorShiftControl = controls.querySelector('[data-setting="glitchColorShift"]').parentElement;

        // Hide all first
        pixelSizeControl.style.display = 'none';
        bitmapThresholdControl.style.display = 'none';
        asciiCharsControl.style.display = 'none';
        halftoneShapeControl.style.display = 'none';
        anaglyphShiftControl.style.display = 'none';
        asciiPresetControl.style.display = 'none';
        glitchSliceControl.style.display = 'none';
        voxelDepthControl.style.display = 'none';
        glitchColorShiftControl.style.display = 'none';

        // Show relevant ones
        if (effect === 'pixelate' || effect === 'halftone' || effect === 'ascii' || effect === 'voxelize') {
            pixelSizeControl.style.display = '';
        }

        if (effect === 'anaglyph') {
            anaglyphShiftControl.style.display = '';
        }

        if (effect === 'bitmap') {
            bitmapThresholdControl.style.display = '';
        }

        if (effect === 'ascii') {
            asciiCharsControl.style.display = '';
            asciiPresetControl.style.display = '';
        }
        if (effect === 'halftone') {
            halftoneShapeControl.style.display = '';
        }

        if (effect === 'glitch') {
            glitchSliceControl.style.display = '';
            glitchColorShiftControl.style.display = '';
        }

        if (effect === 'voxelize') {
            voxelDepthControl.style.display = '';
        }
    }

    _loadImage(file) {
        if (!file) return;
        this.sourceImageName = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.sourceImage = new Image();
            this.sourceImage.onload = () => {
                this.sourceCanvas.width = this.sourceImage.width;
                this.sourceCanvas.height = this.sourceImage.height;
                this.sourceCtx.drawImage(this.sourceImage, 0, 0);
                this.draw();
            };
            this.sourceImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    draw() {
        if (!this.sourceImage) {
            this.canvas.width = 500;
            this.canvas.height = 300;
            this.context.fillStyle = '#333';
            this.context.fillRect(0, 0, 500, 300);
            this.context.fillStyle = 'white';
            this.context.textAlign = 'center';
            this.context.font = '20px sans-serif';
            this.context.fillText('Please upload an image to begin', 250, 150);
            return;
        }

        const preset = this.previewPreset;
        let targetWidth, targetHeight;

        if (preset.width === 1 && preset.height === 1) { // 'Original Size'
            targetWidth = this.sourceImage.width;
            targetHeight = this.sourceImage.height;
        } else {
            targetWidth = preset.width;
            targetHeight = preset.height;
        }

        const aspectRatio = targetWidth / targetHeight;
        let previewWidth = Math.min(window.innerWidth * 0.9, targetWidth);
        let previewHeight = previewWidth / aspectRatio;

        if (previewHeight > window.innerHeight * 0.8) {
            previewHeight = window.innerHeight * 0.8;
            previewWidth = previewHeight * aspectRatio;
        }

        this.canvas.width = previewWidth;
        this.canvas.height = previewHeight;

        const scale = previewWidth / targetWidth;
        this.context.save();
        this.context.scale(scale, scale);
        this.renderArtwork(this.context, targetWidth, targetHeight, this.settings);
        this.context.restore();
    }

    renderArtwork(ctx, width, height, settings, time = 0) {
        if (!this.sourceImage) return;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // Draw source image scaled to fit the target dimensions
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;

        // --- Aspect Ratio Correction ---
        // Calculate the correct "fit inside" dimensions to preserve aspect ratio
        const imgAspect = this.sourceImage.width / this.sourceImage.height;
        const canvasAspect = width / height;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > canvasAspect) { // Image is wider than canvas, fit to width
            drawWidth = width;
            drawHeight = width / imgAspect;
            drawX = 0;
            drawY = (height - drawHeight) / 2;
        } else { // Image is taller or same aspect, fit to height
            drawHeight = height;
            drawWidth = height * imgAspect;
            drawY = 0;
            drawX = (width - drawWidth) / 2;
        }
        // Draw the image correctly scaled and centered
        tempCtx.drawImage(this.sourceImage, drawX, drawY, drawWidth, drawHeight);
        const imageData = tempCtx.getImageData(0, 0, width, height);

        // Apply basic adjustments first
        this._applyBrightnessContrast(imageData.data, settings.brightness, settings.contrast);

        switch (settings.effect) {
            case 'pixelate':
                this._renderPixelate(ctx, width, height, imageData, settings);
                break;
            case 'bitmap':
                this._renderBitmap(ctx, width, height, imageData, settings);
                break;
            case 'halftone':
                this._renderHalftone(ctx, width, height, imageData, settings);
                break;
            case 'ascii':
                this._renderAscii(ctx, width, height, imageData, settings);
                break;
            case 'anaglyph':
                this._renderAnaglyph(ctx, width, height, imageData, settings);
                break;
            case 'glitch':
                this._renderGlitch(ctx, width, height, imageData, settings);
                break;
            case 'voxelize':
                this._renderVoxelize(ctx, width, height, imageData, settings);
                break;
        }
    }

    _getDownloadFilename(presetName) {
        const originalFilename = this.sourceImageName?.split('.').slice(0, -1).join('.') || 'artwork';
        const effect = this.settings.effect;
        return `${originalFilename}-${effect}.png`;
    }

    _getAverage(imageData, x, y, w, h) {
        const data = imageData.data;
        const width = imageData.width;
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = x; i < x + w; i++) {
            for (let j = y; j < y + h; j++) {
                if (i >= 0 && i < width && j >= 0 && j < imageData.height) {
                    const index = (j * width + i) * 4;
                    r += data[index];
                    g += data[index + 1];
                    b += data[index + 2];
                    count++;
                }
            }
        }
        if (count === 0) return { r: 0, g: 0, b: 0, brightness: 0 };
        return {
            r: r / count,
            g: g / count,
            b: b / count,
            brightness: (r / count + g / count + b / count) / 3
        };
    }

    _applyBrightnessContrast(data, brightness, contrast) {
        brightness = (brightness / 100) * 255;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
            // Apply brightness
            let r = data[i] + brightness;
            let g = data[i + 1] + brightness;
            let b = data[i + 2] + brightness;

            // Apply contrast
            r = factor * (r - 128) + 128;
            g = factor * (g - 128) + 128;
            b = factor * (b - 128) + 128;

            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }
    }

    _renderPixelate(ctx, width, height, imageData, settings) {
        const size = settings.pixelSize;
        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                const avg = this._getAverage(imageData, x, y, size, size);
                ctx.fillStyle = `rgb(${avg.r}, ${avg.g}, ${avg.b})`;
                ctx.fillRect(x, y, size, size);
            }
        }
    }

    _renderVoxelize(ctx, width, height, imageData, settings) {
        const size = settings.pixelSize;
        const depth = settings.voxelDepth;

        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                const avg = this._getAverage(imageData, x, y, size, size);
                const r = avg.r;
                const g = avg.g;
                const b = avg.b;

                // Draw shaded sides first
                ctx.fillStyle = `rgb(${r * 0.8}, ${g * 0.8}, ${b * 0.8})`;
                ctx.fillRect(x, y, size, size);
                // Draw main face
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x - depth, y - depth, size, size);
            }
        }
    }

    _renderBitmap(ctx, width, height, imageData, settings) {
        // Floyd-Steinberg Dithering for higher quality bitmap
        const d = imageData.data;
        const threshold = settings.bitmapThreshold;

        // Create a grayscale copy of the data to work on
        const gs = new Uint8ClampedArray(width * height);
        for (let i = 0; i < d.length; i += 4) {
            gs[i / 4] = (d[i] * 0.299) + (d[i + 1] * 0.587) + (d[i + 2] * 0.114);
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = y * width + x;
                const oldPixel = gs[i];
                const newPixel = oldPixel < threshold ? 0 : 255;
                const quantError = oldPixel - newPixel;

                gs[i] = newPixel;

                // Propagate error to neighbors
                if (x + 1 < width) gs[i + 1] += quantError * 7 / 16;
                if (x - 1 >= 0 && y + 1 < height) gs[i - 1 + width] += quantError * 3 / 16;
                if (y + 1 < height) gs[i + width] += quantError * 5 / 16;
                if (x + 1 < width && y + 1 < height) gs[i + 1 + width] += quantError * 1 / 16;
            }
        }

        // Write the dithered data back to the image, respecting aspect ratio
        const outImageData = ctx.createImageData(width, height);
        const outData = outImageData.data;
        for (let i = 0; i < gs.length; i++) {
            const val = gs[i];
            outData[i * 4] = val;
            outData[i * 4 + 1] = val;
            outData[i * 4 + 2] = val;
            outData[i * 4 + 3] = 255;
        }

        ctx.putImageData(outImageData, 0, 0);
    }

    _renderHalftone(ctx, width, height, imageData, settings) {
        const size = settings.pixelSize;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#000';

        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                const avg = this._getAverage(imageData, x, y, size, size);
                const radius = (1 - avg.brightness / 255) * (size / 2) * 1.2;
                if (radius > 0) {
                    if (settings.halftoneShape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
                        ctx.fill();
                    } else { // square
                        ctx.fillRect(x + size/2 - radius, y + size/2 - radius, radius * 2, radius * 2);
                    }
                }
            }
        }
    }

    _renderAscii(ctx, width, height, imageData, settings) {
        const size = settings.pixelSize;
        const chars = settings.asciiChars;
        if (!chars) return; // Don't render if chars are empty
        ctx.font = `${size * 1.2}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                const avg = this._getAverage(imageData, x, y, size, size);
                const charIndex = Math.round(avg.brightness / 255 * (chars.length - 1));
                const char = chars[charIndex];
                ctx.fillStyle = `rgb(${avg.r}, ${avg.g}, ${avg.b})`;
                ctx.fillText(char, x + size / 2, y + size / 2);
            }
        }
    }

    _renderAnaglyph(ctx, width, height, imageData, settings) {
        const shift = settings.anaglyphShift;
        const srcData = imageData.data;
        const outImageData = ctx.createImageData(width, height);
        const outData = outImageData.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;

                // Get Red from the left-shifted pixel
                const redX = Math.max(0, x - shift);
                const redIndex = (y * width + redX) * 4;
                const r = srcData[redIndex];

                // Get Green and Blue from the original pixel
                const g = srcData[i + 1];
                const b = srcData[i + 2];

                outData[i] = r; outData[i+1] = g; outData[i+2] = b; outData[i+3] = 255;
            }
        }
        ctx.putImageData(outImageData, 0, 0);
    }

    _renderGlitch(ctx, width, height, imageData, settings) {
        const { glitchSliceCount, glitchColorShift } = settings;

        // 1. Block Shifting
        // We draw the original image data to the context first
        ctx.putImageData(imageData, 0, 0);

        // Then we take slices and redraw them shifted
        for (let i = 0; i < glitchSliceCount; i++) {
            const y = Math.random() * height;
            const h = Math.random() * (height / 10);
            const sliceData = ctx.getImageData(0, y, width, h);
            const shift = (Math.random() - 0.5) * (glitchSliceCount / 2);
            ctx.putImageData(sliceData, shift, y);
        }

        // 2. Color Channel Shifting
        // Get the data *after* the block shifts
        const shiftedImageData = ctx.getImageData(0, 0, width, height);
        const shiftedData = shiftedImageData.data;
        const outImageData = ctx.createImageData(width, height);
        const outData = outImageData.data;

        for (let i = 0; i < shiftedData.length; i += 4) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);

            const redX = Math.max(0, x - glitchColorShift);
            const redIndex = (y * width + redX) * 4;

            const blueX = Math.min(width - 1, x + glitchColorShift);
            const blueIndex = (y * width + blueX) * 4;

            outData[i] = shiftedData[redIndex];         // Red channel from left
            outData[i + 1] = shiftedData[i + 1];       // Green channel from center
            outData[i + 2] = shiftedData[blueIndex + 2]; // Blue channel from right
            outData[i + 3] = shiftedData[i + 3];       // Alpha
        }
        ctx.putImageData(outImageData, 0, 0);

        // 3. Scanlines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let y = 0; y < height; y += 4) {
            ctx.fillRect(0, y, width, 2);
        }
    }

    destroy() {
        super.destroy();
    }
}