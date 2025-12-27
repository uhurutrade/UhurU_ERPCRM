// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Extrayendo taxonomía del sistema para el seed de arquitectura...');

  // Solo extraemos las categorías para mantener la estructura fiscal sincronizada
  const transactionCategories = await prisma.transactionCategory.findMany();

  const seedContent = `// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sincronizando Taxonomía Fiscal (Modo Seguro - Sin borrar datos existentes)...');
  console.log('Generated at: ${new Date().toISOString()}');

  // --- Sincronización de Categorías ---
  // Utilizamos upsert para que:
  // 1. Si la categoría ya existe (por nombre), se actualiza su color si ha cambiado.
  // 2. Si no existe, se crea.
  // 3. NO borramos ninguna categoría que el usuario haya creado manualmente en el VPS.
  
  for (const cat of ${JSON.stringify(transactionCategories, null, 2)} as any[]) {
    await prisma.transactionCategory.upsert({
        where: { name: cat.name },
        update: {
          color: cat.color,
        },
        create: {
          name: cat.name,
          color: cat.color,
        }
    }).catch(e => console.log('Category sync error:', e.name, e.message));
  }

  console.log('✅ Arquitectura sincronizada perfectamente. Los datos de negocio del VPS han sido respetados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  fs.writeFileSync('prisma/seed.ts', seedContent);
  console.log('✅ prisma/seed.ts regenerado: MODO PROTECCIÓN TOTAL (Upsert por nombre, sin borrados).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
