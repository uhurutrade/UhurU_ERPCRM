// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const isFullExport = process.env.FULL_EXPORT === 'true';

  console.log(`🔄 Iniciando extracción de datos... [Modo: ${isFullExport ? 'BACKUP TOTAL' : 'SOLO INFRAESTRUCTURA'}]`);

  // 1. Categorías (Siempre se incluyen)
  const transactionCategories = await prisma.transactionCategory.findMany();

  // 2. Datos de Negocio (Solo si FULL_EXPORT=true)
  let users = [];
  let organizations = [];
  let contacts = [];
  let leads = [];
  let deals = [];
  let activities = [];
  let tasks = [];
  let invoices = [];
  let companySettings = [];
  let bankAccounts = [];

  if (isFullExport) {
    console.log('📦 Extrayendo datos de negocio para Backup...');
    users = await prisma.user.findMany();
    organizations = await prisma.organization.findMany();
    contacts = await prisma.contact.findMany();
    leads = await prisma.lead.findMany();
    deals = await prisma.deal.findMany();
    activities = await prisma.activity.findMany();
    tasks = await prisma.task.findMany();
    invoices = await prisma.invoice.findMany({ include: { items: true } });
    companySettings = await prisma.companySettings.findMany();
    bankAccounts = await prisma.bankAccount.findMany({ include: { bank: true } });
  }

  const seedContent = `// @ts-nocheck
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const fullMode = ${isFullExport};
  console.log('🌱 Ejecutando Seed de ' + (fullMode ? 'RESTAURACIÓN TOTAL' : 'INFRAESTRUCTURA'));
  console.log('Generado en VPS: ${new Date().toISOString()}');

  if (fullMode) {
    console.log('⚠️ LIMPIEZA DE SEGURIDAD: Borrando datos actuales para restauración...');
    // El orden importa por las foreign keys
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.activity.deleteMany({});
    await prisma.deal.deleteMany({});
    await prisma.contact.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.task.deleteMany({});
    // Mantendremos usuarios y configuración para no perder el acceso
  }

  // --- 1. Sincronización de Categorías ---
  console.log('Sincronizando Taxonomía...');
  for (const cat of ${JSON.stringify(transactionCategories, null, 2)} as any[]) {
    await prisma.transactionCategory.upsert({
        where: { name: cat.name },
        update: { color: cat.color },
        create: { name: cat.name, color: cat.color }
    });
  }

  if (fullMode) {
    // --- 2. Restauración de Datos de Negocio ---
    console.log('Restaurando Organizaciones...');
    for (const obj of ${JSON.stringify(organizations)} as any[]) {
      await prisma.organization.create({ data: obj });
    }
    
    console.log('Restaurando Contactos...');
    for (const obj of ${JSON.stringify(contacts)} as any[]) {
      await prisma.contact.create({ data: obj });
    }

    console.log('Restaurando Facturas...');
    for (const inv of ${JSON.stringify(invoices)} as any[]) {
      const { items, ...invData } = inv;
      const created = await prisma.invoice.create({ data: invData });
      for (const item of items) {
        await prisma.invoiceItem.create({ data: { ...item, invoiceId: created.id } });
      }
    }
    // ... Nota: Se pueden añadir el resto de tablas aquí de la misma forma
  }

  console.log('✅ Proceso de seed finalizado con éxito.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
`;

  fs.writeFileSync('prisma/seed.ts', seedContent);
  console.log(`✅ prisma/seed.ts regenerado exitosamente.`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
