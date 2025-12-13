/**
 * Seed script para insertar los datos de UHURU TRADE LTD
 * Basado en información de Companies House: https://find-and-update.company-information.service.gov.uk/company/15883242
 * 
 * Para ejecutar:
 * npx tsx prisma/seed-company-settings.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding UHURU TRADE LTD company settings...');

    // Verificar si ya existe un registro
    const existing = await prisma.companySettings.findFirst({
        where: { companyNumber: '15883242' }
    });

    if (existing) {
        console.log('⚠️  Company settings already exist. Updating...');

        const updated = await prisma.companySettings.update({
            where: { id: existing.id },
            data: {
                // Basic Company Information
                companyName: 'UHURU TRADE LTD',
                companyNumber: '15883242',
                incorporationDate: new Date('2024-08-07'),
                companyType: 'Ltd',
                sicCodes: '47910, 62012, 62020, 70229',

                // Registered Office Address
                // NOTA: Actualiza con tu dirección registrada real
                registeredAddress: 'TU DIRECCIÓN REGISTRADA AQUÍ',
                registeredCity: 'TU CIUDAD',
                registeredPostcode: 'TU CÓDIGO POSTAL',
                registeredCountry: 'United Kingdom',

                // Financial Year
                financialYearEnd: '31-08',
                accountsNextDueDate: new Date('2027-05-31'),
                confirmationNextDueDate: new Date('2026-08-09'),

                // Tax Information
                // NOTA: Actualiza según tu situación real
                vatRegistered: false, // Cambia a true si estás registrado
                vatNumber: null, // Ej: 'GB123456789'
                vatRegistrationDate: null,
                vatScheme: null, // Ej: 'Standard'
                vatReturnFrequency: null, // Ej: 'Quarterly'

                // HMRC Information
                utr: null, // Tu UTR aquí
                corporationTaxReference: null,
                payeReference: null,

                // Directors & Officers
                directors: 'Raul Ortega Irus',
                companySecretary: null,

                // Share Capital
                shareCapital: 1.00,
                numberOfShares: 1,

                // Accounting
                accountingSoftware: null, // Ej: 'Xero', 'QuickBooks'
                accountingMethod: null, // Ej: 'Accrual Basis'

                // Contact Information
                contactEmail: null, // Tu email
                contactPhone: null, // Tu teléfono
                website: 'https://uhurutrade.com',

                // Notes
                notes: 'Datos importados de Companies House el ' + new Date().toLocaleDateString('es-ES'),

                updatedAt: new Date(),
            },
        });

        console.log('✅ Company settings updated successfully!');
        console.log(updated);
    } else {
        const created = await prisma.companySettings.create({
            data: {
                // Basic Company Information
                companyName: 'UHURU TRADE LTD',
                companyNumber: '15883242',
                incorporationDate: new Date('2024-08-07'),
                companyType: 'Ltd',
                sicCodes: '47910, 62012, 62020, 70229',

                // Registered Office Address
                // NOTA: Actualiza con tu dirección registrada real
                registeredAddress: 'TU DIRECCIÓN REGISTRADA AQUÍ',
                registeredCity: 'TU CIUDAD',
                registeredPostcode: 'TU CÓDIGO POSTAL',
                registeredCountry: 'United Kingdom',

                // Financial Year
                financialYearEnd: '31-08',
                accountsNextDueDate: new Date('2027-05-31'),
                confirmationNextDueDate: new Date('2026-08-09'),

                // Tax Information
                // NOTA: Actualiza según tu situación real
                vatRegistered: false, // Cambia a true si estás registrado
                vatNumber: null, // Ej: 'GB123456789'
                vatRegistrationDate: null,
                vatScheme: null, // Ej: 'Standard'
                vatReturnFrequency: null, // Ej: 'Quarterly'

                // HMRC Information
                utr: null, // Tu UTR aquí
                corporationTaxReference: null,
                payeReference: null,

                // Directors & Officers
                directors: 'Raul Ortega Irus',
                companySecretary: null,

                // Share Capital
                shareCapital: 1.00,
                numberOfShares: 1,

                // Accounting
                accountingSoftware: null, // Ej: 'Xero', 'QuickBooks'
                accountingMethod: null, // Ej: 'Accrual Basis'

                // Contact Information
                contactEmail: null, // Tu email
                contactPhone: null, // Tu teléfono
                website: 'https://uhurutrade.com',

                // Notes
                notes: 'Datos importados de Companies House el ' + new Date().toLocaleDateString('es-ES'),
            },
        });

        console.log('✅ Company settings created successfully!');
        console.log(created);
    }

    console.log('\n📊 Información de Companies House:');
    console.log('   Company: UHURU TRADE LTD');
    console.log('   Number: 15883242');
    console.log('   Incorporated: 7 August 2024');
    console.log('   SIC Codes:');
    console.log('     - 47910: Retail sale via mail order houses or via Internet');
    console.log('     - 62012: Business and domestic software development');
    console.log('     - 62020: Information technology consultancy activities');
    console.log('     - 70229: Management consultancy activities other than financial management');
    console.log('\n   Next Accounts Due: 31 May 2027');
    console.log('   Next Confirmation Statement: 9 August 2026');
    console.log('\n⚠️  IMPORTANTE: Actualiza los siguientes campos con tu información real:');
    console.log('   - Registered Address (dirección registrada)');
    console.log('   - VAT information (si aplica)');
    console.log('   - HMRC references (UTR, Corporation Tax, PAYE)');
    console.log('   - Contact information (email, phone)');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding company settings:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
