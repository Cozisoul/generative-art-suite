class AppManager {
    constructor() {
        this.generators = {
            'Grid Generator': './generators/sketch-01.js',
            'Swiss Style': './generators/swiss-generator.js',
            'Bauhaus Poster': './generators/bauhaus-generator.js',
            'Abstract Film': './generators/abstract-film-generator.js',
            'Wireframe Generator': './generators/grid-tool-generator.js',
            'Image Manipulator': './generators/image-manip-generator.js',
            'Advanced Logo Designer': './generators/advanced-logo-generator.js',
            'Vera Molnar': './generators/vera-molnar-generator.js',
            '3D Generator': './generators/3d-generator.js',
        };
        this.activeGenerator = null;
        
        // Check for required DOM elements
        this.uiContainer = document.getElementById('ui-container');
        this.canvasContainer = document.getElementById('canvas-wrapper');
        this.generatorList = document.getElementById('generator-list');
        this.libraryColumn = document.getElementById('library-column');
        this.toggleLibraryBtn = document.getElementById('toggle-library-btn');
        this.workspaceContainer = document.querySelector('.workspace-container');

        if (!this.uiContainer) {
            console.error('UI container not found');
            return;
        }
        if (!this.canvasContainer) {
            console.error('Canvas container not found');
            return;
        }
        if (!this.generatorList) {
            console.error('Generator list not found');
            return;
        }

        this.createSwitcher();
        this.loadGenerator(Object.keys(this.generators)[0]);
        this.initEventListeners();

        this.resizeObserver = new ResizeObserver(entries => {
            if (this.activeGenerator) {
                this.activeGenerator.resizeCanvas();
            }
        });
        this.resizeObserver.observe(this.canvasContainer);
    }

    initEventListeners() {
        this.toggleLibraryBtn.addEventListener('click', () => this.toggleLibrary());
    }

    toggleLibrary() {
        this.libraryColumn.classList.toggle('closed');
        this.workspaceContainer.classList.toggle('library-closed');
        this.toggleLibraryBtn.classList.toggle('active');
    }

    createSwitcher() {
        for (const name in this.generators) {
            const listItem = document.createElement('li');
            listItem.classList.add('tutorial-item');
            listItem.dataset.generatorName = name;

            const title = document.createElement('div');
            title.classList.add('tutorial-title');
            title.innerText = name;

            const meta = document.createElement('div');
            meta.classList.add('tutorial-meta');
            meta.innerText = 'Generative Art'; // Generic meta info

            listItem.appendChild(title);
            listItem.appendChild(meta);

            listItem.addEventListener('click', () => {
                this.loadGenerator(name);
                // Update active class
                const currentActive = this.generatorList.querySelector('.tutorial-item.active');
                if (currentActive) {
                    currentActive.classList.remove('active');
                }
                listItem.classList.add('active');
            });

            this.generatorList.appendChild(listItem);
        }
    }

    async loadGenerator(name) {
        try {
            if (this.activeGenerator && typeof this.activeGenerator.destroy === 'function') {
                this.activeGenerator.destroy();
            }
            this.canvasContainer.innerHTML = '';
            
            const controls = this.uiContainer.querySelector('.controls');
            if (controls) controls.remove();

            const scriptPath = this.generators[name];
            if (!scriptPath) {
                throw new Error(`Generator "${name}" not found in generators list`);
            }

            const module = await import(scriptPath);
            const GeneratorClass = module.default;
            
            if (!GeneratorClass) {
                throw new Error(`Generator class not found in module: ${scriptPath}`);
            }

            this.activeGenerator = new GeneratorClass(this.canvasContainer, this.uiContainer);

            // Set active class for the first loaded generator
            if (!this.generatorList.querySelector('.tutorial-item.active')) {
                const firstItem = this.generatorList.querySelector(`[data-generator-name="${name}"]`);
                if (firstItem) {
                    firstItem.classList.add('active');
                }
            }
        } catch (error) {
            console.error(`Failed to load generator ${name}:`, error);
            // Show user-friendly error message
            this.canvasContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff6b6b; font-family: sans-serif;">
                    <div style="text-align: center;">
                        <h3>Failed to load generator</h3>
                        <p>Error: ${error.message}</p>
                        <p>Please try refreshing the page or selecting a different generator.</p>
                    </div>
                </div>
            `;
        }
    }
}

window.appManager = new AppManager();