'use server'

// Polyfill for PDF.js in Node.js environment
if (typeof global !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(global as any).DOMMatrix) {
        (global as any).DOMMatrix = class DOMMatrix {
            a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
            multiply() { return this; }
            inverse() { return this; }
            translate() { return this; }
            scale() { return this; }
            rotate() { return this; }
        };
    }
    if (!(global as any).ImageData) {
        (global as any).ImageData = class ImageData {
            data: Uint8ClampedArray;
            width: number;
            height: number;
            constructor(data: Uint8ClampedArray, width: number, height: number) {
                this.data = data;
                this.width = width;
                this.height = height;
            }
        };
    }
    if (!(global as any).Path2D) {
        (global as any).Path2D = class Path2D {
            moveTo() { }
            lineTo() { }
            bezierCurveTo() { }
            quadraticCurveTo() { }
            arc() { }
            arcTo() { }
            ellipse() { }
            rect() { }
            closePath() { }
        };
    }
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');

export async function parsePdf(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file uploaded');
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await pdf(buffer);

        // Basic cleaning of the text
        const cleanText = data.text
            .replace(/\s+/g, ' ')
            .trim();

        return {
            success: true,
            text: cleanText,
            info: data.info,
            pages: data.numpages
        };
    } catch (error) {
        console.error('PDF parsing error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to parse PDF'
        };
    }
}
