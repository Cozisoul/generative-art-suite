// base-generator.js
export default class BaseGenerator {
  constructor(canvasContainer, uiContainer) {
    if (this.constructor === BaseGenerator) {
        throw new TypeError('Abstract class "BaseGenerator" cannot be instantiated directly.');
    }
    this.canvasContainer = canvasContainer;
    this.uiContainer = uiContainer;
    this.is3D = false; // Default to false, 3D generators will set this to true
    this.presetSelectElement = null; // To store the reference to the preset select element
  }

    _createfieldset(legendText) {
        const controlGroup = document.createElement('div');
        controlGroup.classList.add('control-group');

        const header = document.createElement('div');
        header.classList.add('control-group-header');
        header.innerText = legendText;
        controlGroup.appendChild(header);

        const content = document.createElement('div');
        content.classList.add('control-group-content');
        controlGroup.appendChild(content);

        // Toggle functionality
        header.addEventListener('click', () => {
            content.classList.toggle('active');
            header.classList.toggle('active');
        });

        // By default, the first control group is open
        if (!this.uiContainer.querySelector('.control-group.active')) {
            content.classList.add('active');
            header.classList.add('active');
        }

        // Return the content div to append controls to it
        return controlGroup;
    }

    _createSlider(settingKey, labelText, { min, max, unit = '', step = 1 }) {
        const container = document.createElement('div');
        const label = document.createElement('label');
        label.innerHTML = `${labelText}: <span>${this.settings[settingKey]}</span>${unit}`;
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = this.settings[settingKey];
        slider.dataset.setting = settingKey;

        slider.addEventListener('input', (e) => {
            const isFloat = slider.step && slider.step.toString().includes('.');
            const value = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
            this.settings[settingKey] = value;
            label.querySelector('span').innerText = value;
            
            if (this.onSettingChange) {
                this.onSettingChange(settingKey, value);
            }
            this.draw();
        });

        container.appendChild(label);
        container.appendChild(slider);
        return container;
    }

    _createSelect(settingKey, labelText, options) {
        const container = document.createElement('div');
        const label = document.createElement('label');
        label.innerText = labelText;
        const select = document.createElement('select');

        options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.innerText = optionValue.charAt(0).toUpperCase() + optionValue.slice(1);
            if (this.settings[settingKey] === optionValue) {
                option.selected = true;
            }
            select.dataset.setting = settingKey;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            const value = e.target.value;
            this.settings[settingKey] = value;
            if (this.onSettingChange) {
                this.onSettingChange(settingKey, value);
            }
            this.draw();
        });

        container.appendChild(label);
        container.appendChild(select);
        return container;
    }

    _createCheckbox(settingKey, labelText) {
        const container = document.createElement('div');
        container.classList.add('checkbox-container');
        const label = document.createElement('label');
        label.innerText = labelText;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = this.settings[settingKey];
        checkbox.dataset.setting = settingKey;

        checkbox.addEventListener('change', (e) => {
            const value = e.target.checked;
            this.settings[settingKey] = value;
            if (this.onSettingChange) {
                this.onSettingChange(settingKey, value);
            }
            this.draw();
        });
        container.appendChild(label);
        container.appendChild(checkbox);
        return container;
    }

    _createTextInput(settingKey, labelText) {
        const container = document.createElement('div');
        const label = document.createElement('label');
        label.innerText = labelText;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = this.settings[settingKey];
        input.dataset.setting = settingKey;

        const eventType = settingKey === 'textContent' ? 'change' : 'input';

        input.addEventListener(eventType, (e) => {
            const value = e.target.value;
            this.settings[settingKey] = value;
            if (this.onSettingChange) {
                this.onSettingChange(settingKey, value);
            }
            this.draw();
        });

        container.appendChild(label);
        container.appendChild(input);
        return container;
    }

    _createNumberInput(settingKey, labelText, min, max, step) {
        const container = document.createElement('div');
        const label = document.createElement('label');
        label.innerText = labelText;
        const input = document.createElement('input');
        input.type = 'number';
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = this.settings[settingKey];
        input.dataset.setting = settingKey;

        input.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.settings[settingKey] = value;
            if (this.onSettingChange) {
                this.onSettingChange(settingKey, value);
            }
            this.draw();
        });

        container.appendChild(label);
        container.appendChild(input);
        return container;
    }

    _createColorInput(settingKey, labelText) {
        const container = document.createElement('div');
        const label = document.createElement('label');
        label.innerText = labelText;
        const input = document.createElement('input');
        input.type = 'color';
        input.value = this.settings[settingKey];
        input.dataset.setting = settingKey;

        input.addEventListener('input', (e) => {
            const value = e.target.value;
            this.settings[settingKey] = value;
            if (this.onSettingChange) {
                this.onSettingChange(settingKey, value);
            }
            this.draw();
        });

        container.appendChild(label);
        container.appendChild(input);
        return container;
    }

    _randomizeSliders(selector = 'input[type=range]') {
        const sliders = this.uiContainer.querySelectorAll(selector);
        sliders.forEach(slider => {
            if (slider.offsetParent === null) return; // Skip hidden sliders
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            const step = parseFloat(slider.step) || 1;
            const range = (max - min) / step;
            const randomValue = Math.floor(Math.random() * (range + 1)) * step + min;
            slider.value = randomValue.toFixed(step.toString().includes('.') ? 2 : 0);
            slider.dispatchEvent(new Event('input'));
        });
    }

    _randomizeSelects(selector = 'select:not(.download-preset-select)') {
        const selects = this.uiContainer.querySelectorAll(selector);
        selects.forEach(select => {
            if (select.offsetParent === null) return; // Skip hidden selects
            const options = select.querySelectorAll('option');
            if (options.length > 0) {
                select.selectedIndex = Math.floor(Math.random() * options.length);
                select.dispatchEvent(new Event('change'));
            }
        });
    }

    _randomizeCheckboxes(selector = 'input[type=checkbox]') {
        const checkboxes = this.uiContainer.querySelectorAll(selector);
        checkboxes.forEach(checkbox => {
            if (checkbox.offsetParent === null) return; // Skip hidden checkboxes
            checkbox.checked = Math.random() > 0.5;
            checkbox.dispatchEvent(new Event('change'));
        });
    }

    _randomizeColors(selector = 'input[type=color]') {
        const colorInputs = this.uiContainer.querySelectorAll(selector);
        colorInputs.forEach(input => {
            if (input.offsetParent === null) return; // Skip hidden color inputs
            input.value = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            input.dispatchEvent(new Event('input'));
        });
    }

    /**
     * Randomizes all common control types. Subclasses can override for more specific behavior.
     */
    _randomizeSettings() {
        this._randomizeSliders();
        this._randomizeSelects();
        this._randomizeCheckboxes();
        this._randomizeColors();
    }

    _createPreviewModal() {
        this.previewModal = document.createElement('div');
        this.previewModal.className = 'preview-modal';

        const content = document.createElement('div');
        content.className = 'preview-content';

        this.previewLoader = document.createElement('div');
        this.previewLoader.className = 'loader';
        this.previewLoader.innerText = 'Rendering...';

        this.previewImage = document.createElement('img');
        this.previewImage.className = 'preview-image';

        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;

        content.appendChild(this.previewLoader);
        content.appendChild(this.previewImage);
        content.appendChild(closeButton);
        this.previewModal.appendChild(content);
        document.body.appendChild(this.previewModal);

        const hide = () => {
            this.previewModal.style.display = 'none';
            this.previewImage.src = ''; // Clear image to save memory
        };

        closeButton.addEventListener('click', hide);
        this.previewModal.addEventListener('click', (e) => {
            if (e.target === this.previewModal) {
                hide();
            }
        });
    }

        _showPreview() {
        if (!this._ensurePresetSelect()) return; const presetName = this.presetSelectElement.value;
        if (!presetName) return;

        const preset = this._findPreset(presetName);
        this.previewModal.style.display = 'flex';
        this.previewLoader.style.display = 'block';
        this.previewImage.style.display = 'none';

        // Allow UI to update before heavy render task
        requestAnimationFrame(() => {
            setTimeout(() => { // Use timeout to ensure it's on a new frame
                if (this.is3D) {
                    // For 3D, we render to the main canvas and then capture it
                    this.draw(); // Ensure the latest frame is rendered
                    this.previewImage.onload = () => {
                        this.previewLoader.style.display = 'none';
                        this.previewImage.style.display = 'block';
                    };
                    // Find the canvas element within canvasContainer
                    const canvasElement = this.canvasContainer.querySelector('canvas');
                    if (canvasElement) {
                        this.previewImage.src = canvasElement.toDataURL('image/png');
                    } else {
                        console.error('Canvas element not found in canvasContainer for 3D preview.');
                        this.previewLoader.innerText = 'Error: Canvas not found.';
                    }
                } else {
                    const offscreenCanvas = document.createElement('canvas');
                    if (!preset) { this.previewLoader.innerText = 'Error: Preset not found.'; return; }
                    offscreenCanvas.width = preset.width;
                    offscreenCanvas.height = preset.height;
                    const offscreenContext = offscreenCanvas.getContext('2d');

                    this.renderArtwork(offscreenContext, preset.width, preset.height, this.settings, 0);

                    this.previewImage.onload = () => {
                        this.previewLoader.style.display = 'none';
                        this.previewImage.style.display = 'block';
                    };
                    this.previewImage.src = offscreenCanvas.toDataURL('image/png');
                }
            }, 10);
        });
    }

    

    _findPreset(presetName) {
        // Default implementation for flat preset objects.
        return this.presets[presetName];
    }

    _getDownloadFilename(presetName) {
        // Default implementation. Subclasses can override for more specific filenames.
        // Replace spaces and special characters with underscores
        const sanitized = presetName.replace(/[\s\/\*\?\:\|\<\>]/g, '_');
        return `artwork-${sanitized}.png`;
    }

    /**
     * Ensures the canvas is fully rendered with all layers before download operations.
     * This method should be called before any download to guarantee complete rendering.
     */
    _ensureCanvasRendered() {
        // Force a complete redraw of the main canvas
        this.draw();
        
        // If there's an animation loop running, ensure it completes one cycle
        if (this.animationId) {
            // Cancel current animation and do one final render
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Force one more render to ensure everything is up to date
        this.draw();
    }

    /**
     * Public method for handling setting changes.
     * This method should be called by UI controls when settings change.
     */
    onSettingChange(key, value) {
        try {
            if (this._handleSettingChange) {
                this._handleSettingChange(key, value);
            }
            // Update the setting
            this.settings[key] = value;
            // Redraw the canvas
            this.draw();
        } catch (error) {
            console.error('Error handling setting change:', error);
        }
    }

    /**
     * Draw method - should be overridden in subclasses.
     * This provides a base implementation with error handling.
     */
    draw() {
        try {
            // Override this method in subclasses to implement drawing logic
            console.warn('BaseGenerator.draw() called - should be overridden in subclass');
        } catch (error) {
            console.error('Error in draw method:', error);
        }
    }

    /**
     * Render artwork method - should be overridden in subclasses.
     * This is used for high-resolution downloads and animations.
     */
    renderArtwork(ctx, width, height, settings, time = 0) {
        try {
            // Override this method in subclasses to implement rendering logic
            console.warn('BaseGenerator.renderArtwork() called - should be overridden in subclass');
            
            // Basic fallback: draw a simple rectangle
            ctx.fillStyle = settings.backgroundColor || '#ffffff';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#000000';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Override renderArtwork()', width / 2, height / 2);
        } catch (error) {
            console.error('Error in renderArtwork method:', error);
        }
    }

    /**
     * Renders the artwork to a high-resolution offscreen canvas and triggers a download.
     * This is ideal for generating print-quality files with all layers properly captured.
     */
    downloadArtwork(preset, presetName) {
        if (!preset || !preset.width || !preset.height) {
            console.error('Invalid preset provided for high-resolution download.', preset);
            alert('Invalid preset selected for download.');
            return;
        }

        // Ensure the main canvas is fully rendered with all layers
        this._ensureCanvasRendered();

        // Create high-resolution offscreen canvas
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = preset.width;
        offscreenCanvas.height = preset.height;
        const offscreenContext = offscreenCanvas.getContext('2d', { 
            willReadFrequently: true,
            alpha: true 
        });

        // Set up high-quality rendering
        offscreenContext.imageSmoothingEnabled = true;
        offscreenContext.imageSmoothingQuality = 'high';

        // Clear canvas with background color
        offscreenContext.fillStyle = this.settings.backgroundColor || '#ffffff';
        offscreenContext.fillRect(0, 0, preset.width, preset.height);

        // Render the artwork with all layers
        try {
            this.renderArtwork(offscreenContext, preset.width, preset.height, this.settings, 0);
        } catch (error) {
            console.error('Error rendering artwork for download:', error);
            alert('Error rendering artwork for download. Please try again.');
            return;
        }

        // Create download link with high quality
        const link = document.createElement('a');
        link.download = this._getDownloadFilename(presetName);
        link.href = offscreenCanvas.toDataURL('image/png', 1.0); // Maximum quality
        link.click();
    }

    /**
     * Captures the current state of the visible canvas and triggers a download.
     * This provides a "what you see is what you get" (WYSIWYG) export with all layers.
     */
    downloadVisibleCanvas(presetName) {
        // Ensure the latest frame is rendered with all layers
        this._ensureCanvasRendered();

        let canvasElement;
        if (this.is3D) {
            canvasElement = this.canvasContainer.querySelector('canvas');
        } else {
            canvasElement = this.canvas;
        }

        if (!canvasElement) {
            console.error('Visible canvas element not found for download.');
            alert('Could not find the canvas to download.');
            return;
        }

        // Verify canvas has content
        if (canvasElement.width === 0 || canvasElement.height === 0) {
            console.error('Canvas has zero dimensions.');
            alert('Canvas is not properly initialized. Please try again.');
            return;
        }

        // Create a temporary canvas to ensure we capture everything
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasElement.width;
        tempCanvas.height = canvasElement.height;
        const tempContext = tempCanvas.getContext('2d', { 
            willReadFrequently: true,
            alpha: true 
        });

        // Set up high-quality rendering
        tempContext.imageSmoothingEnabled = true;
        tempContext.imageSmoothingQuality = 'high';

        // Copy the entire canvas content
        tempContext.drawImage(canvasElement, 0, 0);

        // Create download link with high quality
        const link = document.createElement('a');
        link.download = this._getDownloadFilename(presetName || 'canvas-capture');
        link.href = tempCanvas.toDataURL('image/png', 1.0); // Maximum quality
        link.click();
    }

    async downloadAnimation(preset, presetName, options = {}) {
        const { duration = 3000, frameRate = 30 } = options;
    
        if (!preset || !preset.width || !preset.height) {
            console.error('Invalid preset provided for animation download.', preset);
            alert('Invalid preset selected for animation download.');
            return;
        }

        // Create a high-quality canvas for video capture
        const videoCanvas = document.createElement('canvas');
        videoCanvas.width = preset.width;
        videoCanvas.height = preset.height;
        videoCanvas.style.position = 'fixed';
        videoCanvas.style.top = '-9999px';
        videoCanvas.style.left = '-9999px';
        videoCanvas.style.zIndex = '-1';
        document.body.appendChild(videoCanvas);
        
        const videoContext = videoCanvas.getContext('2d', { 
            willReadFrequently: true,
            alpha: true 
        });

        // Set up high-quality rendering
        videoContext.imageSmoothingEnabled = true;
        videoContext.imageSmoothingQuality = 'high';

        // Show a "Recording..." message
        const originalButtonText = {};
        const downloadButtons = this.uiContainer.querySelectorAll('.animation-download-button');
        downloadButtons.forEach(btn => {
            originalButtonText[btn.dataset.format] = btn.innerText;
            btn.innerText = 'Recording...';
            btn.disabled = true;
        });
    
        try {
            const stream = videoCanvas.captureStream(frameRate);
            const recorder = new MediaRecorder(stream, { 
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000 // High quality
            });
            const chunks = [];
        
            recorder.ondataavailable = e => e.data.size > 0 && chunks.push(e.data);
        
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `${this._getDownloadFilename(presetName)}.webm`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
        
                // Clean up
                document.body.removeChild(videoCanvas);
        
                // Restore button text
                downloadButtons.forEach(btn => {
                    btn.innerText = originalButtonText[btn.dataset.format];
                    btn.disabled = false;
                });
            };
        
            recorder.start();
        
            let animFrameId, lastFrameTime = -1;
            const startTime = performance.now();
            const recordLoop = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                if (elapsedTime >= duration) {
                    recorder.stop();
                    cancelAnimationFrame(animFrameId);
                    return;
                }
                // Only render if enough time has passed for the next frame
                if (lastFrameTime === -1 || (currentTime - lastFrameTime) >= (1000 / frameRate)) {
                    // Clear the canvas for the new frame with background color
                    videoContext.fillStyle = this.settings.backgroundColor || '#ffffff';
                    videoContext.fillRect(0, 0, preset.width, preset.height);
                    
                    // Render the artwork for the current time with all layers
                    try {
                        this.renderArtwork(videoContext, preset.width, preset.height, this.settings, elapsedTime);
                    } catch (error) {
                        console.error('Error rendering frame for video:', error);
                    }
                    lastFrameTime = currentTime;
                }
                animFrameId = requestAnimationFrame(recordLoop);
            };
            animFrameId = requestAnimationFrame(recordLoop);
        } catch (error) {
            console.error('Error creating video:', error);
            if (document.body.contains(videoCanvas)) {
                document.body.removeChild(videoCanvas);
            }
            downloadButtons.forEach(btn => {
                btn.innerText = originalButtonText[btn.dataset.format];
                btn.disabled = false;
            });
        }
    }

    _createPresetSelect({ settingKey = 'pageSize', labelText = 'Page Size' } = {}) {
        const container = document.createElement('div');
        const label = document.createElement('label');
        label.innerText = labelText;
        const select = document.createElement('select');
        select.className = 'download-preset-select';
        select.dataset.setting = settingKey;
        this.presetSelectElement = select; // Store reference to the select element

        Object.keys(this.presets).forEach(presetName => {
            const option = document.createElement('option');
            option.value = presetName;
            option.innerText = presetName;
            if (this.settings[settingKey] === presetName) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener('input', (e) => {
            const selectedPresetName = e.target.value;
            this.settings[settingKey] = selectedPresetName;
            this.previewPreset = this._findPreset(selectedPresetName);
            if (this.onSettingChange) {
                this.onSettingChange(settingKey, selectedPresetName);
            }
            this.draw();
        });

        container.appendChild(label);
        container.appendChild(select);
        return container;
    }
  destroy() {
    if (this.boundDraw) {
        window.removeEventListener('resize', this.boundDraw);
    }
    if (this.canvas) {
        this.canvas.remove();
    }
    const controls = this.uiContainer.querySelector('.controls');
    if (controls) {
        controls.remove();
    }
    if (this.previewModal) {
        this.previewModal.remove();
    }
  }

  _ensurePresetSelect() {
    if (!this.presetSelectElement) {
        // If no preset select was created by the subclass, create a default one.
        // This prevents errors and allows download functionality to work out-of-the-box.
        const defaultPresetSelectContainer = this._createPresetSelect();
        this.presetSelectElement = defaultPresetSelectContainer.querySelector('select');
        if (!this.presetSelectElement) {
            console.error('Failed to create a default preset select element.');
            return false;
        }
        // Append the preset select to the download controls
        const downloadContainer = this.uiContainer.querySelector('.control-group');
        if (downloadContainer) {
            downloadContainer.appendChild(defaultPresetSelectContainer);
        }
    }
    return true;
  }

  /**
   * Handles canvas resizing. For 2D generators, this typically involves redrawing.
   * 3D generators should override this to update camera and renderer.
   */
  resizeCanvas() {
    this.draw();
  }

  appendDownloadControls(container) {
    const downloadContainer = this._createfieldset('Download');

    const wysiwygButton = document.createElement('button');
    wysiwygButton.innerText = 'Download Canvas';
    wysiwygButton.title = 'Download what you see on the screen.';
    wysiwygButton.classList.add('action-button');
    wysiwygButton.addEventListener('click', () => {
        this.downloadVisibleCanvas('canvas-capture');
    });
    downloadContainer.appendChild(wysiwygButton);

    const hiresButton = document.createElement('button');
    hiresButton.innerText = 'Download Hi-Res';
    hiresButton.title = 'Download a high-resolution version based on the selected page size.';
    hiresButton.classList.add('action-button');
    hiresButton.addEventListener('click', () => {
        if (!this._ensurePresetSelect()) return;
        const selectedPresetName = this.presetSelectElement.value;
        const preset = this._findPreset(selectedPresetName);
        if (preset) {
            // Use the original high-resolution download method
            this.downloadArtwork(preset, selectedPresetName);
        } else {
            console.error(`Preset "${selectedPresetName}" not found.`);
        }
    });

    downloadContainer.appendChild(hiresButton);

    // Add animation duration control
    const animationDurationControl = this._createSlider('animationDuration', 'Animation Duration', { min: 1000, max: 10000, unit: 'ms', step: 500 });
    downloadContainer.appendChild(animationDurationControl);

    // Add animation download if applicable
    if (this.isAnimatable) {
        const videoButton = document.createElement('button');
        videoButton.innerText = 'Download Video';
        videoButton.classList.add('action-button', 'animation-download-button');
        videoButton.dataset.format = 'webm';
        videoButton.addEventListener('click', () => {
            if (!this._ensurePresetSelect()) return;
            const selectedPresetName = this.presetSelectElement.value;
            const preset = this._findPreset(selectedPresetName);
            if (preset) {
                this.downloadAnimation(preset, selectedPresetName, { duration: this.settings.animationDuration, frameRate: 30 });
            }
        });
        downloadContainer.appendChild(videoButton);

        const gifButton = document.createElement('button');
        gifButton.innerText = 'Download GIF';
        gifButton.classList.add('action-button', 'animation-download-button');
        gifButton.dataset.format = 'gif';
        gifButton.addEventListener('click', () => {
            if (!this._ensurePresetSelect()) return;
            const selectedPresetName = this.presetSelectElement.value;
            const preset = this._findPreset(selectedPresetName);
            if (preset) {
                this.downloadGif(preset, selectedPresetName, { duration: this.settings.animationDuration, frameRate: 10 }); // GIF frame rate often lower
            }
        });
        downloadContainer.appendChild(gifButton);
    }

    container.appendChild(downloadContainer);
  }

  async downloadGif(preset, presetName, options = {}) {
    const { duration = 3000, frameRate = 10 } = options;
    const numFrames = (duration / 1000) * frameRate;
    const frameDelay = 1000 / frameRate;

    if (!preset || !preset.width || !preset.height) {
        console.error('Invalid preset provided for GIF download.', preset);
        alert('Invalid preset selected for GIF download.');
        return;
    }

    // Check if GIF library is available
    if (typeof GIF === 'undefined') {
        console.error('GIF.js library not found. Please include it in your HTML.');
        alert('GIF.js library not found. Cannot generate GIF. Please check console for details.');
        return;
    }

    // Create high-quality offscreen canvas for GIF generation
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = preset.width;
    offscreenCanvas.height = preset.height;
    const offscreenContext = offscreenCanvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: true 
    });

    // Set up high-quality rendering
    offscreenContext.imageSmoothingEnabled = true;
    offscreenContext.imageSmoothingQuality = 'high';

    // Show a "Recording..." message and disable buttons
    const originalButtonText = {};
    const downloadButtons = this.uiContainer.querySelectorAll('.animation-download-button');
    downloadButtons.forEach(btn => {
        originalButtonText[btn.dataset.format] = btn.innerText;
        btn.innerText = 'Recording GIF...';
        btn.disabled = true;
    });
    
    const restoreButtons = () => {
        downloadButtons.forEach(btn => {
            btn.innerText = originalButtonText[btn.dataset.format];
            btn.disabled = false;
        });
    };

    try {
        // Create GIF with high quality settings
        const gif = new GIF({
            workers: 2,
            quality: 20, // Higher quality (1-20, where 20 is best)
            width: preset.width,
            height: preset.height,
            workerScript: 'assets/gif.worker.js',
            dither: 'FloydSteinberg', // Better dithering
            transparent: null, // No transparency for better compatibility
            background: this.settings.backgroundColor || '#ffffff'
        });

        // Generate frames with all layers
        for (let i = 0; i < numFrames; i++) {
            const time = i * frameDelay; // Time in milliseconds
            
            // Clear the offscreen canvas with background color
            offscreenContext.fillStyle = this.settings.backgroundColor || '#ffffff';
            offscreenContext.fillRect(0, 0, preset.width, preset.height);
            
            // Render the artwork with all layers for this frame
            try {
                this.renderArtwork(offscreenContext, preset.width, preset.height, this.settings, time);
            } catch (error) {
                console.error(`Error rendering frame ${i} for GIF:`, error);
                // Continue with next frame
            }

            // Add frame to GIF
            gif.addFrame(offscreenCanvas, { 
                delay: frameDelay, 
                copy: true 
            });

            // Update progress
            const progress = (i + 1) / numFrames;
            downloadButtons.forEach(btn => {
                if (btn.dataset.format === 'gif') {
                    const percentage = Math.round(progress * 100);
                    btn.innerText = `Rendering... ${percentage}%`;
                }
            });
        }

        // Set up event handlers
        gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${this._getDownloadFilename(presetName)}.gif`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            restoreButtons();
        });

        gif.on('progress', (p) => {
            downloadButtons.forEach(btn => {
                if (btn.dataset.format === 'gif') {
                    const percentage = Math.round(p * 100);
                    btn.innerText = `Processing... ${percentage}%`;
                }
            });
        });

        gif.on('abort', () => {
            console.error('GIF rendering was aborted.');
            restoreButtons();
        });

        // Start rendering
        gif.render();
    } catch (error) {
        console.error('An error occurred during GIF generation:', error);
        restoreButtons();
    }
  }
}