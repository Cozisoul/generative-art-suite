/**
 * Recursively splits a rectangle into placeholders for media and text.
 * @param {object} rect - The {x, y, w, h} of the area to split.
 * @param {number} mediaCount - Number of media boxes to place.
 * @param {number} textCount - Number of text boxes to place.
 * @param {number} randomness - A factor from 0 to 1 for split ratio.
 * @returns {Array<object>} - An array of { rect, type } objects.
 */
export function splitPlaceholders(rect, mediaCount, textCount, randomness = 0.2) {
    const total = mediaCount + textCount;
    if (total === 0 || rect.w < 10 || rect.h < 10) return [];

    // If only one item left, return it
    if (total === 1) {
        const type = mediaCount > 0 ? 'media' : 'text';
        return [{ rect, type }];
    }

    const ratio = 0.5 + (Math.random() - 0.5) * randomness;
    const vertical = rect.w > rect.h;

    const [r1, r2] = divideRect(rect, ratio, vertical);
    const drawMedia = Math.random() < mediaCount / total;

    const m1 = drawMedia ? Math.ceil(mediaCount * ratio) : Math.floor(mediaCount * ratio);
    const t1 = !drawMedia ? Math.ceil(textCount * ratio) : Math.floor(textCount * ratio);

    return [
        ...splitPlaceholders(r1, m1, t1, randomness),
        ...splitPlaceholders(r2, mediaCount - m1, textCount - t1, randomness)
    ];
}

function divideRect(rect, ratio, vertical) {
    if (vertical) {
        const splitW = rect.w * ratio;
        const r1 = { ...rect, w: splitW };
        const r2 = { ...rect, x: rect.x + splitW, w: rect.w - splitW };
        return [r1, r2];
    } else {
        const splitH = rect.h * ratio;
        const r1 = { ...rect, h: splitH };
        const r2 = { ...rect, y: rect.y + splitH, h: rect.h - splitH };
        return [r1, r2];
    }
}