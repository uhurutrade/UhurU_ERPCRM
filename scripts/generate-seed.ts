// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Extrayendo datos de la base de datos local (filtrado por solicitud)...');

    // 1. Users
    const users = await prisma.user.findMany();

    // 2. CRM
    const organizations = await prisma.organization.findMany();
    const contacts = await prisma.contact.findMany();
    const deals = await prisma.deal.findMany();
    const leads = await prisma.lead.findMany();
    const activities = await prisma.activity.findMany();

    // 3. System metadata & General
    const transactionCategories = await prisma.transactionCategory.findMany();
    const tasks = await prisma.task.findMany();
    const assets = await prisma.asset.findMany();

    const seedContent = `// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding (Lossless Sync: CRM and System data)...');
  console.log('Generated at: ${new Date().toISOString()}');

  // --- 1. Transaction Categories ---
  console.log('Upserting Categories...');
  for (const cat of ${JSON.stringify(transactionCategories, null, 2)} as any[]) {
    await prisma.transactionCategory.upsert({
        where: { id: cat.id },
        update: {
            name: cat.name,
            color: cat.color,
            updatedAt: new Date(cat.updatedAt),
        },
        create: {
            ...cat,
            createdAt: new Date(cat.createdAt),
            updatedAt: new Date(cat.updatedAt),
        }
    }).catch(e => console.log('Category error:', e.message));
  }

  // --- 2. Users ---
  console.log('Upserting Users...');
  for (const user of ${JSON.stringify(users, null, 2)} as any[]) {
    await prisma.user.upsert({
      where: { email: user.email || '' },
      update: {
          name: user.name,
          image: user.image,
          role: user.role,
          updatedAt: new Date(user.updatedAt),
      },
      create: {
        ...user,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      } as any
    });
  }

  // --- 3. Assets ---
  console.log('Upserting Assets...');
  for (const asset of ${JSON.stringify(assets, null, 2)} as any[]) {
    await prisma.asset.upsert({
        where: { id: asset.id },
        update: {
            name: asset.name,
            purchaseDate: new Date(asset.purchaseDate),
            cost: Number(asset.cost),
            currency: asset.currency,
            type: asset.type,
            updatedAt: new Date(asset.updatedAt),
        },
        create: {
            ...asset,
            purchaseDate: new Date(asset.purchaseDate),
            cost: Number(asset.cost),
            createdAt: new Date(asset.createdAt),
            updatedAt: new Date(asset.updatedAt),
        }
    }).catch(e => console.log('Asset error:', e.message));
  }

  // --- 4. CRM: Organizations ---
  console.log('Upserting Organizations...');
  for (const org of ${JSON.stringify(organizations, null, 2)} as any[]) {
    await prisma.organization.upsert({
        where: { id: org.id },
        update: {
            name: org.name,
            sector: org.sector,
            website: org.website,
            address: org.address,
            bankIban: org.bankIban,
            bankName: org.bankName,
            bankSwift: org.bankSwift,
            isBillable: org.isBillable,
            legalName: org.legalName,
            taxId: org.taxId,
            email: org.email,
            phone: org.phone,
            city: org.city,
            country: org.country,
            postcode: org.postcode,
            updatedAt: new Date(org.updatedAt),
        },
        create: {
            ...org,
            createdAt: new Date(org.createdAt),
            updatedAt: new Date(org.updatedAt),
        }
    });
  }

  // --- 5. CRM: Contacts ---
  console.log('Upserting Contacts...');
  for (const contact of ${JSON.stringify(contacts, null, 2)} as any[]) {
    await prisma.contact.upsert({
        where: { id: contact.id },
        update: {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            role: contact.role,
            organizationId: contact.organizationId,
            isClient: contact.isClient,
            bankIban: contact.bankIban,
            isBillable: contact.isBillable,
            legalName: contact.legalName,
            taxId: contact.taxId,
            linkedin: contact.linkedin,
            website: contact.website,
            address: contact.address,
            city: contact.city,
            country: contact.country,
            postcode: contact.postcode,
            updatedAt: new Date(contact.updatedAt),
        },
        create: {
            ...contact,
            createdAt: new Date(contact.createdAt),
            updatedAt: new Date(contact.updatedAt),
        }
    }).catch(e => console.log('Contact error:', e.message));
  }
  
  // --- 6. CRM: Leads ---
  console.log('Upserting Leads...');
  for (const lead of ${JSON.stringify(leads, null, 2)} as any[]) {
      await prisma.lead.upsert({
          where: { id: lead.id },
          update: {
            name: lead.name,
            email: lead.email,
            source: lead.source,
            status: lead.status,
            notes: lead.notes,
            updatedAt: new Date(lead.updatedAt),
          },
          create: {
              ...lead,
              createdAt: new Date(lead.createdAt),
              updatedAt: new Date(lead.updatedAt),
          }
      }).catch(e => console.log('Lead error:', e.message));
  }

  // --- 7. CRM: Deals ---
  console.log('Upserting Deals...');
  for (const deal of ${JSON.stringify(deals, null, 2)} as any[]) {
    await prisma.deal.upsert({
        where: { id: deal.id },
        update: {
            title: deal.title,
            amount: deal.amount ? Number(deal.amount) : null,
            currency: deal.currency,
            stage: deal.stage,
            closeDate: deal.closeDate ? new Date(deal.closeDate) : null,
            organizationId: deal.organizationId,
            updatedAt: new Date(deal.updatedAt),
        },
        create: {
            ...deal,
            amount: deal.amount ? Number(deal.amount) : null,
            closeDate: deal.closeDate ? new Date(deal.closeDate) : null,
            createdAt: new Date(deal.createdAt),
            updatedAt: new Date(deal.updatedAt),
        }
    }).catch(e => console.log('Deal error:', e.message));
  }
  
  // --- 8. CRM: Activities ---
  console.log('Upserting Activities...');
  for (const act of ${JSON.stringify(activities, null, 2)} as any[]) {
      await prisma.activity.upsert({
          where: { id: act.id },
          update: {
              type: act.type,
              notes: act.notes,
              date: new Date(act.date),
              contactId: act.contactId,
          },
          create: {
              ...act,
              date: new Date(act.date),
          }
      }).catch(e => console.log('Activity error:', e.message));
  }

  // --- 9. Tasks ---
  console.log('Upserting Tasks...');
  for (const task of ${JSON.stringify(tasks, null, 2)} as any[]) {
      await prisma.task.upsert({
          where: { id: task.id },
          update: {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            completed: task.completed,
            assignedToId: task.assignedToId,
            updatedAt: new Date(task.updatedAt),
          },
          create: {
              ...task,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt),
          }
      }).catch(e => console.log('Task error:', e.message));
  }

  console.log('✅ Seeding finished.');
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
    console.log('✅ prisma/seed.ts generado: SIN BORRADO, solo Upsert para CRM y sistema.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
