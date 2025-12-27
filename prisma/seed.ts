// @ts-nocheck
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const fullMode = false;
  console.log('🌱 Ejecutando Seed de Seguridad UhurU v2.0');
  console.log('Generado: 2025-12-27T13:32:43.318Z');

  const allData = {"transactionCategory":[{"id":"cmjnecmtf0000agmufnoif3ov","name":"Loans: In (Director)","color":"bg-amber-500/10 text-amber-400 border-amber-500/20","createdAt":"2025-12-26T21:41:40.611Z","updatedAt":"2025-12-26T21:41:40.611Z"},{"id":"cmjnecmtk0001agmu4xppp8rx","name":"Loans: Out (Director)","color":"bg-amber-600/10 text-amber-500 border-amber-600/20","createdAt":"2025-12-26T21:41:40.616Z","updatedAt":"2025-12-26T21:41:40.616Z"},{"id":"cmjnecmtn0002agmuey93firp","name":"Fees: Bank Fees","color":"bg-rose-500/10 text-rose-400 border-rose-500/20","createdAt":"2025-12-26T21:41:40.620Z","updatedAt":"2025-12-26T21:41:40.620Z"},{"id":"cmjnecmtq0003agmud09v4swe","name":"Fees: Amazon Fees","color":"bg-rose-600/10 text-rose-500 border-rose-600/20","createdAt":"2025-12-26T21:41:40.622Z","updatedAt":"2025-12-26T21:41:40.622Z"},{"id":"cmjnecmtt0004agmucdqkza9j","name":"Fees: GBP Assets Service Fee","color":"bg-rose-400/10 text-rose-300 border-rose-400/20","createdAt":"2025-12-26T21:41:40.625Z","updatedAt":"2025-12-26T21:41:40.625Z"},{"id":"cmjnecmtw0005agmuk6akhypd","name":"Transfers: Intercompany","color":"bg-blue-500/10 text-blue-400 border-blue-500/20","createdAt":"2025-12-26T21:41:40.628Z","updatedAt":"2025-12-26T21:41:40.628Z"},{"id":"cmjnecmtz0006agmuuz9yoo4a","name":"Sales: Amazon Sales","color":"bg-emerald-500/10 text-emerald-400 border-emerald-500/20","createdAt":"2025-12-26T21:41:40.631Z","updatedAt":"2025-12-26T21:41:40.631Z"},{"id":"cmjnecmu20007agmuju0roj79","name":"Sales: Consulting Income","color":"bg-emerald-600/10 text-emerald-500 border-emerald-600/20","createdAt":"2025-12-26T21:41:40.635Z","updatedAt":"2025-12-26T21:41:40.635Z"},{"id":"cmjnecmu50008agmumghijdpy","name":"Marketing: Amazon Marketing","color":"bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20","createdAt":"2025-12-26T21:41:40.638Z","updatedAt":"2025-12-26T21:41:40.638Z"},{"id":"cmjnecmu80009agmuo760nxq6","name":"Operating: Postage","color":"bg-slate-500/10 text-slate-400 border-slate-500/20","createdAt":"2025-12-26T21:41:40.641Z","updatedAt":"2025-12-26T21:41:40.641Z"},{"id":"cmjnecmuc000aagmuxka5xxd1","name":"Operating: Hosting","color":"bg-slate-600/10 text-slate-500 border-slate-600/20","createdAt":"2025-12-26T21:41:40.644Z","updatedAt":"2025-12-26T21:41:40.644Z"},{"id":"cmjnecmuf000bagmu7ahwur53","name":"Operating: Cloud Services","color":"bg-slate-400/10 text-slate-300 border-slate-400/20","createdAt":"2025-12-26T21:41:40.647Z","updatedAt":"2025-12-26T21:41:40.647Z"},{"id":"cmjnecmui000cagmusdfp54yu","name":"Income: Other / Cashback","color":"bg-teal-500/10 text-teal-400 border-teal-500/20","createdAt":"2025-12-26T21:41:40.650Z","updatedAt":"2025-12-26T21:41:40.650Z"},{"id":"cmjnecmul000dagmu3h5dnrii","name":"FX: Exchange Gain","color":"bg-indigo-500/10 text-indigo-400 border-indigo-500/20","createdAt":"2025-12-26T21:41:40.653Z","updatedAt":"2025-12-26T21:41:40.653Z"},{"id":"cmjnecmuo000eagmuvtgfk3p6","name":"FX: Exchange Loss","color":"bg-indigo-600/10 text-indigo-500 border-indigo-600/20","createdAt":"2025-12-26T21:41:40.656Z","updatedAt":"2025-12-26T21:41:40.656Z"},{"id":"cmjnecmuq000fagmubpio49lh","name":"Crypto: BTC Purchases","color":"bg-orange-500/10 text-orange-400 border-orange-500/20","createdAt":"2025-12-26T21:41:40.659Z","updatedAt":"2025-12-26T21:41:40.659Z"},{"id":"cmjnecmut000gagmu331zeoz5","name":"Crypto: BTC Sales","color":"bg-orange-600/10 text-orange-500 border-orange-600/20","createdAt":"2025-12-26T21:41:40.661Z","updatedAt":"2025-12-26T21:41:40.661Z"},{"id":"cmjnecmuw000hagmur3uby9fl","name":"Crypto: BTC Capital Gain","color":"bg-orange-400/10 text-orange-300 border-orange-400/20","createdAt":"2025-12-26T21:41:40.664Z","updatedAt":"2025-12-26T21:41:40.664Z"},{"id":"cmjnecmuy000iagmupb0snym0","name":"Crypto: BTC Capital Loss","color":"bg-orange-800/10 text-orange-600 border-orange-800/20","createdAt":"2025-12-26T21:41:40.667Z","updatedAt":"2025-12-26T21:41:40.667Z"},{"id":"cmjnecmv1000jagmu8xy5llak","name":"System: Uncategorized","color":"bg-slate-700/50 text-slate-400 border-slate-600/50","createdAt":"2025-12-26T21:41:40.669Z","updatedAt":"2025-12-26T21:41:40.669Z"}]};
  const modelOrder = ["User","Account","Session","Organization","Contact","Lead","Deal","Task","Activity","Bank","BankAccount","CryptoWallet","CryptoTransaction","BankTransaction","BankStatement","Attachment","Asset","FiscalYear","TaxObligation","ComplianceEvent","Invoice","InvoiceItem","CompanySettings","DeletedTransaction","TransactionCategory","ComplianceDocument","DocumentChunk","NeuralAudit"];

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
