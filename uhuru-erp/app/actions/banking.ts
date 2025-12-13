'use server';

import { prisma } from '@/lib/prisma'; // Assuming prisma client instance at @/lib/prisma, if not I might need to create it
import { parseCSVLines, generateTransactionHash } from '@/lib/banking/parsers';
import { revalidatePath } from 'next/cache';

// Need to ensure prisma client is instantiated somewhere. 
// Usually in `lib/prisma.ts`. I will check if that exists later, or create it.

export async function uploadBankStatement(formData: FormData, bankAccountId: string) {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    try {
        const text = await file.text();
        const rows = parseCSVLines(text);

        if (rows.length === 0) {
            return { success: false, error: 'No valid transactions found in file' };
        }

        // Create BankStatement Record
        const statement = await prisma.bankStatement.create({
            data: {
                filename: file.name,
            }
        });

        let importedCount = 0;
        let duplicateCount = 0;

        for (const row of rows) {
            const hash = generateTransactionHash(row);

            // Check for duplicate
            const existing = await prisma.bankTransaction.findUnique({
                where: { hash }
            });

            if (existing) {
                duplicateCount++;
                continue;
            }

            await prisma.bankTransaction.create({
                data: {
                    date: row.date,
                    amount: row.amount,
                    description: row.description,
                    currency: row.currency,
                    hash: hash,
                    bankAccountId: bankAccountId,
                    bankStatementId: statement.id
                }
            });
            importedCount++;
        }

        revalidatePath('/dashboard/banking');

        return {
            success: true,
            message: `Imported ${importedCount} transactions. Skipped ${duplicateCount} duplicates.`
        };

    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: 'Failed to process file' };
    }
}
