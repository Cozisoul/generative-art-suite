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
        const presetName = this.presetSelectElement.value;
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

        downloadArtwork(preset, presetName) {
        if (this.is3D) {
            // For 3D, we capture directly from the main canvas
            this.draw(); // Ensure the latest frame is rendered
            const link = document.createElement('a');
            link.download = this._getDownloadFilename(presetName);
            const canvasElement = this.canvasContainer.querySelector('canvas');
            if (canvasElement) {
                link.href = canvasElement.toDataURL('image/png');
                link.click();
            } else {
                console.error('Canvas element not found in canvasContainer for 3D download.');
            }
        } else {
            // For 2D generators, ensure the main canvas is rendered first
            this.draw();
            
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = preset.width;
            offscreenCanvas.height = preset.height;
            const offscreenContext = offscreenCanvas.getContext('2d');

            // Render the artwork onto the offscreen canvas.
            this.renderArtwork(offscreenContext, preset.width, preset.height, this.settings, 0);

            const link = document.createElement('a');
            link.download = this._getDownloadFilename(presetName);
            link.href = offscreenCanvas.toDataURL('image/png');
            link.click();
        }
    }
    async downloadAnimation(preset, presetName, options = {}) {
        const { duration = 3000, frameRate = 30 } = options;
    
        // Create a visible canvas for video capture
        const videoCanvas = document.createElement('canvas');
        videoCanvas.width = preset.width;
        videoCanvas.height = preset.height;
        videoCanvas.style.position = 'fixed';
        videoCanvas.style.top = '-9999px';
        videoCanvas.style.left = '-9999px';
        document.body.appendChild(videoCanvas);
        
        const videoContext = videoCanvas.getContext('2d');
    
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
            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
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
        
            let animFrameId;
            const startTime = performance.now();
            const recordLoop = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                if (elapsedTime >= duration) {
                    recorder.stop();
                    cancelAnimationFrame(animFrameId);
                    return;
                }
                this.renderArtwork(videoContext, preset.width, preset.height, this.settings, elapsedTime);
                animFrameId = requestAnimationFrame(recordLoop);
            };
            animFrameId = requestAnimationFrame(recordLoop);
        } catch (error) {
            console.error('Error creating video:', error);
            document.body.removeChild(videoCanvas);
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

  appendDownloadControls(container) {
    const downloadContainer = this._createfieldset('Download');

    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'Download Image';
    downloadButton.classList.add('action-button');
    downloadButton.addEventListener('click', () => {
        // Ensure presetSelectElement exists before accessing its value
        if (!this.presetSelectElement) {
            // If no preset select was created by the subclass, create a default one
            // This might not be ideal for all cases, but prevents the TypeError
            // and allows basic download functionality.
            const defaultPresetSelect = this._createPresetSelect();
            // Append it somewhere, or just use its value for this operation
            // For now, we'll just ensure it's set to this.presetSelectElement
            // and assume the subclass will handle appending it if needed.
            // A more robust solution might involve making _createPresetSelect return the element
            // and then appending it to the downloadContainer if it's not already part of the UI.
            // For this fix, we'll just ensure the reference is set.
            this.presetSelectElement = defaultPresetSelect.querySelector('select');
            if (!this.presetSelectElement) { // Fallback if _createPresetSelect doesn't return a select
                console.error('Failed to create a default preset select element.');
                return;
            }
        }
        const selectedPresetName = this.presetSelectElement.value;
        const preset = this._findPreset(selectedPresetName);
        if (preset) {
            this.downloadArtwork(preset, selectedPresetName);
        } else {
            console.error(`Preset "${selectedPresetName}" not found.`);
        }
    });

    downloadContainer.appendChild(downloadButton);

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
            if (!this.presetSelectElement) {
                const defaultPresetSelect = this._createPresetSelect();
                this.presetSelectElement = defaultPresetSelect.querySelector('select');
                if (!this.presetSelectElement) {
                    console.error('Failed to create a default preset select element.');
                    return;
                }
            }
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
            if (!this.presetSelectElement) {
                const defaultPresetSelect = this._createPresetSelect();
                this.presetSelectElement = defaultPresetSelect.querySelector('select');
                if (!this.presetSelectElement) {
                    console.error('Failed to create a default preset select element.');
                    return;
                }
            }
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

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = preset.width;
    offscreenCanvas.height = preset.height;
    const offscreenContext = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    // Show a "Recording..." message
    const originalButtonText = {};
    const downloadButtons = this.uiContainer.querySelectorAll('.animation-download-button');
    downloadButtons.forEach(btn => {
        originalButtonText[btn.dataset.format] = btn.innerText;
        btn.innerText = 'Recording GIF...';
        btn.disabled = true;
    });

    // Check if GIF library is available
    if (typeof GIF === 'undefined') {
        console.error('GIF.js library not found. Please include it in your HTML.');
        downloadButtons.forEach(btn => {
            btn.innerText = originalButtonText[btn.dataset.format];
            btn.disabled = false;
        });
        alert('GIF.js library not found. Cannot generate GIF. Please check console for details.');
        return;
    }

    const gif = new GIF({
        workers: 2,
        quality: 10,
        width: preset.width,
        height: preset.height,
        workerScript: 'assets/gif.worker.js'
    });

    const canvases = this.canvasContainer.querySelectorAll('canvas');

    for (let i = 0; i < numFrames; i++) {
        const time = (i / frameRate) * 1000; // Time in milliseconds
        
        // Clear the offscreen canvas
        offscreenContext.fillStyle = this.settings.backgroundColor || '#ffffff';
        offscreenContext.fillRect(0, 0, preset.width, preset.height);
        
        // Render the artwork directly to the offscreen canvas
        this.renderArtwork(offscreenContext, preset.width, preset.height, this.settings, time);

        gif.addFrame(offscreenCanvas, { delay: frameDelay, copy: true });
    }

    gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${this._getDownloadFilename(presetName)}.gif`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        // Restore button text
        downloadButtons.forEach(btn => {
            btn.innerText = originalButtonText[btn.dataset.format];
            btn.disabled = false;
        });
    });

    gif.on('progress', (p) => {
        downloadButtons.forEach(btn => {
            if (btn.dataset.format === 'gif') {
                btn.innerText = `Rendering GIF... ${Math.round(p * 100)}%`;
            }
        });
    });

    gif.render();
  }
}