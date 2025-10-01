// LayoutDrawer.js
// A specialist module for rendering layout suggestions on top of a grid.
import { splitPlaceholders } from '../ui/placeholder-boxes.js';

export default class LayoutDrawer {
    constructor(ctx) {
        this.ctx = ctx;
        this.mediaIndex = 0;
    }

    drawLayout(gridInfo, settings, mediaStore = []) {
        this.mediaIndex = 0; // Reset for each redraw
        this.ctx.globalAlpha = 0.6; // Make placeholders semi-transparent
        
        const getCellPos = (col, row, colSpan = 1, rowSpan = 1) => {
            const x = gridInfo.marginLeft + col * (gridInfo.colWidth + gridInfo.columnGutter);
            const y = gridInfo.marginTop + row * (gridInfo.rowHeight + gridInfo.rowGutter);
            const w = colSpan * gridInfo.colWidth + (colSpan - 1) * gridInfo.columnGutter;
            const h = rowSpan * gridInfo.rowHeight + (rowSpan - 1) * gridInfo.rowGutter;
            const p = settings.padding || 0;
            return { x: x + p, y: y + p, w: w - p * 2, h: h - p * 2 };
        };

        switch (settings.layoutTemplate) {
            case 'poster':
                this.drawPoster(getCellPos, gridInfo, settings, mediaStore);
                break;
            case 'auto-layout':
                this.drawAutoLayout(gridInfo, settings, mediaStore);
                break;
            case 'magazine-spread':
                this.drawMagazine(getCellPos, gridInfo, settings, mediaStore);
                break;
            case 'web-hero':
                this.drawHero(getCellPos, gridInfo, settings, mediaStore);
                break;
            case 'manual-box':
                this.drawManualBox(getCellPos, settings, mediaStore);
                break;
        }
        this.ctx.globalAlpha = 1.0;
    }

    _drawPlaceholderLabel(rect, labelText) {
        if (rect.w < 20 || rect.h < 20) return; // Don't draw on tiny boxes
        this.ctx.font = `bold ${Math.min(rect.w, rect.h) * 0.15}px sans-serif`;
        // Determine text color based on background brightness for visibility
        const r = parseInt(this.ctx.fillStyle.slice(1, 3), 16);
        const g = parseInt(this.ctx.fillStyle.slice(3, 5), 16);
        const b = parseInt(this.ctx.fillStyle.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        this.ctx.fillStyle = brightness > 128 ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.75)';
        
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(labelText, rect.x + rect.w / 2, rect.y + rect.h / 2);
    }

    _drawMediaOrPlaceholder(rect, color, mediaStore) {
        if (mediaStore && mediaStore.length > 0) {
            const img = mediaStore[this.mediaIndex % mediaStore.length];
            this.mediaIndex++;

            // Draw image with aspect ratio fill
            const imgAspect = img.width / img.height;
            const rectAspect = rect.w / rect.h;
            let sx, sy, sWidth, sHeight;

            if (imgAspect > rectAspect) { // Image is wider, crop sides
                sHeight = img.height;
                sWidth = sHeight * rectAspect;
                sx = (img.width - sWidth) / 2;
                sy = 0;
            } else { // Image is taller, crop top/bottom
                sWidth = img.width;
                sHeight = sWidth / rectAspect;
                sx = 0;
                sy = (img.height - sHeight) / 2;
            }
            this.ctx.drawImage(img, sx, sy, sWidth, sHeight, rect.x, rect.y, rect.w, rect.h);

        } else {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        }

        // Add label on top of both image and placeholder
        this._drawPlaceholderLabel(rect, 'MEDIA');
    }

    drawPoster(getCellPos, grid, settings, mediaStore) {
        const { mediaBoxColor, textBoxColor, layoutMode, numMediaBoxes, numTextBoxes, contentRatio } = settings;
        const mediaCount = numMediaBoxes || 0;
        const textCount = numTextBoxes || 0;

        if (mediaCount === 0 && textCount === 0) return;

        const isVerticalSplit = ['media-top', 'media-bottom'].includes(layoutMode);

        if (isVerticalSplit) {
            const mediaRows = Math.round(grid.rows * contentRatio);
            const textRows = grid.rows - mediaRows;
            const mediaStartRow = (layoutMode === 'media-bottom') ? textRows : 0;
            const textStartRow = (layoutMode === 'media-bottom') ? 0 : mediaRows;

            // Draw Media Blocks
            if (mediaCount > 0 && mediaRows > 0) {
                const rowsPerBlock = Math.floor(mediaRows / mediaCount);
                const remainingRows = mediaRows % mediaCount;
                let currentMediaRow = mediaStartRow;
                for (let i = 0; i < mediaCount; i++) {
                    const blockRows = rowsPerBlock + (i < remainingRows ? 1 : 0);
                    if (blockRows <= 0) continue;
                    const mediaRect = getCellPos(0, currentMediaRow, grid.columns, blockRows);
                    this._drawMediaOrPlaceholder(mediaRect, mediaBoxColor, mediaStore);
                    currentMediaRow += blockRows;
                }
            }

            // Draw Text Blocks
            if (textCount > 0 && textRows > 0) {
                const rowsPerBlock = Math.floor(textRows / textCount);
                const remainingRows = textRows % textCount;
                let currentTextRow = textStartRow;
                for (let i = 0; i < textCount; i++) {
                    const blockRows = rowsPerBlock + (i < remainingRows ? 1 : 0);
                    if (blockRows <= 0) continue;
                    const textRect = getCellPos(0, currentTextRow, grid.columns, blockRows);
                    this.ctx.fillStyle = textBoxColor;
                    this.ctx.fillRect(textRect.x, textRect.y, textRect.w, textRect.h);
                    this._drawPlaceholderLabel(textRect, 'TEXT');
                    currentTextRow += blockRows;
                }
            }
        } else { // Horizontal split
            const mediaCols = Math.round(grid.columns * contentRatio);
            const textCols = grid.columns - mediaCols;
            const mediaStartCol = (layoutMode === 'media-right') ? textCols : 0;
            const textStartCol = (layoutMode === 'media-right') ? 0 : mediaCols;

            // Draw Media Blocks
            if (mediaCount > 0 && mediaCols > 0) {
                const colsPerBlock = Math.floor(mediaCols / mediaCount);
                const remainingCols = mediaCols % mediaCount;
                let currentMediaCol = mediaStartCol;
                for (let i = 0; i < mediaCount; i++) {
                    const blockCols = colsPerBlock + (i < remainingCols ? 1 : 0);
                    if (blockCols <= 0) continue;
                    const mediaRect = getCellPos(currentMediaCol, 0, blockCols, grid.rows);
                    this._drawMediaOrPlaceholder(mediaRect, mediaBoxColor, mediaStore);
                    currentMediaCol += blockCols;
                }
            }

            // Draw Text Blocks
            if (textCount > 0 && textCols > 0) {
                const colsPerBlock = Math.floor(textCols / textCount);
                const remainingCols = textCols % textCount;
                let currentTextCol = textStartCol;
                for (let i = 0; i < textCount; i++) {
                    const blockCols = colsPerBlock + (i < remainingCols ? 1 : 0);
                    if (blockCols <= 0) continue;
                    const textRect = getCellPos(currentTextCol, 0, blockCols, grid.rows);
                    this.ctx.fillStyle = textBoxColor;
                    this.ctx.fillRect(textRect.x, textRect.y, textRect.w, textRect.h);
                    this._drawPlaceholderLabel(textRect, 'TEXT');
                    currentTextCol += blockCols;
                }
            }
        }
    }

    drawMagazine(getCellPos, grid, settings, mediaStore) {
        // This template is now flexible, so we can just reuse the poster logic.
        this.drawPoster(getCellPos, grid, settings, mediaStore);
    }
    
    drawHero(getCellPos, grid, settings, mediaStore) {
        const { mediaBoxColor, textBoxColor } = settings;
        // Nav bar
        this.ctx.fillStyle = textBoxColor;
        const navRect = getCellPos(0, 0, grid.columns, 1);
        this.ctx.fillRect(navRect.x, navRect.y, navRect.w, navRect.h);
        this._drawPlaceholderLabel(navRect, 'NAV / TEXT');

        // Hero media
        const heroRect = getCellPos(0, 1, grid.columns, grid.rows - 1);
        this._drawMediaOrPlaceholder(heroRect, mediaBoxColor, mediaStore);
    }

    drawManualBox(getCellPos, settings, mediaStore) {
        const {
            manualBoxType, manualBoxCol, manualBoxRow,
            manualBoxColSpan, manualBoxRowSpan,
            mediaBoxColor, textBoxColor
        } = settings;

        // UI is 1-indexed, getCellPos is 0-indexed
        const col = manualBoxCol - 1;
        const row = manualBoxRow - 1;

        const rect = getCellPos(col, row, manualBoxColSpan, manualBoxRowSpan);

        if (manualBoxType === 'media') {
            this._drawMediaOrPlaceholder(rect, mediaBoxColor, mediaStore);
        } else { // 'text'
            this.ctx.fillStyle = textBoxColor;
            this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            this._drawPlaceholderLabel(rect, 'TEXT');
        }
    }

    drawAutoLayout(gridInfo, settings, mediaStore) {
        const { numMediaBoxes, numTextBoxes, mediaBoxColor, textBoxColor, padding } = settings;

        if (numMediaBoxes === 0 && numTextBoxes === 0) return;

        const contentRect = {
            x: gridInfo.marginLeft,
            y: gridInfo.marginTop,
            w: gridInfo.contentWidth,
            h: gridInfo.contentHeight,
        };

        const placeholders = splitPlaceholders(contentRect, numMediaBoxes, numTextBoxes);

        placeholders.forEach(p => {
            const innerRect = { 
                x: p.rect.x + padding, 
                y: p.rect.y + padding, 
                w: p.rect.w < padding * 2 ? 0 : p.rect.w - padding * 2,
                h: p.rect.h < padding * 2 ? 0 : p.rect.h - padding * 2
            };
            if (p.type === 'media') {
                this._drawMediaOrPlaceholder(innerRect, mediaBoxColor, mediaStore);
            } else { // 'text'
                this.ctx.fillStyle = textBoxColor;
                this.ctx.fillRect(innerRect.x, innerRect.y, innerRect.w, innerRect.h);
                this._drawPlaceholderLabel(innerRect, 'TEXT');
            }
        });
    }
}