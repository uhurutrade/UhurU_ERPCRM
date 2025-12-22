import { prisma } from '../prisma';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

const openai = new OpenAI();

if (!process.env.OPENAI_API_KEY) {
    console.warn("[RAG] CRITICAL: OPENAI_API_KEY is missing from environment!");
}

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
        console.log(`[RAG] ✓ Archivo leído: ${dataBuffer.length} bytes`);

        // 1. Extraer texto basado en extensión (Modo Blindado para Producción)
        let text = "";
        const ext = filePath.split('.').pop()?.toLowerCase();

        try {
            if (ext === 'pdf') {
                console.log(`[RAG] 🔍 Extrayendo texto de PDF con pdfjs-dist...`);

                // Estrategia 1: pdfjs-dist (Mozilla PDF.js) - Más compatible con Next.js standalone
                try {
                    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');

                    // FIX: Convert Buffer to Uint8Array as required by pdfjs-dist
                    const uint8Array = new Uint8Array(dataBuffer);

                    // FIX: Set cMapUrl to avoid 'BCMAP' warnings and font errors
                    // Assuming standard deployment path, or using local defaults if possible
                    // For Node.js environments without DOM, we might need to skip some font logic
                    const loadingTask = pdfjsLib.getDocument({
                        data: uint8Array,
                        cMapUrl: 'node_modules/pdfjs-dist/cmaps/',
                        cMapPacked: true,
                    });

                    const pdf = await loadingTask.promise;

                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items
                            .map((item: any) => item.str)
                            .join(' ');
                        fullText += pageText + '\n';
                    }
                    text = fullText;
                    console.log(`[RAG] ✅ PDF parseado con pdfjs-dist: ${text.length} caracteres, ${pdf.numPages} páginas`);
                } catch (pdfjsErr: any) {
                    console.warn(`[RAG] pdfjs-dist falló: ${pdfjsErr.message}`);

                    // Estrategia 2: Fallback a pdf-parse con require()
                    try {
                        console.log(`[RAG] Intentando fallback con pdf-parse (require)...`);
                        const pdfParse = require('pdf-parse');
                        const data = await pdfParse(dataBuffer);
                        text = data.text;
                        console.log(`[RAG] PDF parseado con pdf-parse: ${text.length} caracteres.`);
                    } catch (parseErr: any) {
                        console.warn(`[RAG] pdf-parse también falló: ${parseErr.message}`);

                        // Estrategia 3: Fallback a import dinámico de pdf-parse
                        try {
                            console.log(`[RAG] Intentando con import dinámico de pdf-parse...`);
                            const pdfModule = await import('pdf-parse') as any;
                            const parse = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule);
                            const data = await parse(dataBuffer);
                            text = data.text;
                            console.log(`[RAG] PDF parseado con import(): ${text.length} caracteres.`);
                        } catch (importErr: any) {
                            console.warn(`[RAG] Todas las estrategias de parsing fallaron: ${importErr.message}`);

                            // Estrategia 4: Extracción de texto bruto como último recurso
                            console.log(`[RAG] Usando extracción de texto bruto...`);
                            text = dataBuffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, '');
                            console.log(`[RAG] Texto bruto extraído: ${text.length} caracteres.`);
                        }
                    }
                }
            }
            else if (ext === 'docx') {
                const mammoth = require('mammoth');
                const m = mammoth.default || mammoth;
                const result = await m.extractRawText({ buffer: dataBuffer });
                text = result.value;
            }
            else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
                console.log(`[RAG] 👁️ Iniciando Vision OCR para "${originalFilename}"...`);
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
                // Log de progreso sin salto de línea para no saturar
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
                inserted++;
                if (inserted % 5 === 0 || inserted === chunks.length) {
                    console.log(`[RAG] Avance: ${inserted}/${chunks.length} fragmentos vectorizados.`);
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
    } catch (error) {
        console.error("RAG Ingestion Error:", error);
        throw error;
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
