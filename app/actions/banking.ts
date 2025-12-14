'use server';

import { prisma } from '@/lib/prisma';
import { parseBankStatement } from '@/lib/banking-parser';
import { revalidatePath } from 'next/cache';

export async function uploadBankStatement(formData: FormData, bankAccountId: string) {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    try {
        const text = await file.text();
        const rows = parseBankStatement(text);

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
            // Check for duplicate based on hash
            const existing = await prisma.bankTransaction.findUnique({
                where: { hash: row.hash }
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

                    // Extended Fields
                    fee: row.fee,
                    externalId: row.externalId,
                    counterparty: row.counterparty,
                    merchant: row.merchant,
                    reference: row.reference,
                    type: row.type,
                    balanceAfter: row.balanceAfter,
                    exchangeRate: row.exchangeRate,

                    hash: row.hash,
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

    } catch (error: any) {
        console.error('Upload error:', error);
        return { success: false, error: error.message || 'Failed to process file' };
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
                bank: {
                    create: {
                        bankName,
                        bankType: "TRADITIONAL"
                    }
                },
                accountName: accountName || `${bankName} Account`,
                accountType: "CHECKING",
                currency,
                ...(accountNumber && { accountNumber }),
                ...(iban && { iban }),
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
