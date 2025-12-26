import { prisma } from '../prisma';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

// Lazy initialization to avoid build-time errors when OPENAI_API_KEY is not available
let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiInstance) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("[RAG] CRITICAL: OPENAI_API_KEY is missing from environment!");
        }
        openaiInstance = new OpenAI();
        console.log("[RAG] ✅ OpenAI client initialized");
    }
    return openaiInstance;
}

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
    const openai = getOpenAIClient();
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
        // Obtener nombre original del archivo desde la DB para logs más claros
        let originalFilename = path.basename(filePath);
        try {
            const doc = await prisma.complianceDocument.findUnique({
                where: { id: docId },
                select: { filename: true }
            });
            if (doc?.filename) {
                originalFilename = doc.filename;
            }
        } catch (err) {
            // Si falla, usar el basename del path
        }

        console.log(`[RAG] 📄 Procesando: "${originalFilename}" (ID: ${docId})`);

        // Manejar rutas virtuales de sistema
        if (filePath.startsWith('system://')) {
            return { success: false, reason: "Virtual system path - use ingestText instead" };
        }

        // Resolución de ruta para Docker/Producción
        // Evitar unir si la ruta ya es absoluta y existe
        let fullPath = filePath;

        try {
            await fs.access(fullPath);
        } catch {
            const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
            fullPath = path.join(process.cwd(), cleanPath);

            try {
                await fs.access(fullPath);
            } catch {
                fullPath = path.join(process.cwd(), 'public', cleanPath);
            }
        }

        const dataBuffer = await fs.readFile(fullPath);
        console.log(`[RAG] ✓ Archivo leído: ${dataBuffer.length} bytes`);

        // 1. Extraer texto basado en extensión (Modo Blindado para Producción)
        let text = "";
        const ext = filePath.split('.').pop()?.toLowerCase();

        try {
            if (ext === 'pdf') {
                console.log(`[RAG] 🔍 Extrayendo texto de PDF...`);
                const { extractTextFromPdf } = await import('../pdf-helper');
                text = await extractTextFromPdf(dataBuffer);
                console.log(`[RAG] PDF parseado: ${text.length} caracteres.`);
            }
            else if (ext === 'docx') {
                const mammoth = require('mammoth');
                const m = mammoth.default || mammoth;
                const result = await m.extractRawText({ buffer: dataBuffer });
                text = result.value;
            }
            else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
                console.log(`[RAG] 👁️ Iniciando Vision OCR para "${originalFilename}"...`);
                const openai = getOpenAIClient();
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
                console.log(`[RAG] ✅ OCR completado: ${text.length} caracteres extraídos`);
            }
            else {
                text = dataBuffer.toString('utf-8').replace(/\u0000/g, '');
            }
        } catch (extractError: any) {
            console.error(`[RAG] Error crítico de extracción en ${ext}:`, extractError.message);
            // Si falla la extracción, devolvemos success false para que no rompa el hilo
            return { success: false, reason: `Extraction failed: ${extractError.message}` };
        }

        if (!text || text.trim().length === 0) {
            console.warn(`[RAG] No se pudo extraer texto de ${filePath}`);
            return { success: false, reason: "No text content extractable" };
        }

        // 2. Asegurar que el documento existe en ComplianceDocument 
        // para mantener integridad referencial en DocumentChunk
        let docName = path.basename(filePath);
        let doc = await prisma.complianceDocument.findUnique({
            where: { id: docId },
            select: { id: true, filename: true, userNotes: true, path: true }
        });

        if (!doc) {
            console.log(`[RAG] Registrando soporte en ComplianceDocument para attachment: ${docId}`);
            doc = await prisma.complianceDocument.create({
                data: {
                    id: docId,
                    filename: docName,
                    path: filePath,
                    documentType: 'ATTACHMENT',
                    isProcessed: true
                },
                select: { id: true, filename: true, userNotes: true, path: true }
            });
        }

        // --- INTEGRACIÓN DE CONTEXTO MANUAL (USER NOTES) ---
        // Si el usuario añadió notas (ej: en español explicando el contexto de la empresa),
        // las incluimos al principio del texto para que el RAG las tenga en cuenta.
        if (doc.userNotes) {
            console.log(`[RAG] 📝 Incluyendo ${doc.userNotes.length} chars de notas de usuario como contexto.`);
            text = `[NOTAS DE CONTEXTO DEL USUARIO]:\n${doc.userNotes}\n\n[CONTENIDO DEL DOCUMENTO ORIGINAL]:\n${text}`;
        }

        // 3. Crear Chunks
        const chunks = chunkText(text);
        console.log(`[RAG] 📊 "${originalFilename}": ${text.length} caracteres → ${chunks.length} fragmentos`);

        if (chunks.length === 0) {
            console.warn(`[RAG] Documento ${docId} resultó en 0 fragmentos.`);
            return { success: false, reason: "Zero chunks" };
        }

        // 4. Guardar en DB (Limpiando previos si los hubiera)
        console.log(`[RAG] Limpiando fragmentos antiguos para ${docId}...`);
        await prisma.documentChunk.deleteMany({ where: { documentId: docId } });

        console.log(`[RAG] Procesando ${chunks.length} fragmentos...`);
        let inserted = 0;

        // Guardamos los chunks masivamente
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            try {
                // VPS COMPATIBILITY: Skip embedding generation and raw SQL
                // Just use standard Prisma create
                await prisma.documentChunk.create({
                    data: {
                        id: randomUUID(),
                        documentId: docId,
                        content: chunk.content,
                        tokenCount: chunk.tokenCount,
                    }
                });

                inserted++;
                if (inserted % 10 === 0 || inserted === chunks.length) {
                    console.log(`[RAG] Avance: ${inserted}/${chunks.length} fragmentos procesados.`);
                }
            } catch (err: any) {
                console.error(`[RAG] Error en fragmento ${i}:`, err.message);
            }
        }

        // 5. Marcar como procesado el documento original si es necesario
        await prisma.complianceDocument.update({
            where: { id: docId },
            data: { isProcessed: true }
        });

        console.log(`[RAG] ✅ FINALIZADO: "${originalFilename}" - ${inserted}/${chunks.length} fragmentos vectorizados`);
        return { success: true, chunksProcessed: inserted };
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.error(`[RAG] ❌ Archivo no encontrado: ${error.path}`);
        } else {
            console.error("RAG Ingestion Error:", error.message || error);
        }
        throw error;
    }
}

/**
 * Elimina un documento físicamente y sus fragmentos vectoriales
 */
export async function purgeDocument(docId: string, filePath?: string) {
    try {
        // 1. Desvectorizar (eliminar de la base de datos de vectores)
        const deletedChunks = await prisma.documentChunk.deleteMany({
            where: { documentId: docId }
        });
        console.log(`[RAG] 🗑️ Desvectorizado: ID ${docId} (${deletedChunks.count} fragmentos eliminados)`);

        // 2. Eliminar archivo físico si se proporciona ruta
        if (filePath && !filePath.startsWith('system://')) {
            const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
            const absolutePath = path.join(process.cwd(), 'public', cleanPath);

            try {
                await fs.unlink(absolutePath);
                console.log(`[RAG] 🗑️ Archivo eliminado: ${absolutePath}`);
            } catch (err: any) {
                if (err.code === 'ENOENT') {
                    console.log(`[RAG] ℹ️ El archivo ya no existía en disco: ${absolutePath}`);
                } else {
                    console.error(`[RAG] ❌ Error eliminando archivo físico:`, err.message);
                }
            }
        }

        return { success: true, chunksDeleted: deletedChunks.count };
    } catch (error: any) {
        console.error(`[RAG] ❌ Error en purgeDocument (${docId}):`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Ingesta texto directo (para datos del sistema: Company Settings, Bancos, etc.)
 */
export async function ingestText(docId: string, title: string, text: string) {
    try {
        console.log(`[RAG] 🧠 Memorizando datos del sistema: "${title}" (ID: ${docId})`);

        // 1. Asegurar registro en ComplianceDocument (Virtual)
        const existing = await prisma.complianceDocument.findUnique({ where: { id: docId } });
        if (!existing) {
            await prisma.complianceDocument.create({
                data: {
                    id: docId,
                    filename: title + '.txt', // Virtual filename
                    path: 'system://' + docId, // Virtual path
                    documentType: 'SYSTEM',   // We might need to add this enum or just use 'OTHER'/'BASKET' if strict
                    isProcessed: true,
                    size: text.length
                }
            });
        } else {
            // Update timestamp
            await prisma.complianceDocument.update({
                where: { id: docId },
                data: { updatedAt: new Date(), isProcessed: true }
            });
        }

        // 2. Crear Chunks
        const chunks = chunkText(text);
        if (chunks.length === 0) return { success: false, reason: "Empty text" };

        // 3. Limpiar chunks antiguos
        await prisma.documentChunk.deleteMany({ where: { documentId: docId } });

        // 4. Insertar nuevos
        let inserted = 0;
        for (const chunk of chunks) {
            try {
                // VPS COMPATIBILITY: Use standard Prisma without embeddings
                await prisma.documentChunk.create({
                    data: {
                        id: randomUUID(),
                        documentId: docId,
                        content: chunk.content,
                        tokenCount: chunk.tokenCount,
                    }
                });
                inserted++;
            } catch (err: any) {
                console.error(`[RAG] Error en chunk de ${title}:`, err.message);
            }
        }

        return { success: true, chunksProcessed: inserted };

    } catch (error) {
        console.error("RAG Text Ingestion Error:", error);
        throw error;
    }
}

/**
 * Búsqueda de Chunks similares (DESACTIVADA POR COMPATIBILIDAD VPS)
 * Retorna solo los últimos chunks por ahora como fallback.
 */
export async function retrieveContext(query: string, maxResults = 3) {
    try {
        const chunks = await prisma.documentChunk.findMany({
            take: maxResults,
            orderBy: { createdAt: 'desc' },
            include: { document: true }
        });

        if (chunks.length === 0) return "No hay contexto disponible en la base de datos.";

        return chunks.map((c: any) => `[Fuente: ${c.document?.filename || 'Sistema'}]\n${c.content}`).join('\n\n---\n\n');
    } catch (err) {
        return "Error al recuperar contexto (IA en modo básico).";
    }
}
