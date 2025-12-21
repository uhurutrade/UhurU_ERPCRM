import { prisma } from '../prisma';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

const openai = new OpenAI();

/**
 * RAG ENGINE (PRE-PRODUCTION)
 * 
 * Este módulo gestiona el ciclo de vida de los documentos para el sistema RAG:
 * 1. Extracción de texto (PDF, etc.)
 * 2. Troceado (Chunking) con solapamiento.
 * 3. Generación de Embeddings (Simulados hasta tener API Key).
 */

export interface Chunk {
    content: string;
    tokenCount: number;
}

/**
 * Divide un texto largo en trozos más pequeños (Chunks)
 */
export function chunkText(text: string, chunkSize = 1000, overlap = 200): Chunk[] {
    const chunks: Chunk[] = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const content = text.substring(start, end);

        chunks.push({
            content,
            tokenCount: Math.ceil(content.length / 4) // Estimación de tokens
        });

        start += (chunkSize - overlap);
    }

    return chunks;
}

/**
 * Genera un vector (Embedding) real usando OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });

    return response.data[0].embedding;
}

/**
 * Procesa un archivo, lo trocea y guarda los chunks en la base de datos
 */
export async function ingestDocument(docId: string, filePath: string) {
    try {
        // Resolución de ruta para Docker/Producción
        const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        let fullPath = path.join(process.cwd(), cleanPath);

        // Si no existe, buscar en public/
        try {
            await fs.access(fullPath);
        } catch {
            fullPath = path.join(process.cwd(), 'public', cleanPath);
        }

        const dataBuffer = await fs.readFile(fullPath);
        console.log(`[RAG] Archivo leído: ${fullPath} (${dataBuffer.length} bytes)`);

        // 1. Extraer texto basado en extensión
        let text = "";
        const ext = filePath.split('.').pop()?.toLowerCase();

        if (ext === 'pdf') {
            const pdfExtract = require('pdf-parse');
            const parse = typeof pdfExtract === 'function' ? pdfExtract : pdfExtract.default;
            const data = await parse(dataBuffer);
            text = data.text;
        }
        else if (ext === 'docx') {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            text = result.value;
        }
        else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
            console.log(`[RAG] Iniciando Vision OCR para ${filePath}...`);
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Extract all the text from this image perfectly. Just return the text, no comments." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/${ext};base64,${dataBuffer.toString('base64')}`
                                }
                            }
                        ]
                    }
                ]
            });
            text = response.choices[0].message.content || "";
            console.log(`[RAG] OCR completado para imagen: ${filePath}`);
        }
        else {
            // Fallback universal para archivos de texto (csv, txt, md, etc)
            text = dataBuffer.toString('utf-8').replace(/\u0000/g, '');
        }

        if (!text || text.trim().length === 0) {
            return { success: false, reason: "No text content extractable" };
        }

        // 2. Asegurar que el documento existe en ComplianceDocument 
        // para mantener integridad referencial en DocumentChunk
        let docName = path.basename(filePath);
        let doc = await prisma.complianceDocument.findUnique({ where: { id: docId } });

        if (!doc) {
            console.log(`[RAG] Registrando soporte en ComplianceDocument para attachment: ${docId}`);
            doc = await prisma.complianceDocument.create({
                data: {
                    id: docId,
                    filename: docName,
                    path: filePath,
                    documentType: 'ATTACHMENT',
                    isProcessed: true
                }
            });
        }

        // 3. Crear Chunks
        const chunks = chunkText(text);

        // 4. Guardar en DB (Limpiando previos si los hubiera)
        await prisma.documentChunk.deleteMany({ where: { documentId: docId } });

        // Guardamos los chunks masivamente
        for (const chunk of chunks) {
            const vector = await generateEmbedding(chunk.content);
            const vectorSql = `[${vector.join(',')}]`;

            await prisma.$executeRawUnsafe(
                `INSERT INTO "DocumentChunk" ("id", "documentId", "content", "tokenCount", "embedding", "createdAt") 
                 VALUES ($1, $2, $3, $4, $5::vector, NOW())`,
                randomUUID(),
                docId,
                chunk.content,
                chunk.tokenCount,
                vectorSql
            );
        }

        // 5. Marcar como procesado el documento original si es necesario
        await prisma.complianceDocument.update({
            where: { id: docId },
            data: { isProcessed: true }
        });

        console.log(`[RAG] ✅ Éxito: ${docId} vectorizado en ${chunks.length} fragmentos.`);
        return { success: true, chunksProcessed: chunks.length };
    } catch (error) {
        console.error("RAG Ingestion Error:", error);
        throw error;
    }
}

/**
 * Búsqueda de Chunks similares usando Cosine Similarity nativo de pgvector
 */
export async function retrieveContext(query: string, maxResults = 3) {
    const queryEmbedding = await generateEmbedding(query);
    const vectorSql = `[${queryEmbedding.join(',')}]`;

    // Búsqueda por similitud de coseno <=> 
    // similarity = 1 - distance
    const relevantChunks: any[] = await prisma.$queryRawUnsafe(`
        SELECT c.content, d.filename, (1 - (c.embedding <=> $1::vector)) as similarity
        FROM "DocumentChunk" c
        JOIN "ComplianceDocument" d ON c."documentId" = d.id
        ORDER BY similarity DESC
        LIMIT $2
    `, vectorSql, maxResults);

    return relevantChunks.map((c: any) => `[Fuente: ${c.filename} | Similitud: ${(c.similarity * 100).toFixed(1)}%]\n${c.content}`).join('\n\n---\n\n');
}
