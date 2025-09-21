import BaseGenerator from '../BaseGenerator.js';
import LayoutDrawer from '../utils/layout-drawer.js';
// We would import our new, decoupled modules
// import { GridEngine } from './core/GridEngine.js'; // Assuming a barrel export
// import { toSVG } from './exporters/svg.js';

export default class GridToolGenerator extends BaseGenerator {
    constructor(canvasContainer, uiContainer) {
        super(canvasContainer, uiContainer);

        this.presets = { // New comprehensive list based on your spec
            'Print': {
                'Business Card US': { width: 1050, height: 600, locked: true },
                'Business Card EU': { width: 1063, height: 650, locked: true },
                'DL Leaflet': { width: 1191, height: 2598, locked: true },
                'A6 Flyer': { width: 1240, height: 1748, locked: true },
                'A5 Leaflet': { width: 1748, height: 2480, locked: true },
                'US Letter': { width: 2550, height: 3300, locked: true },
                'A4 Portrait': { width: 2480, height: 3508, locked: true },
                'A4 Landscape': { width: 3508, height: 2480, locked: true },
                'US Legal': { width: 2550, height: 4200, locked: true },
                'Tabloid': { width: 3300, height: 5100, locked: true },
                'A3 Portrait': { width: 3508, height: 4961, locked: true },
                'A3 Landscape': { width: 4961, height: 3508, locked: true },
                'A2 Poster': { width: 4961, height: 7016, locked: true },
                'A1 Poster': { width: 7016, height: 9933, locked: true },
                'A0 Poster': { width: 9933, height: 14043, locked: true },
                'Roll-up 800mm': { width: 9449, height: 23622, locked: true },
                'Roll-up 850mm': { width: 10039, height: 23622, locked: true },
                'DL Envelope': { width: 1191, height: 2598, locked: true },
                'C4 Envelope': { width: 2551, height: 3614, locked: true },
                'Model Comp-card': { width: 1275, height: 2025, locked: true },
                'Kindle Cover': { width: 2560, height: 1600, locked: true },
                'Paperback 6x9"': { width: 1800, height: 2700, locked: true },
            },
            'Screen': {
                'iPhone 14 Pro': { width: 1179, height: 2556, locked: false },
                'iPhone SE': { width: 750, height: 1334, locked: false },
                'Android (mdpi)': { width: 320, height: 568, locked: false },
                'Android (xxxhdpi)': { width: 1440, height: 2560, locked: false },
                'iPad 10.9"': { width: 1640, height: 2360, locked: false },
                'iPad Pro 12.9"': { width: 2048, height: 2732, locked: false },
                'Web (1366px)': { width: 1366, height: 768, locked: false },
                'Web (1920px)': { width: 1920, height: 1080, locked: false },
                'Web (2560px)': { width: 2560, height: 1440, locked: false },
                'Web (4K)': { width: 3840, height: 2160, locked: false },
                'IG Post': { width: 1080, height: 1080, locked: true },
                'IG Story': { width: 1080, height: 1920, locked: true },
                'Facebook Cover': { width: 1640, height: 859, locked: true },
                'Twitter Header': { width: 1500, height: 500, locked: true },
                'LinkedIn Cover': { width: 1584, height: 396, locked: true },
                'TikTok Video': { width: 1080, height: 1920, locked: true },
                'YouTube Thumbnail': { width: 1280, height: 720, locked: true },
                'Slide (16:9)': { width: 1920, height: 1080, locked: true },
                'Slide (4:3)': { width: 1600, height: 1200, locked: true },
                'Slide (A4)': { width: 2480, height: 3508, locked: true },
                'Apple Watch (45mm)': { width: 396, height: 484, locked: false },
                'Android Watch (Round)': { width: 384, height: 384, locked: false },
            },
            'Wireframe': {
                'Mobile (SM)': { width: 320, height: 568, locked: false },
                'Mobile (MD)': { width: 375, height: 812, locked: false },
                'Tablet': { width: 768, height: 1024, locked: false },
                'Desktop': { width: 1440, height: 900, locked: false },
                'Desktop (LG)': { width: 1920, height: 1080, locked: false },
                'Wireframe Slide (16:9)': { width: 1920, height: 1080, locked: false },
            }
        };

        this.settings = {
            columns: 12,
            rows: 12,
            columnGutter: 20,
            rowGutter: 20,
            padding: 10,
            marginTop: 72,
            marginRight: 72,
            marginBottom: 72,
            marginLeft: 72,
            // Default grid line color to be less intrusive
            lineColor: '#9b82ff', // Use traditional purple for grid guides
            backgroundColor: '#ffffff',
            showBackground: true,
            layoutTemplate: 'none',
            layoutMode: 'media-top', // New setting for interactive control
            contentRatio: 0.6, // New setting for media/text split
            showSpiral: false,
            showThirds: false,
            numMediaBoxes: 3,
            numTextBoxes: 2,
            mediaBoxColor: '#a9c5ff', // Restored original color
            textBoxColor: '#ffd1a9', // Restored original color
            manualBoxType: 'media',
            manualBoxCol: 1,
            manualBoxRow: 1,
            manualBoxColSpan: 4,
            manualBoxRowSpan: 4,
            linkGutters: true,
        };

        this.layoutDrawer = null;
        this.mediaStore = []; // To hold uploaded image objects

        this.scenarioDefinitions = { // Based on your provided table
            'none': { layoutTemplate: 'none', numMediaBoxes: 0, numTextBoxes: 0, columns: 12, rows: 12 },
            // Print Scenarios
            'Business Card': { pageSize: 'Business Card US', columns: 4, rows: 3, numMediaBoxes: 1, numTextBoxes: 1, layoutTemplate: 'auto-layout' },
            'Tri-fold DL': { pageSize: 'DL Leaflet', columns: 6, rows: 6, numMediaBoxes: 2, numTextBoxes: 4, layoutTemplate: 'auto-layout' },
            'Letter Memo': { pageSize: 'US Letter', columns: 8, rows: 12, numMediaBoxes: 1, numTextBoxes: 3, layoutTemplate: 'magazine-spread' },
            'Invoice A4': { pageSize: 'A4 Portrait', columns: 12, rows: 20, numMediaBoxes: 1, numTextBoxes: 5, layoutTemplate: 'auto-layout' },
            'Poster A4': { pageSize: 'A4 Portrait', columns: 4, rows: 6, numMediaBoxes: 1, numTextBoxes: 1, layoutTemplate: 'poster' },
            'Poster A2': { pageSize: 'A2 Poster', columns: 6, rows: 8, numMediaBoxes: 1, numTextBoxes: 2, layoutTemplate: 'poster' },
            'Roll-up Banner': { pageSize: 'Roll-up 850mm', columns: 4, rows: 12, numMediaBoxes: 2, numTextBoxes: 2, layoutTemplate: 'poster' },
            'Tabloid Spread': { pageSize: 'Tabloid', columns: 12, rows: 12, numMediaBoxes: 4, numTextBoxes: 4, layoutTemplate: 'auto-layout' },
            'Contact Sheet': { pageSize: 'US Letter', columns: 5, rows: 4, numMediaBoxes: 20, numTextBoxes: 0, layoutTemplate: 'auto-layout' },
            // Digital Scenarios
            'Kindle Cover': { pageSize: 'Kindle Cover', columns: 6, rows: 9, numMediaBoxes: 1, numTextBoxes: 1, layoutTemplate: 'poster' },
            'IG Post': { pageSize: 'IG Post', columns: 3, rows: 3, numMediaBoxes: 1, numTextBoxes: 0, layoutTemplate: 'auto-layout' },
            'IG Story': { pageSize: 'IG Story', columns: 4, rows: 8, numMediaBoxes: 1, numTextBoxes: 1, layoutTemplate: 'web-hero' },
            'Website Landing': { pageSize: 'Web (1920px)', columns: 12, rows: 16, numMediaBoxes: 4, numTextBoxes: 5, layoutTemplate: 'auto-layout' },
            'Slide 16:9': { pageSize: 'Slide (16:9)', columns: 12, rows: 6, numMediaBoxes: 1, numTextBoxes: 1, layoutTemplate: 'magazine-spread' },
            'iPhone 14': { pageSize: 'iPhone 14 Pro', columns: 4, rows: 9, numMediaBoxes: 1, numTextBoxes: 1, layoutTemplate: 'web-hero' },
        };
        this.canvas = null;
        this.context = null;
        const firstGroupName = Object.keys(this.presets)[0];
        const firstPresetName = Object.keys(this.presets[firstGroupName])[0];
        this.previewPreset = this.presets[firstGroupName][firstPresetName];

        this.setup();
    }

    setup() {
        this.canvas = document.createElement('canvas');
        this.canvasContainer.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
        this.layoutDrawer = new LayoutDrawer(this.context);

        this.createControls();
        this._createPreviewModal();

        this.boundDraw = this.draw.bind(this);
        window.addEventListener('resize', this.boundDraw, false);

        this.draw();
    }

    _findPreset(presetName) {
        for (const groupName in this.presets) {
            if (this.presets[groupName][presetName]) {
                return this.presets[groupName][presetName];
            }
        }
        return null;
    }

    _createPresetSelect() {
        const container = document.createElement('div');
        const label = document.createElement('label');
        label.innerText = 'Page Size';
        const select = document.createElement('select');
        select.className = 'download-preset-select';
        select.dataset.setting = 'pageSize';

        for (const groupName in this.presets) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = groupName;
            const groupPresets = this.presets[groupName];
            for (const presetName in groupPresets) {
                const option = document.createElement('option');
                option.value = presetName;
                option.innerText = presetName;
                optgroup.appendChild(option);
            }
            select.appendChild(optgroup);
        }

        select.addEventListener('input', (e) => {
            const selectedPresetName = e.target.value;
            this.previewPreset = this._findPreset(selectedPresetName);
            if (this.onPresetChange) {
                this.onPresetChange(selectedPresetName, this.previewPreset);
            }
            this.draw();
        });

        container.appendChild(label);
        container.appendChild(select);
        return container;
    }

    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls');

        // Re-ordered to follow a more logical workflow: Page -> Grid -> Content

        const pageSetupControls = this._createfieldset('Page Setup');
        pageSetupControls.appendChild(this._createPresetSelect());
        controlsContainer.appendChild(pageSetupControls);

        const gridControls = this._createfieldset('Grid');
        gridControls.appendChild(this._createSlider('columns', 'Columns', { min: 1, max: 36 }));
        gridControls.appendChild(this._createSlider('columnGutter', 'Col Gutter', { min: 0, max: 200 }));
        gridControls.appendChild(this._createSlider('rows', 'Rows', { min: 1, max: 36 }));
        gridControls.appendChild(this._createSlider('rowGutter', 'Row Gutter', { min: 0, max: 200 }));
        gridControls.appendChild(this._createCheckbox('linkGutters', 'Link Gutters'));
        gridControls.appendChild(this._createSlider('padding', 'Cell Padding', { min: 0, max: 100 }));
        controlsContainer.appendChild(gridControls);

        const marginControls = this._createfieldset('Margins');
        marginControls.appendChild(this._createSlider('marginTop', 'Top', { min: 0, max: 500 }));
        marginControls.appendChild(this._createSlider('marginBottom', 'Bottom', { min: 0, max: 500 }));
        marginControls.appendChild(this._createSlider('marginLeft', 'Left', { min: 0, max: 500 }));
        marginControls.appendChild(this._createSlider('marginRight', 'Right', { min: 0, max: 500 }));
        controlsContainer.appendChild(marginControls);

        const contentControls = this._createfieldset('Content & Templates');
        contentControls.appendChild(this._createSelect('scenario', 'Load Scenario', Object.keys(this.scenarioDefinitions)));
        contentControls.appendChild(this._createSelect('layoutTemplate', 'Layout Template', ['none', 'auto-layout', 'poster', 'magazine-spread', 'web-hero', 'manual-box']));
        contentControls.appendChild(this._createSelect('layoutMode', 'Layout Mode', ['media-top', 'media-bottom', 'media-left', 'media-right']));
        contentControls.appendChild(this._createSlider('contentRatio', 'Content Ratio', { min: 0, max: 1, step: 0.01 }));
        contentControls.appendChild(this._createSlider('numMediaBoxes', 'Media Boxes', { min: 0, max: 20 }));
        contentControls.appendChild(this._createSlider('numTextBoxes', 'Text Boxes', { min: 0, max: 20 }));
        controlsContainer.appendChild(contentControls);

        const manualBoxControls = this._createfieldset('Manual Box Placement');
        manualBoxControls.dataset.layoutControl = 'manual-box'; // Add a data attribute for easy selection
        manualBoxControls.appendChild(this._createSelect('manualBoxType', 'Box Type', ['media', 'text']));
        manualBoxControls.appendChild(this._createSlider('manualBoxCol', 'Start Column', { min: 1, max: this.settings.columns }));
        manualBoxControls.appendChild(this._createSlider('manualBoxRow', 'Start Row', { min: 1, max: this.settings.rows }));
        manualBoxControls.appendChild(this._createSlider('manualBoxColSpan', 'Column Span', { min: 1, max: this.settings.columns }));
        manualBoxControls.appendChild(this._createSlider('manualBoxRowSpan', 'Row Span', { min: 1, max: this.settings.rows }));
        controlsContainer.appendChild(manualBoxControls);

        const guidesControls = this._createfieldset('Composition Guides');
        guidesControls.appendChild(this._createCheckbox('showSpiral', 'Show Golden Spiral'));
        guidesControls.appendChild(this._createCheckbox('showThirds', 'Show Rule of Thirds'));
        controlsContainer.appendChild(guidesControls);

        const mediaLibraryControls = this._createfieldset('Media Library');
        const uploadButton = document.createElement('button');
        uploadButton.innerText = 'Upload Images';
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        uploadButton.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this._handleMediaUpload(e.target.files));
        mediaLibraryControls.appendChild(uploadButton);
        mediaLibraryControls.appendChild(fileInput);
        controlsContainer.appendChild(mediaLibraryControls);

        const appearanceControls = this._createfieldset('Appearance & Export');
        appearanceControls.appendChild(this._createColorInput('backgroundColor', 'Background'));
        appearanceControls.appendChild(this._createColorInput('lineColor', 'Grid Color'));
        appearanceControls.appendChild(this._createColorInput('mediaBoxColor', 'Media Color'));
        appearanceControls.appendChild(this._createColorInput('textBoxColor', 'Text Color'));
        appearanceControls.appendChild(this._createCheckbox('showBackground', 'Show BG in Export'));
        controlsContainer.appendChild(appearanceControls);

        const actionsControls = this._createfieldset('Actions');
        const randomizeButton = document.createElement('button');
        randomizeButton.innerText = 'Randomize';
        randomizeButton.addEventListener('click', this._randomizeSettings.bind(this));
        const previewButton = document.createElement('button');
        previewButton.innerText = 'Preview';
        previewButton.addEventListener('click', this._showPreview.bind(this));
        actionsControls.appendChild(previewButton);
        actionsControls.appendChild(randomizeButton);
        controlsContainer.appendChild(actionsControls);

        this.appendDownloadControls(controlsContainer);
        this.uiContainer.appendChild(controlsContainer);

        this._updateLayoutControlsVisibility(); // Set initial visibility
        this._updateManualBoxSliderConstraints();
    }

    onSettingChange(key, value) {
        if (key === 'scenario') {
            this._applyScenarioSettings(value);
        }

        if (key === 'layoutTemplate') {
            this._updateLayoutControlsVisibility();
        }

        if (key === 'columns' || key === 'rows') {
            this._updateManualBoxSliderConstraints();
        }

        const gutterKeys = ['columnGutter', 'rowGutter'];
        if (this.settings.linkGutters && gutterKeys.includes(key)) {
            this._syncSetting(gutterKeys, key, value);
        }
    }

    _updateManualBoxSliderConstraints() {
        const controls = this.uiContainer.querySelector('.controls');
        if (!controls) return;

        const updateSlider = (setting, newMax) => {
            const control = controls.querySelector(`[data-setting="${setting}"]`);
            if (control) {
                control.max = newMax;
                // Clamp value to the new max if it exceeds it
                if (parseInt(control.value) > newMax) {
                    control.value = newMax;
                    // Manually trigger event to update setting and label
                    control.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    // Still need to trigger event to update the setting in case the value was valid
                    // but the object was just created.
                    const currentValue = control.value;
                    this.settings[setting] = control.step.includes('.') ? parseFloat(currentValue) : parseInt(currentValue, 10);
                }
            }
        };

        updateSlider('manualBoxCol', this.settings.columns);
        updateSlider('manualBoxRow', this.settings.rows);
        updateSlider('manualBoxColSpan', this.settings.columns);
        updateSlider('manualBoxRowSpan', this.settings.rows);
    }

    /**
     * Syncs the values of related settings and their UI controls.
     * @param {string[]} keysToSync - An array of setting keys to synchronize.
     * @param {string} sourceKey - The key of the control that triggered the change.
     * @param {number} value - The new value to apply to all controls.
     */
    _syncSetting(keysToSync, sourceKey, value) {
        keysToSync.forEach(currentKey => {
            if (currentKey !== sourceKey) {
                this.settings[currentKey] = value;

                const control = this.uiContainer.querySelector(`[data-setting="${currentKey}"]`);
                if (control) {
                    control.value = value;
                    const label = control.previousElementSibling;
                    if (label && label.querySelector('span')) {
                        label.querySelector('span').innerText = value;
                    }
                }
            }
        });
    }

    _handleMediaUpload(files) {
        this.mediaStore = []; // Clear previous images
        const filePromises = [];

        for (const file of files) {
            const promise = new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
            filePromises.push(promise);
        }

        Promise.all(filePromises).then(images => {
            this.mediaStore = images;
            this.draw();
        });
    }

    _applyScenarioSettings(scenarioName) {
        const scenario = this.scenarioDefinitions[scenarioName];
        if (!scenario) return;

        // Scenarios only set page size and content type, leaving the grid structure untouched.
        const settingsToUpdate = ['pageSize', 'layoutTemplate', 'numMediaBoxes', 'numTextBoxes'];
        
        settingsToUpdate.forEach(key => {
            if (scenario[key] !== undefined) {
                const value = scenario[key];
                this.settings[key] = value;

                const control = this.uiContainer.querySelector(`[data-setting="${key}"]`);
                if (control) {
                    control.value = value;
                    if (control.type === 'range') {
                        const span = control.previousElementSibling?.querySelector('span');
                        if (span) span.innerText = value;
                    }
                }
            }
        });

        const downloadSelect = this.uiContainer.querySelector('.download-preset-select');

        // If the scenario defines a page size, check if it should be locked.
        if (scenario.pageSize) {
            this.previewPreset = this._findPreset(scenario.pageSize);
            if (downloadSelect) {
                downloadSelect.value = scenario.pageSize;
                if (this.previewPreset && this.previewPreset.locked) {
                    downloadSelect.disabled = true;
                } else {
                    downloadSelect.disabled = false;
                }
            }
        } else {
            if (downloadSelect) {
                // When no scenario is selected, or scenario has no page size, it should be enabled.
                downloadSelect.disabled = false;
                this.previewPreset = this._findPreset(downloadSelect.value);
            }
        }

        // Update which layout-specific controls are visible
        this._updateLayoutControlsVisibility();
    }

    draw() {
        const aspectRatio = this.previewPreset.width / this.previewPreset.height;
        let previewWidth = window.innerWidth * 0.9;
        let previewHeight = previewWidth / aspectRatio;

        if (previewHeight > window.innerHeight * 0.8) {
            previewHeight = window.innerHeight * 0.8;
            previewWidth = previewHeight * aspectRatio;
        }

        this.canvas.width = previewWidth;
        this.canvas.height = previewHeight;

        const scale = previewWidth / this.previewPreset.width;
        this.context.save();
        this.context.scale(scale, scale);

        // For preview, always show a background
        const previewSettings = { ...this.settings, showBackground: true };
        this.renderArtwork(this.context, this.previewPreset.width, this.previewPreset.height, previewSettings);

        this.context.restore();
    }

    renderArtwork(ctx, width, height, settings, time = 0) {
        const {
            showSpiral, showThirds,
            marginTop, marginRight, marginBottom, marginLeft,
            lineColor, backgroundColor, showBackground,
        } = settings;

        ctx.clearRect(0, 0, width, height);

        if (showBackground) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
        }

        // --- NEW: Use the GridEngine ---
        // This would be a simplified mapping from UI settings to the engine's config
        const gridConfig = {
            w: width, h: height,
            margins: { top: settings.marginTop, right: settings.marginRight, bottom: settings.marginBottom, left: settings.marginLeft },
            columns: settings.columns,
            rows: settings.rows,
            gutter: { col: settings.columnGutter, row: settings.rowGutter },
            placeholders: { media: settings.numMediaBoxes, text: settings.numTextBoxes },
            // baseline and other features from the spec would be added here
        };
        // const gridData = GridEngine.build(gridConfig); // This would return all calculated data

        // For demonstration, we'll continue using the old method, but this is where the switch would happen.
        const gridInfo = this._calculateGrid(width, height, settings); // OLD WAY

        // 1. Draw layout placeholders
        // The layout drawer would now receive the calculated placeholder array from `gridData.placeholders`
        this.layoutDrawer.drawLayout(gridInfo, settings, this.mediaStore);

        // 2. Draw grid lines on top
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1; // Thinner for a guide-like appearance
        this._drawGridLines(ctx, gridInfo);

        // 3. Draw composition guides on top of everything
        if (showThirds) {
            this._drawRuleOfThirds(ctx, gridInfo, lineColor);
        }
        if (showSpiral) {
            this._drawGoldenSpiral(ctx, gridInfo.marginLeft, gridInfo.marginTop, gridInfo.contentWidth, gridInfo.contentHeight, lineColor);
        }
    }

    _calculateGrid(width, height, settings) {
        const { columns, rows, columnGutter, rowGutter, marginTop, marginRight, marginBottom, marginLeft } = settings;
        const contentWidth = width - marginLeft - marginRight;
        const contentHeight = height - marginTop - marginBottom;
        const totalColGutter = (columns - 1) * columnGutter;
        const colWidth = (contentWidth - totalColGutter) / columns;
        const totalRowGutter = (rows - 1) * rowGutter;
        const rowHeight = (contentHeight - totalRowGutter) / rows;
        return { width, height, columns, rows, columnGutter, rowGutter, marginTop, marginRight, marginBottom, marginLeft, contentWidth, contentHeight, colWidth, rowHeight };
    }

    _drawGridLines(ctx, gridInfo) {
        const { columns, rows, colWidth, rowHeight, columnGutter, rowGutter, marginLeft, marginTop, contentWidth, contentHeight } = gridInfo;
    
        ctx.beginPath();
    
        // Vertical lines
        for (let i = 0; i <= columns; i++) {
            const x = marginLeft + i * (colWidth + columnGutter) - (i > 0 ? columnGutter : 0);
            ctx.moveTo(x, marginTop);
            ctx.lineTo(x, marginTop + contentHeight);
        }
    
        // Horizontal lines
        for (let i = 0; i <= rows; i++) {
            const y = marginTop + i * (rowHeight + rowGutter) - (i > 0 ? rowGutter : 0);
            ctx.moveTo(marginLeft, y);
            ctx.lineTo(marginLeft + contentWidth, y);
        }
        ctx.stroke();
    }

    _getDownloadFilename(presetName) {
        return `grid-${presetName.replace(/[\s()]/g, '_')}-${this.settings.columns}x${this.settings.rows}.png`;
    }

    _drawGoldenSpiral(ctx, x, y, w, h, color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.5;
        ctx.translate(x, y);

        // Ensure we start with a landscape rectangle for simpler logic
        if (h > w) {
            ctx.translate(0, h);
            ctx.rotate(-Math.PI / 2);
            [w, h] = [h, w]; // Swap width and height
        }

        for (let i = 0; i < 10; i++) {
            if (w < 1 || h < 1) break;
            ctx.beginPath();
            // Arc is in the square part of the golden rectangle
            ctx.arc(w - h, h, h, Math.PI, Math.PI * 1.5);
            ctx.stroke();

            // Transform context to the remaining rectangle
            ctx.translate(w - h, 0);
            [w, h] = [h, w - h]; // New w is old h, new h is remainder
            ctx.rotate(-Math.PI / 2);
        }
        ctx.restore();
    }

    _drawRuleOfThirds(ctx, gridInfo, color) {
        const { marginLeft, marginTop, contentWidth, contentHeight } = gridInfo;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;

        const x1 = marginLeft + contentWidth / 3;
        const x2 = marginLeft + contentWidth * 2 / 3;
        const y1 = marginTop + contentHeight / 3;
        const y2 = marginTop + contentHeight * 2 / 3;

        ctx.beginPath();
        ctx.moveTo(x1, marginTop); ctx.lineTo(x1, marginTop + contentHeight);
        ctx.moveTo(x2, marginTop); ctx.lineTo(x2, marginTop + contentHeight);
        ctx.moveTo(marginLeft, y1); ctx.lineTo(marginLeft + contentWidth, y1);
        ctx.moveTo(marginLeft, y2); ctx.lineTo(marginLeft + contentWidth, y2);
        ctx.stroke();

        ctx.restore();
    }

    _updateLayoutControlsVisibility() {
        const layoutTemplate = this.settings.layoutTemplate;
        const controls = this.uiContainer.querySelector('.controls');
        if (!controls) return;

        const layoutModeControl = controls.querySelector('[data-setting="layoutMode"]').parentElement;
        const contentRatioControl = controls.querySelector('[data-setting="contentRatio"]').parentElement;
        const numMediaBoxesControl = controls.querySelector('[data-setting="numMediaBoxes"]').parentElement;
        const numTextBoxesControl = controls.querySelector('[data-setting="numTextBoxes"]').parentElement;
        const manualBoxControls = controls.querySelector('[data-layout-control="manual-box"]');

        // Default to hiding context-specific controls
        layoutModeControl.style.display = 'none';
        contentRatioControl.style.display = 'none';
        numMediaBoxesControl.style.display = 'none';
        numTextBoxesControl.style.display = 'none';
        if (manualBoxControls) manualBoxControls.style.display = 'none';

        if (layoutTemplate === 'auto-layout') {
            numMediaBoxesControl.style.display = '';
            numTextBoxesControl.style.display = '';
        } else if (['poster', 'magazine-spread'].includes(layoutTemplate)) {
            layoutModeControl.style.display = '';
            contentRatioControl.style.display = '';
            numMediaBoxesControl.style.display = '';
            numTextBoxesControl.style.display = '';
        } else if (layoutTemplate === 'manual-box') {
            if (manualBoxControls) manualBoxControls.style.display = '';
        }
        // For 'web-hero' and 'none', all these specific controls remain hidden, which is correct.
    }

    destroy() {
        super.destroy();
    }
}