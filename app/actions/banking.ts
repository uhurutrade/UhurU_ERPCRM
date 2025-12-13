'use server';

import { prisma } from '@/lib/prisma';
import { parseCSVLines, generateTransactionHash } from '@/lib/banking/parsers';
import { revalidatePath } from 'next/cache';

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

        const statement = await prisma.bankStatement.create({
            data: {
                filename: file.name,
            }
        });

        let importedCount = 0;
        let duplicateCount = 0;

        for (const row of rows) {
            const hash = generateTransactionHash(row);

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

export async function createBankAccount(formData: FormData) {
    try {
        const bankName = formData.get('bankName') as string;
        const accountName = formData.get('accountName') as string;
        const currency = formData.get('currency') as string;
        const accountNumber = formData.get('accountNumber') as string;
        const iban = formData.get('iban') as string;

        if (!bankName || !currency) {
            return { success: false, error: 'Bank name and currency are required' };
        }

        const account = await prisma.bankAccount.create({
            data: {
                bankName,
                accountName: accountName || null,
                currency,
                accountNumber: accountNumber || null,
                iban: iban || null,
            }
        });

        revalidatePath('/dashboard/banking');
        revalidatePath('/dashboard/banking/upload');

        return {
            success: true,
            message: 'Bank account created successfully',
            accountId: account.id
        };

    } catch (error) {
        console.error('Create bank account error:', error);
        return { success: false, error: 'Failed to create bank account' };
    }
}
