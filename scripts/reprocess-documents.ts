import { prisma } from '../lib/prisma';
import { ingestDocument } from '../lib/ai/rag-engine';

async function main() {
    console.log('--- Resonancia Vectorial: Re-procesando Documentos ---');

    // Solo procesar documentos físicos (omitir los virtuales de sistema)
    const docs = await prisma.complianceDocument.findMany({
        where: {
            NOT: [
                { path: { startsWith: 'system://' } },
                { documentType: 'SYSTEM' }
            ]
        }
    });

    console.log(`Encontrados ${docs.length} documentos físicos para re-vectorizar.`);

    for (const doc of docs) {
        if (!doc.path) continue;

        console.log(`\n[+] Analizando: ${doc.filename}`);
        try {
            const result = await ingestDocument(doc.id, doc.path);
            if (result.success) {
                console.log(`    ✅ Éxito: ${result.chunksProcessed} fragmentos vectorizados.`);
            } else {
                console.log(`    ℹ️  Omitido: ${result.reason}`);
            }
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                console.warn(`    ⚠️  Omitido: El archivo físico no existe en el VPS (${doc.path})`);
            } else {
                console.error(`    ❌ Error en ${doc.filename}: ${error.message}`);
            }
        }
    }

    console.log('\n--- Proceso Finalizado ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
