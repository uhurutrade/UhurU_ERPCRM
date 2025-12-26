/**
 * Robust PDF text extraction helper for Next.js server actions.
 * Handles Buffer input and returns extracted text.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        // Option 1: pdf-parse (Using require for historical compatibility in Node/Docker)
        const pdf = require('pdf-parse');

        // Handle the case where the export might be in .default or similar due to bundling
        const parse = typeof pdf === 'function' ? pdf : (pdf.default || pdf);

        if (typeof parse !== 'function') {
            console.warn('[PDF HELPER] pdf-parse resolved to a non-function, attempting fallback extraction');
            return buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, '');
        }

        const data = await parse(buffer);
        return data.text || "";
    } catch (err: any) {
        console.warn(`[PDF HELPER] pdf-parse failed: ${err.message}`);

        // Fallback: Crude text extraction for emergencies
        try {
            return buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, '');
        } catch (e) {
            return "";
        }
    }
}
