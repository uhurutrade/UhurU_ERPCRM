'use server';

import { prisma } from '@/lib/prisma';
import { parseBankStatement } from '@/lib/banking-parser';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function uploadBankStatement(formData: FormData, bankAccountId: string) {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    try {
        // 1. Fetch Target Account Currency to enforce integrity
        const targetAccount = await prisma.bankAccount.findUnique({
            where: { id: bankAccountId },
            select: { currency: true, accountName: true }
        });

        if (!targetAccount) {
            return { success: false, error: 'Target bank account not found' };
        }

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
        let currencyMismatchCount = 0;

        for (const row of rows) {
            // STRICT CURRENCY CHECK
            // If the row has a currency defined, it MUST match the target account.
            // This allows uploading a "All Currencies" CSV and safely extracting only the relevant ones.
            if (row.currency && row.currency.toUpperCase() !== targetAccount.currency.toUpperCase()) {
                currencyMismatchCount++;
                continue;
            }

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
                    currency: targetAccount.currency, // Enforce target currency consistency

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
            message: `Success! Imported ${importedCount} transactions. (Skipped: ${duplicateCount} duplicates, ${currencyMismatchCount} other currencies)`
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

export async function uploadTransactionAttachment(formData: FormData, transactionId: string) {
    try {
        const file = formData.get('file') as File;
        if (!file) return { success: false, error: 'No file provided' };

        // 1. Save file locally (VPS-friendly)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'attachments');
        await mkdir(uploadDir, { recursive: true });

        // Unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = file.name.split('.').pop() || 'bin';
        const filename = `${uniqueSuffix}.${extension}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // 2. Create DB Record
        const attachment = await prisma.attachment.create({
            data: {
                path: `/uploads/attachments/${filename}`,
                originalName: file.name,
                fileType: file.type,
                transactionId: transactionId
            }
        });

        revalidatePath('/dashboard/banking');
        return { success: true, attachment };
    } catch (error: any) {
        console.error('Attachment upload error:', error);
        return { success: false, error: 'Failed to upload attachment' };
    }
}
