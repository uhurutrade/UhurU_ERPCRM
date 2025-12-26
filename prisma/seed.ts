// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding (Lossless Sync: CRM and System data)...');
  console.log('Generated at: 2025-12-26T09:44:55.616Z');

  // --- 1. Transaction Categories ---
  console.log('Upserting Categories...');
  for (const cat of [
  {
    "id": "cmj62s59a0002sft2iwrgtdu1",
    "name": "Loans",
    "color": "bg-yellow-400/10 text-yellow-300 border-yellow-400/20 hover:bg-yellow-400/20",
    "createdAt": "2025-12-14T18:45:43.966Z",
    "updatedAt": "2025-12-14T18:45:43.966Z"
  },
  {
    "id": "cmj62ua6y0003sft26nu3tbk7",
    "name": "Fees",
    "color": "bg-rose-400/10 text-rose-300 border-rose-400/20 hover:bg-rose-400/20",
    "createdAt": "2025-12-14T18:47:23.675Z",
    "updatedAt": "2025-12-14T18:47:23.675Z"
  },
  {
    "id": "cmj62oz0e0001sft22b5ep8rc",
    "name": "adios",
    "color": "bg-yellow-400/10 text-yellow-300 border-yellow-400/20 hover:bg-yellow-400/20",
    "createdAt": "2025-12-14T18:43:15.902Z",
    "updatedAt": "2025-12-16T17:35:42.291Z"
  }
] as any[]) {
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
  for (const user of [] as any[]) {
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
  for (const asset of [] as any[]) {
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
  for (const org of [
  {
    "id": "cmjbubqbd0000ha2lp9ftb957",
    "name": "Global Tech Solutions",
    "sector": "Technology",
    "website": "https://globaltech.example.com",
    "address": "123 Innovation Drive, London, UK",
    "createdAt": "2025-12-18T19:35:38.234Z",
    "updatedAt": "2025-12-18T19:35:38.234Z",
    "bankIban": null,
    "bankName": null,
    "bankSwift": null,
    "isBillable": false,
    "legalName": null,
    "taxId": null,
    "email": null,
    "phone": null,
    "city": null,
    "country": null,
    "postcode": null
  },
  {
    "id": "cmjbubqbo0001ha2l5skvvqm9",
    "name": "EcoEnergy Partners",
    "sector": "Renewable Energy",
    "website": "https://ecoenergy.example.com",
    "address": "45 Green Way, Manchester, UK",
    "createdAt": "2025-12-18T19:35:38.245Z",
    "updatedAt": "2025-12-18T19:35:38.245Z",
    "bankIban": null,
    "bankName": null,
    "bankSwift": null,
    "isBillable": false,
    "legalName": null,
    "taxId": null,
    "email": null,
    "phone": null,
    "city": null,
    "country": null,
    "postcode": null
  }
] as any[]) {
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
  for (const contact of [
  {
    "id": "cmjbubqbs0002ha2lij18uemd",
    "name": "Alice Thompson",
    "email": "alice@globaltech.example.com",
    "phone": "+44 7700 900123",
    "role": "CTO",
    "organizationId": "cmjbubqbd0000ha2lp9ftb957",
    "isClient": false,
    "createdAt": "2025-12-18T19:35:38.248Z",
    "updatedAt": "2025-12-18T19:35:38.248Z",
    "bankIban": null,
    "isBillable": false,
    "legalName": null,
    "taxId": null,
    "linkedin": null,
    "website": null,
    "address": null,
    "city": null,
    "country": null,
    "postcode": null
  },
  {
    "id": "cmjbubqbs0003ha2lztz1oomp",
    "name": "Bob Richards",
    "email": "bob@globaltech.example.com",
    "phone": "+44 7700 900456",
    "role": "Procurement Manager",
    "organizationId": "cmjbubqbd0000ha2lp9ftb957",
    "isClient": false,
    "createdAt": "2025-12-18T19:35:38.248Z",
    "updatedAt": "2025-12-18T19:35:38.248Z",
    "bankIban": null,
    "isBillable": false,
    "legalName": null,
    "taxId": null,
    "linkedin": null,
    "website": null,
    "address": null,
    "city": null,
    "country": null,
    "postcode": null
  },
  {
    "id": "cmjbubqbs0004ha2l85t1emdf",
    "name": "Charlie Smith",
    "email": "charlie@ecoenergy.example.com",
    "phone": "+44 7700 900789",
    "role": "CEO",
    "organizationId": "cmjbubqbo0001ha2l5skvvqm9",
    "isClient": false,
    "createdAt": "2025-12-18T19:35:38.248Z",
    "updatedAt": "2025-12-18T19:35:38.248Z",
    "bankIban": null,
    "isBillable": false,
    "legalName": null,
    "taxId": null,
    "linkedin": null,
    "website": null,
    "address": null,
    "city": null,
    "country": null,
    "postcode": null
  }
] as any[]) {
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
  for (const lead of [
  {
    "id": "cmjbubqby0005ha2l4vbvxkda",
    "name": "Future Mobility Corp",
    "email": "info@futuremobility.example.com",
    "source": "LinkedIn",
    "status": "QUALIFIED",
    "notes": "Interested in fleet management software.",
    "createdAt": "2025-12-18T19:35:38.254Z",
    "updatedAt": "2025-12-18T19:44:54.320Z"
  },
  {
    "id": "cmjbubqby0006ha2l8f435hvm",
    "name": "Quantum Systems",
    "email": "sales@quantumsys.example.com",
    "source": "Website",
    "status": "QUALIFIED",
    "notes": "Looking for a custom ERP solution.",
    "createdAt": "2025-12-18T19:35:38.254Z",
    "updatedAt": "2025-12-18T19:44:56.427Z"
  }
] as any[]) {
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
  for (const deal of [
  {
    "id": "cmjbunne30007gui8sm4tcb7t",
    "title": "Deal with Future Mobility Corp",
    "amount": "0",
    "currency": "GBP",
    "stage": "PROPOSAL",
    "closeDate": null,
    "organizationId": "cmjbubqbd0000ha2lp9ftb957",
    "createdAt": "2025-12-18T19:44:54.316Z",
    "updatedAt": "2025-12-18T20:35:19.916Z"
  },
  {
    "id": "cmjbubqc30008ha2lmwoutukl",
    "title": "EcoEnergy Solar Panel Deployment",
    "amount": "1",
    "currency": "GBP",
    "stage": "PROSPECTING",
    "closeDate": null,
    "organizationId": "cmjbubqbo0001ha2l5skvvqm9",
    "createdAt": "2025-12-18T19:35:38.259Z",
    "updatedAt": "2025-12-21T20:22:43.450Z"
  },
  {
    "id": "cmjctl9dv0002ia7lo246g33g",
    "title": "test",
    "amount": "1",
    "currency": "GBP",
    "stage": "WON",
    "closeDate": null,
    "organizationId": "cmjbubqbd0000ha2lp9ftb957",
    "createdAt": "2025-12-19T12:02:49.411Z",
    "updatedAt": "2025-12-21T20:23:13.046Z"
  },
  {
    "id": "cmjbubqc30007ha2l0j6tpsib",
    "title": "Global Tech Infrastructure Upgrade",
    "amount": "1",
    "currency": "GBP",
    "stage": "LOST",
    "closeDate": null,
    "organizationId": "cmjbubqbd0000ha2lp9ftb957",
    "createdAt": "2025-12-18T19:35:38.259Z",
    "updatedAt": "2025-12-21T20:23:27.161Z"
  },
  {
    "id": "cmjg6d0us0001mdti8eqywal5",
    "title": "Test",
    "amount": "1",
    "currency": "GBP",
    "stage": "NEGOTIATION",
    "closeDate": null,
    "organizationId": "cmjbubqbd0000ha2lp9ftb957",
    "createdAt": "2025-12-21T20:23:38.645Z",
    "updatedAt": "2025-12-21T20:23:38.645Z"
  }
] as any[]) {
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
  for (const act of [] as any[]) {
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
  for (const task of [] as any[]) {
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
