/**
 * Converts a grid object from GridEngine into an SVG string.
 * @param {object} grid - The fully calculated grid object.
 * @returns {string} - A string containing the SVG markup.
 */
export function toSVG(grid) {
    const { w, h, gridLines, placeholders, color } = grid;
    const guideColor = color?.guide || '#00FF00';

    let linesSVG = '';
    gridLines.vertical.forEach(line => {
        linesSVG += `  <line x1="${line.x}" y1="${line.y1}" x2="${line.x}" y2="${line.y2}" stroke="${guideColor}" stroke-width="0.25" stroke-dasharray="2 2"/>\n`;
    });
    gridLines.horizontal.forEach(line => {
        linesSVG += `  <line x1="${line.x1}" y1="${line.y}" x2="${line.x2}" y2="${line.y}" stroke="${guideColor}" stroke-width="0.25" stroke-dasharray="2 2"/>\n`;
    });

    let placeholdersSVG = '';
    if (placeholders) {
        placeholders.forEach(p => {
            const fillColor = p.type === 'media' ? '#a9c5ff' : '#ffd1a9';
            placeholdersSVG += `  <rect x="${p.rect.x}" y="${p.rect.y}" width="${p.rect.w}" height="${p.rect.h}" fill="${fillColor}" opacity="0.6"/>\n`;
        });
    }

    return `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape">
  <g id="Placeholders">
${placeholdersSVG}
  </g>
  <g id="Guides" inkscape:groupmode="layer" inkscape:label="Guides" style="display:inline" inkscape:locked="true">
${linesSVG}
  </g>
</svg>
    `.trim();
}