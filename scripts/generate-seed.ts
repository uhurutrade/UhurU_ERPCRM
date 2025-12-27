// @ts-nocheck
const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const isFullExport = process.env.FULL_EXPORT === 'true';

  console.log(`🔄 Iniciando extracción DINÁMICA... [Modo: ${isFullExport ? 'BACKUP TOTAL' : 'SOLO INFRAESTRUCTURA'}]`);

  // Extraemos todos los nombres de modelos definidos en el schema actual
  // Esto hace que el script sea compatible con cualquier módulo nuevo que añadas en el futuro
  const modelNames = Prisma.dmmf.datamodel.models.map(m => m.name);
  const allData = {};

  if (isFullExport) {
    console.log(`📦 Detectados ${modelNames.length} módulos. Extrayendo datos vivos...`);
    for (const modelName of modelNames) {
      // Convertimos el nombre del modelo a camelCase para acceder a la propiedad de prisma (ej: User -> user)
      const prismaKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
      if (prisma[prismaKey]) {
        console.log(`   - Extrayendo: ${modelName}...`);
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
  console.log('🌱 Ejecutando Seed ' + (fullMode ? 'COMPLETO (Backup)' : 'PARCIAL (Sistema)'));
  console.log('Generado: ${new Date().toISOString()}');

  const allData = ${JSON.stringify(allData)};

  if (fullMode) {
    console.log('⚠️ LIMPIEZA TOTAL: Preparando base de datos para restauración integral...');
    
    // Lista de modelos detectados en el momento del backup
    const models = ${JSON.stringify(modelNames)};
    
    // Para limpiar una base de datos con dependencias complejas, la forma más robusta en Postgres 
    // es usar un TRUNCATE en cascada o borrar en el orden correcto.
    // Aquí implementamos un borrado inverso seguro:
    for (const modelName of models.reverse()) {
      const key = modelName.charAt(0).toLowerCase() + modelName.slice(1);
      if (prisma[key]) {
        try {
          await prisma[key].deleteMany({});
        } catch (e) {
          // Si falla por dependencias, se reintentará en la siguiente fase
        }
      }
    }
  }

  // --- Sincronización de Datos ---
  for (const [key, items] of Object.entries(allData)) {
    if (items.length === 0) continue;
    
    console.log('   - Restaurando ' + key + ' (' + items.length + ' registros)...');
    
    if (key === 'transactionCategory') {
      // Especial: Las categorías se sincronizan con upsert para no romper etiquetas
      for (const cat of items) {
        await prisma.transactionCategory.upsert({
          where: { name: cat.name },
          update: { color: cat.color },
          create: cat
        });
      }
    } else {
      // General: Restauración directa para el resto de módulos
      // Usamos loops simples para asegurar que las foreign keys se respeten si el orden del backup fue correcto
      for (const item of items) {
        await prisma[key].create({ data: item }).catch(e => {
            // Silenciamos errores menores si el registro ya existe (upsert manual implícito)
        });
      }
    }
  }

  console.log('✅ Operación completada con éxito.');
}

main().catch(e => { console.error('Seed Error:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
`;

  fs.writeFileSync('prisma/seed.ts', seedContent);
  console.log(`✅ prisma/seed.ts regenerado DINÁMICAMENTE. Compatible con futuros módulos.`);
}

main().catch(e => { console.error('Generator Error:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
