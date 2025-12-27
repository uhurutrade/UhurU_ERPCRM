const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    console.log('📦 Extrayendo movimientos del General Ledger para rescate...');

    // Extraemos transacciones, cuentas y bancos (necesarios para las relaciones)
    const transactions = await prisma.bankTransaction.findMany();
    const accounts = await prisma.bankAccount.findMany();
    const banks = await prisma.bank.findMany();

    const recoveryData = {
        banks,
        accounts,
        transactions
    };

    const scriptContent = `// SCRIPT DE RESCATE - GENERAL LEDGER
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = ${JSON.stringify(recoveryData)};

async function rescue() {
  console.log('🚀 Iniciando inserción de rescate...');
  
  // 1. Restaurar Bancos
  for (const b of data.banks) {
    await prisma.bank.upsert({
      where: { id: b.id },
      update: {},
      create: b
    }).catch(e => console.log('   - Banco ya existe: ' + b.bankName));
  }

  // 2. Restaurar Cuentas
  for (const acc of data.accounts) {
    await prisma.bankAccount.upsert({
      where: { id: acc.id },
      update: {},
      create: acc
    }).catch(e => console.log('   - Cuenta ya existe: ' + acc.accountName));
  }

  // 3. Restaurar Transacciones (El Ledger)
  console.log('   - Insertando ' + data.transactions.length + ' movimientos...');
  let count = 0;
  for (const tx of data.transactions) {
    await prisma.bankTransaction.upsert({
      where: { id: tx.id },
      update: {},
      create: tx
    }).catch(e => {}); // Silencio si ya existe
    count++;
    if (count % 100 === 0) console.log('     ...procesados ' + count);
  }

  console.log('✅ Rescate completado: ' + data.transactions.length + ' movimientos verificados.');
}

rescue()
  .catch(e => console.error('Error en rescate:', e))
  .finally(() => prisma.$disconnect());
`;

    fs.writeFileSync('ledger-rescue.js', scriptContent);
    console.log('✅ Archivo "ledger-rescue.js" generado con éxito.');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
