# Generative Art Suite

A comprehensive, browser-based suite of tools for creating generative art, design layouts, and abstract animations. This project is built with vanilla JavaScript and leverages the HTML Canvas API for rendering.

## Features

The suite includes a collection of distinct generators, each tailored for a specific creative purpose.

### Generators

*   **Grid Generator:** Creates abstract grid-based art with animation and simulation. Features include:
    *   Uniform and randomized grid systems.
    *   Multiple shape types, including generative Truchet tiles.
    *   A "Game of Life" simulation that drives the artwork.
    *   Canvas blend modes for complex color interactions.
    *   An interactive sound system that reacts to visual parameters.

*   **Vera Molnar Tribute:** A generator inspired by the plotter art of Vera Molnár, one of the pioneers of computer art. It creates grid-based compositions with controlled disorder, exploring the relationship between order and chaos. Features animation and a "Game of Life" mode to drive the composition.

*   **Swiss Style Generator:** A tool for creating posters and layouts in the classic Swiss International Typographic Style. Features include:
    *   Scenario-based design (`Classic`, `Image-Dominant`, `Typographic-Focus`).
    *   Intelligent page sizing that adapts to the chosen scenario.
    *   Professional composition guides like "Rule of Thirds" and column overlays.

*   **Bauhaus Poster Generator:** A style-specific generator for creating posters inspired by the Bauhaus movement, with control over shapes, text, colors, and diagonal lines.

*   **Abstract Film Generator:** A creative tool for generating animated retro films. Features include:
    *   "Film Stock" presets (`Noir`, `Faded 70s`) that control color and grain.
    *   "Direct-on-film" effects like scratches, dust, and paint splatter.
    *   Motion-based effects like velocity-driven rotation and skew.
    *   Downloadable `.webm` video output.

*   **Grid Layout Tool:** A sophisticated wireframing and layout planning tool for designers. Features include:
    *   Intelligent templates (Poster, Magazine, Business Card, etc.) that set page size and grid settings.
    *   An "Auto-Layout" mode that generatively creates balanced compositions.
    *   Clear placeholder boxes with "MEDIA" and "TEXT" labels for easy wireframing.

*   **Image Manipulator:** A versatile tool to upload images and apply creative effects. Features include:
    *   Effects: Pixelate, Voxelize, Bitmap (Dithering), Halftone, ASCII, Anaglyph 3D, and Glitch.
    *   Basic image adjustments for brightness and contrast.

*   **Logo Generator:** A practical tool for creating modern logos. Features include:
    *   Professional style templates (`Minimalist Monogram`, `Tech Startup`, etc.).
    *   "Use Case" presets for sizing (e.g., `Wide Banner`, `Favicon`).
    *   Multiple generative mark types (`Fractal Tree`, `Waves`, `Grid`).
    *   Smart text coloring for high-contrast "enclosed" layouts.

*   **3D Generator:** A tool for generating and manipulating 3D shapes using Three.js. Features include:
    *   Multiple basic 3D shapes (Cube, Sphere, Cone, Torus, Dodecahedron).
    *   Custom shapes like Gameboy and Famicom.
    *   Various material types: Solid, Wireframe, Points, and a pixelated 'Textured' style.
    *   Controls for rotation speed along X, Y, and Z axes.
    *   Preset output sizes for easy export.

## Core Architecture

The project is built on a simple, object-oriented foundation.

*   **`BaseGenerator.js`**: An abstract base class that provides shared functionality for all generators, including UI control creation, preview modal management, and image/video downloading. All generators now support image download, and animated generators support video download.
*   **Generators (`/generators/*.js`)**: Each generator is a class that extends `BaseGenerator` and implements its own unique `renderArtwork` method and UI controls.
*   **Drawers (`/drawers/*.js`)**: For more complex generators, the drawing logic is encapsulated in a separate "drawer" class to improve code organization and maintainability.
*   **`main.js`**: The main application manager that handles loading and switching between the different generators.

## How to Run

1.  Clone the repository.
2.  Since the project uses ES6 modules (`import`/`export`), you need to run it from a local web server. You cannot simply open `index.html` from the file system.
3.  A simple way to do this is to use the Live Server extension for Visual Studio Code.
4.  Right-click on `index.html` and select "Open with Live Server".
5.  The application will open in your default browser.