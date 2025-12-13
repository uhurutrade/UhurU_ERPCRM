"use server"

import { parseBankCSV, BankProvider } from "@/lib/banking/parsers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function uploadBankStatement(formData: FormData) {
    const file = formData.get('file') as File;
    const provider = formData.get('provider') as BankProvider;
    const accountId = formData.get('accountId') as string;

    if (!file || !provider || !accountId) {
        throw new Error("Missing fields");
    }

    const text = await file.text();
    const transactions = await parseBankCSV(text, provider);

    let addedCount = 0;

    for (const tx of transactions) {
        try {
            // Upsert based on hash to deduplicate
            await prisma.bankTransaction.upsert({
                where: { hash: tx.hash },
                update: {}, // Don't update if exists? Or update description? Let's skip.
                create: {
                    externalId: tx.externalId,
                    date: tx.date,
                    description: tx.description,
                    amount: tx.amount,
                    currency: tx.currency,
                    fee: tx.fee,
                    status: tx.status,
                    reference: tx.reference,
                    hash: tx.hash,
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
            currency: data.currency,
            iban: data.iban,
            bankName: data.bankName
        }
    });
    revalidatePath('/dashboard/banking');
}
