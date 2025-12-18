import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// pdf-parse doesn't play well with ESM default imports in Next.js
// We'll require it inside the processing function or use a more robust import.

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
 * Genera un vector (Embedding) mockeado para demostración
 * En un sistema real, aquí llamaríamos a OpenAI 'text-embedding-3-small'
 */
export async function getMockEmbedding(text: string): Promise<number[]> {
    // Generamos un vector ruidoso determinista basado en el texto para pruebas
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: 1536 }, (_, i) => Math.sin(hash + i) * 0.1);
}

/**
 * Procesa un archivo, lo trocea y guarda los chunks en la base de datos
 */
export async function ingestDocument(docId: string, filePath: string) {
    try {
        const fullPath = path.join(process.cwd(), filePath);
        const dataBuffer = await fs.readFile(fullPath);

        // 1. Extraer texto basado en extensión
        let text = "";
        if (filePath.endsWith('.pdf')) {
            const pdf = require('pdf-parse');
            const data = await pdf(dataBuffer);
            text = data.text;
        } else {
            text = dataBuffer.toString();
        }

        if (!text || text.trim().length === 0) {
            throw new Error("No text found in document");
        }

        // 2. Crear Chunks
        const chunks = chunkText(text);

        // 3. Guardar en DB (Limpiando previos si los hubiera)
        await prisma.documentChunk.deleteMany({ where: { documentId: docId } });

        // Guardamos los chunks masivamente
        // Nota: En producción generaríamos los embeddings aquí
        for (const chunk of chunks) {
            const mockVector = await getMockEmbedding(chunk.content);

            await prisma.documentChunk.create({
                data: {
                    documentId: docId,
                    content: chunk.content,
                    tokenCount: chunk.tokenCount,
                    embedding: JSON.stringify(mockVector)
                }
            });
        }

        // 4. Marcar como procesado
        await prisma.complianceDocument.update({
            where: { id: docId },
            data: { isProcessed: true }
        });

        return { success: true, chunksProcessed: chunks.length };
    } catch (error) {
        console.error("RAG Ingestion Error:", error);
        throw error;
    }
}

/**
 * Búsqueda de Chunks similares (Simulada por palabra clave hasta tener Vector DB real)
 */
export async function retrieveContext(query: string, maxResults = 3) {
    // En producción: Vector similarity search (Cosine Similarity)
    // En este mock: Búsqueda de texto simple
    const relevantChunks = await prisma.documentChunk.findMany({
        where: {
            content: { contains: query, mode: 'insensitive' }
        },
        take: maxResults,
        select: {
            content: true,
            document: { select: { filename: true } }
        }
    });

    return relevantChunks.map((c: any) => `[Fuente: ${c.document.filename}]\n${c.content}`).join('\n\n---\n\n');
}
