
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import BaseGenerator from '../BaseGenerator.js';

export default class ThreeDGenerator extends BaseGenerator {
    constructor(canvasContainer, uiContainer) {
        super(canvasContainer, uiContainer);
        this.is3D = true; // Mark this generator as 3D

        this.presets = {
            'Square (1:1)': { width: 1080, height: 1080 },
            'Widescreen (16:9)': { width: 1920, height: 1080 },
            'Portrait (9:16)': { width: 1080, height: 1920 },
        };

        this.settings = {
            shape: 'Cube',
            color: '#ff00ff',
            materialType: 'Solid',
            rotationSpeedX: 0.005,
            rotationSpeedY: 0.005,
            rotationSpeedZ: 0.000,
            outputSize: 'Square (1:1)', // Default output size
        };

        this.shapes = ['Cube', 'Sphere', 'Cone', 'Torus', 'Dodecahedron', 'Gameboy', 'Famicom'];
        this.materials = ['Solid', 'Wireframe', 'Points', 'Textured'];

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.animationFrameId = null;
        this.isAnimatable = true; // This generator is animated
        this.lights = []; // Store lights for proper disposal

        this.setup();
    }

    setup() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.canvasContainer.clientWidth / this.canvasContainer.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.canvasContainer.clientWidth, this.canvasContainer.clientHeight);
        this.canvasContainer.appendChild(this.renderer.domElement);

        this.camera.position.z = 5;

        this.createControls();
        this.createShape();

        this.boundAnimate = this.animate.bind(this);
        this.animate();
    }

    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls');

        const shapeControls = this._createfieldset('Shape');
        shapeControls.appendChild(this._createSelect('shape', 'Shape', this.shapes));
        controlsContainer.appendChild(shapeControls);

        const materialControls = this._createfieldset('Material');
        materialControls.appendChild(this._createColorInput('color', 'Color'));
        materialControls.appendChild(this._createSelect('materialType', 'Material', this.materials));
        controlsContainer.appendChild(materialControls);

        const rotationControls = this._createfieldset('Rotation');
        rotationControls.appendChild(this._createNumberInput('rotationSpeedX', 'Speed X', 0.001, 0.1, 0.001));
        rotationControls.appendChild(this._createNumberInput('rotationSpeedY', 'Speed Y', 0.001, 0.1, 0.001));
        rotationControls.appendChild(this._createNumberInput('rotationSpeedZ', 'Speed Z', 0.001, 0.1, 0.001));
        controlsContainer.appendChild(rotationControls);

        this.appendDownloadControls(controlsContainer);

        this.uiContainer.appendChild(controlsContainer);
    }

    createShape() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        let geometry;
        switch (this.settings.shape) {
            case 'Cube':
                geometry = new THREE.BoxGeometry(2, 2, 2);
                break;
            case 'Sphere':
                geometry = new THREE.SphereGeometry(1.5, 32, 32);
                break;
            case 'Cone':
                geometry = new THREE.ConeGeometry(1.5, 3, 32);
                break;
            case 'Torus':
                geometry = new THREE.TorusGeometry(1.5, 0.5, 16, 100);
                break;
            case 'Dodecahedron':
                geometry = new THREE.DodecahedronGeometry(1.5);
                break;
            case 'Gameboy':
                geometry = this.createGameboy();
                break;
            case 'Famicom':
                geometry = this.createFamicom();
                break;
            default:
                geometry = new THREE.BoxGeometry(2, 2, 2);
        }

        this.updateMaterial(geometry);
    }

    createGameboy() {
        const body = new THREE.BoxGeometry(2, 3, 0.5);
        return body;
    }

    createFamicom() {
        const body = new THREE.BoxGeometry(3, 1.5, 0.5);
        return body;
    }

    updateMaterial(geometry) {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.material.dispose();
        }

        let material;
        switch (this.settings.materialType) {
            case 'Wireframe':
                material = new THREE.MeshBasicMaterial({ color: this.settings.color, wireframe: true });
                break;
            case 'Points':
                material = new THREE.PointsMaterial({ color: this.settings.color, size: 0.05 });
                this.mesh = new THREE.Points(geometry, material);
                this.scene.add(this.mesh);
                return;
            case 'Solid':
                material = new THREE.MeshPhongMaterial({ color: this.settings.color });
                const ambientLight = new THREE.AmbientLight(0x404040);
                this.scene.add(ambientLight);
                this.lights.push(ambientLight);
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
                directionalLight.position.set(1, 1, 1);
                this.scene.add(directionalLight);
                this.lights.push(directionalLight);
                break;
            case 'Textured':
                const canvas = document.createElement('canvas');
                canvas.width = 16;
                canvas.height = 16;
                const context = canvas.getContext('2d');
                context.fillStyle = '#8B008B'; // Dark Magenta
                context.fillRect(0, 0, 16, 16);
                context.fillStyle = '#FFD700'; // Gold
                context.fillRect(0, 0, 8, 8);
                context.fillStyle = '#00CED1'; // Dark Turquoise
                context.fillRect(8, 8, 8, 8);
                const texture = new THREE.CanvasTexture(canvas);
                texture.magFilter = THREE.NearestFilter; // For pixelated look
                texture.minFilter = THREE.NearestFilter; // For pixelated look
                material = new THREE.MeshBasicMaterial({ map: texture });
                break;
            default:
                material = new THREE.MeshPhongMaterial({ color: this.settings.color });
                const ambientLightDefault = new THREE.AmbientLight(0x404040);
                this.scene.add(ambientLightDefault);
                this.lights.push(ambientLightDefault);
                const directionalLightDefault = new THREE.DirectionalLight(0xffffff, 0.5);
                directionalLightDefault.position.set(1, 1, 1);
                this.scene.add(directionalLightDefault);
                this.lights.push(directionalLightDefault);
                break;
        }

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    onSettingChange(key, value) {
        if (key === 'shape') {
            this.createShape();
        } else if (key.startsWith('rotationSpeed')) {
            this.settings[key] = parseFloat(value);
        } else if (key === 'materialType') {
            this.updateMaterial(this.mesh.geometry);
        } else {
            this.updateMaterial(this.mesh.geometry);
        }
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(this.boundAnimate);

        if (this.mesh) {
            this.mesh.rotation.x += this.settings.rotationSpeedX;
            this.mesh.rotation.y += this.settings.rotationSpeedY;
            this.mesh.rotation.z += this.settings.rotationSpeedZ;
        }

        this.renderer.render(this.scene, this.camera);
    }

    

    draw() {
        // For compatibility with BaseGenerator, but animation is handled by animate()
        this.renderer.render(this.scene, this.camera);
    }

    resizeCanvas() {
        if (this.camera && this.renderer) {
            const width = this.canvasContainer.clientWidth;
            const height = this.canvasContainer.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }

    downloadArtwork(preset, presetName) {
        // For 3D, we need to render at high resolution
        if (!preset || !preset.width || !preset.height) {
            console.error('Invalid preset provided for 3D download.', preset);
            alert('Invalid preset selected for download.');
            return;
        }

        // Store original renderer size
        const originalSize = {
            width: this.renderer.getSize(new THREE.Vector2()).x,
            height: this.renderer.getSize(new THREE.Vector2()).y
        };

        try {
            // Set renderer to high resolution
            this.renderer.setSize(preset.width, preset.height);
            this.camera.aspect = preset.width / preset.height;
            this.camera.updateProjectionMatrix();

            // Render the scene
            this.renderer.render(this.scene, this.camera);

            // Capture the canvas
            const canvas = this.renderer.domElement;
            const link = document.createElement('a');
            link.download = this._getDownloadFilename(presetName);
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();

        } catch (error) {
            console.error('Error rendering 3D artwork for download:', error);
            alert('Error rendering 3D artwork for download. Please try again.');
        } finally {
            // Restore original renderer size
            this.renderer.setSize(originalSize.width, originalSize.height);
            this.camera.aspect = originalSize.width / originalSize.height;
            this.camera.updateProjectionMatrix();
        }
    }

    destroy() {
        super.destroy();
        cancelAnimationFrame(this.animationFrameId);
        
        // Dispose of mesh
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        // Dispose of lights
        this.lights.forEach(light => {
            this.scene.remove(light);
            if (light.dispose) {
                light.dispose();
            }
        });
        this.lights = [];
        
        // Dispose of renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.canvasContainer.innerHTML = '';
    }
}
