// @ts-nocheck
const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
    const isFullExport = true;

    console.log(`🔄 Iniciando extracción DINÁMICA de Backup...`);

    const modelNames = Prisma.dmmf.datamodel.models.map(m => m.name);
    const allData = {};

    console.log(`📦 Detectados ${modelNames.length} módulos registrados.`);
    for (const modelName of modelNames) {
        const prismaKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
        if (prisma[prismaKey]) {
            const count = await prisma[prismaKey].count();
            console.log(`   - [Backup] ${modelName}: ${count} registros encontrados.`);
            allData[prismaKey] = await prisma[prismaKey].findMany();
        }
    }

    const seedContent = `// @ts-nocheck
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const fullMode = false; // Seguridad: No borra datos existentes por defecto
  console.log('🌱 Ejecutando Restauración desde Seed (Modo Seguro)');
  console.log('Generado: ${new Date().toISOString()}');

  const allData = ${JSON.stringify(allData)};
  const modelOrder = ${JSON.stringify(modelNames)};

  if (fullMode) {
    console.log('⚠️ LIMPIEZA PROFUNDA: Vaciando base de datos...');
    for (const modelName of [...modelOrder].reverse()) {
      const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
      if (prisma[key]) {
        try { await prisma[key].deleteMany({}); } catch (e) {}
      }
    }
  }

  for (const modelName of modelOrder) {
    const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    const items = allData[key];
    if (!items || items.length === 0) continue;

    console.log('   - Restaurando ' + modelName + ': ' + items.length + ' registros...');

    if (key === 'transactionCategory') {
      for (const cat of items) {
        await prisma.transactionCategory.upsert({
          where: { name: cat.name },
          update: { color: cat.color },
          create: cat
        });
      }
    } else {
      for (const item of items) {
        await prisma[key].create({ data: item }).catch(e => {
            // Ignorado si ya existe (duplicados)
        });
      }
    }
  }
  console.log('✅ Restauración completada.');
}

main().catch(e => { console.error('Seed Error:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
`;

    fs.writeFileSync('prisma/seed.ts', seedContent);
    console.log(`✅ prisma/seed.ts actualizado con éxito.`);
}

main().catch(e => { console.error('Generator Error:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
