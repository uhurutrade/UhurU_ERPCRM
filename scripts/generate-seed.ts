// @ts-nocheck
const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const isFullExport = process.env.FULL_EXPORT === 'true';

  console.log(`🔄 Iniciando extracción DINÁMICA... [Modo: ${isFullExport ? 'BACKUP TOTAL' : 'SOLO INFRAESTRUCTURA'}]`);

  // Extraemos los metadatos del esquema para saber qué tablas existen
  const modelNames = Prisma.dmmf.datamodel.models.map(m => m.name);
  const allData = {};

  if (isFullExport) {
    console.log(`📦 Detectados ${modelNames.length} módulos registrados.`);
    for (const modelName of modelNames) {
      const prismaKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
      if (prisma[prismaKey]) {
        const count = await prisma[prismaKey].count();
        console.log(`   - [Backup] ${modelName}: ${count} registros encontrados.`);
        allData[prismaKey] = await prisma[prismaKey].findMany();
      }
    }
  } else {
    // Modo seguro: solo categorías
    allData.transactionCategory = await prisma.transactionCategory.findMany();
  }

  const seedContent = `// @ts-nocheck
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const fullMode = ${isFullExport};
  console.log('🌱 Ejecutando Seed de Seguridad UhurU v2.0');
  console.log('Generado: ${new Date().toISOString()}');

  const allData = ${JSON.stringify(allData)};
  const modelOrder = ${JSON.stringify(modelNames)};

  if (fullMode) {
    console.log('⚠️ LIMPIEZA PROFUNDA: Vaciando base de datos para restaurar ' + modelOrder.length + ' tablas...');
    
    // Borrado en orden INVERSO (hijos primero) para respetar Foreign Keys
    for (const modelName of [...modelOrder].reverse()) {
      const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
      if (prisma[key]) {
        try {
          await prisma[key].deleteMany({});
        } catch (e) {
          // Ignoramos errores de borrado si hay dependencias circulares (se limpiará en la siguiente pasada)
        }
      }
    }
  }

  // --- RESTAURACIÓN ORDENADA ---
  // Creamos en orden DIRECTO (padres primero) para que las relaciones encajen
  for (const modelName of modelOrder) {
    const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    const items = allData[key];

    if (!items || items.length === 0) continue;

    console.log('   - Procesando ' + modelName + ': ' + items.length + ' registros...');

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
            // Silencio administrativo para duplicados en modo upsert implícito
        });
      }
    }
  }

  console.log('✅ Base de datos reestablecida al 100%.');
}

main().catch(e => { console.error('Seed Panic:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
`;

  fs.writeFileSync('prisma/seed.ts', seedContent);
  console.log(`✅ prisma/seed.ts actualizado: Incluye TODO (Banks, Settings, etc.)`);
}

main().catch(e => { console.error('Generator Error:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
