'use server'

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
