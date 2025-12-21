import { prisma } from '../lib/prisma';
import { ingestDocument } from '../lib/ai/rag-engine';

async function main() {
    console.log('--- Resonancia Vectorial: Re-procesando Documentos ---');

    const docs = await prisma.complianceDocument.findMany();

    console.log(`Encontrados ${docs.length} documentos para re-vectorizar.`);

    for (const doc of docs) {
        console.log(`\n[+] Procesando: ${doc.filename}`);
        try {
            const result = await ingestDocument(doc.id, doc.path);
            console.log(`    ✅ Éxito: ${result.chunksProcessed} fragmentos vectorizados.`);
        } catch (error: any) {
            console.error(`    ❌ Error en ${doc.filename}: ${error.message}`);
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
