/**
 * Script para actualizar UHURU TRADE LTD con la dirección completa
 * 
 * Para ejecutar:
 * npx tsx prisma/update-company-address.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Actualizando dirección de UHURU TRADE LTD...');

    // Buscar el registro existente
    const existing = await prisma.companySettings.findFirst({
        where: { companyNumber: '15883242' }
    });

    if (!existing) {
        console.error('❌ No se encontró el registro de UHURU TRADE LTD');
        process.exit(1);
    }

    // Actualizar con la dirección completa
    const updated = await prisma.companySettings.update({
        where: { id: existing.id },
        data: {
            // Registered Office Address (única dirección para todo)
            registeredAddress: 'Unit 13 Freeland Park Wareham Road',
            registeredCity: 'Lytchett Matravers, Poole',
            registeredPostcode: 'BH16 6FA',
            registeredCountry: 'United Kingdom',

            // Trading Address (misma que la registrada)
            tradingAddress: 'Unit 13 Freeland Park Wareham Road',
            tradingCity: 'Lytchett Matravers, Poole',
            tradingPostcode: 'BH16 6FA',

            // Actualizar timestamp
            updatedAt: new Date(),
        },
    });

    console.log('✅ Dirección actualizada exitosamente!');
    console.log('\n📍 Dirección Registrada:');
    console.log('   Unit 13 Freeland Park Wareham Road');
    console.log('   Lytchett Matravers');
    console.log('   Poole');
    console.log('   BH16 6FA');
    console.log('   United Kingdom');
    console.log('\n📊 Registro completo:');
    console.log(updated);
}

main()
    .catch((e) => {
        console.error('❌ Error actualizando dirección:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
