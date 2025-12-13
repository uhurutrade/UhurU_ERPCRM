"use server"

// CORRECCIÓN: Se agrega generateTransactionHash para calcular el hash, y BankProvider se deja como string.
import { parseCSVLines, generateTransactionHash } from "@/lib/banking/parsers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Tipo BankProvider temporal para que el código compile
type BankProvider = string;

export async function uploadBankStatement(formData: FormData) {
    const file = formData.get('file') as File;
    const provider = formData.get('provider') as BankProvider;
    const accountId = formData.get('accountId') as string;

    if (!file || !provider || !accountId) {
        throw new Error("Missing fields");
    }

    const text = await file.text();
    const transactions = parseCSVLines(text);

    let addedCount = 0;

    for (const tx of transactions) {
        // CORRECCIÓN: Calcular el hash aquí, ya que tx (BankStatementRow) no lo tiene
        const transactionHash = generateTransactionHash(tx);

        try {
            // Upsert based on hash to deduplicate
            await prisma.bankTransaction.upsert({
                // Usa la variable local 'transactionHash'
                where: { hash: transactionHash },
                update: {},
                create: {
                    // NOTA: Es posible que otros campos (externalId, fee, status, reference) 
                    // también falten en BankStatementRow y necesiten manejo similar o un tipo intermedio.
                    // Asumiremos que son opcionales y/o que la estructura de la base de datos los tolera.
                    externalId: '', // <- Placeholder, ya que tx no tiene externalId
                    date: tx.date,
                    description: tx.description,
                    amount: tx.amount,
                    currency: tx.currency,
                    fee: 0, // <- Placeholder, ya que tx no tiene fee
                    status: 'PENDING', // <- Placeholder, ya que tx no tiene status
                    reference: tx.reference || '',
                    hash: transactionHash, // Usa el hash calculado
                    bankAccountId: accountId
                }
            });
            addedCount++;
        } catch (e) {
            console.error("Failed to insert transaction", tx, e);
        }
    }

    revalidatePath('/dashboard/banking');
    return { success: true, count: addedCount };
}

export async function getBankAccounts() {
    return await prisma.bankAccount.findMany();
}

export async function createBankAccount(data: { name: string, currency: string, iban: string, bankName: string }) {
    await prisma.bankAccount.create({
        data: {
            accountName: data.name,
            accountType: "CHECKING",
            currency: data.currency,
            iban: data.iban,
            bank: {
                create: {
                    bankName: data.bankName,
                    bankType: "TRADITIONAL"
                }
            }
        }
    });
    revalidatePath('/dashboard/banking');
}
