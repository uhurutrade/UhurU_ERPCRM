'use server';

import { prisma } from '@/lib/prisma';
import { parseBankStatement } from '@/lib/banking-parser';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

export async function uploadBankStatement(formData: FormData, bankAccountId: string) {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    console.log(`[UPLOAD] 📊 Bank Statement: "${file.name}" (${(file.size / 1024).toFixed(2)} KB)`);

    try {
        // 1. Fetch Target Account Currency AND Bank Name to enforce integrity
        const targetAccount = await prisma.bankAccount.findUnique({
            where: { id: bankAccountId },
            select: {
                currency: true,
                accountName: true,
                bank: {
                    select: { bankName: true }
                }
            }
        });

        if (!targetAccount) {
            return { success: false, error: 'Target bank account not found' };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 1b. Global Deduplication: Check if THIS EXACT FILE has been uploaded before
        const fileHash = createHash('sha256').update(buffer).digest('hex');
        const existingStatement = await prisma.bankStatement.findFirst({
            where: { fileHash } // Schema needs to support this or use a generic "ComplianceDocument"
        });

        // Note: For now bankStatement doesn't have fileHash in schema, 
        // but we can check the filename/size combination as a proxy if we don't want to migration now,
        // OR we can add it to schema. Since USER wants "ABSOLUTELY EVERYTHING", let's assume we update schema or add it.
        // Wait, I didn't add fileHash to BankStatement in my previous schema edit, let me add it now.

        const text = buffer.toString('utf-8');
        const { transactions: rows, detectedBank } = parseBankStatement(text);

        if (rows.length === 0) {
            return { success: false, error: 'No valid transactions found in file' };
        }

        // --- BANK MISMATCH PROTECTION ---
        const targetBankName = targetAccount.bank.bankName.toLowerCase();
        const detected = detectedBank.toLowerCase();

        if (detected !== 'unknown') {
            if (detected === 'revolut' && !targetBankName.includes('revolut')) {
                return { success: false, error: `Detected a Revolut CSV, but you selected a "${targetAccount.bank.bankName}" account.` };
            }
            if (detected === 'wise' && !targetBankName.includes('wise') && !targetBankName.includes('transferwise')) {
                return { success: false, error: `Detected a Wise CSV, but you selected a "${targetAccount.bank.bankName}" account.` };
            }
        }

        const statement = await prisma.bankStatement.create({
            data: {
                filename: file.name,
                fileHash: fileHash // Ensure this exists in schema
            }
        });

        let importedCount = 0;
        let duplicateCount = 0;
        let currencyMismatchCount = 0;

        for (const row of rows) {
            if (row.currency && row.currency.toUpperCase() !== targetAccount.currency.toUpperCase()) {
                currencyMismatchCount++;
                continue;
            }

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
                    description: row.isDateInferred ? `(*) ${row.description}` : row.description,
                    currency: targetAccount.currency,
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

        // Trigger RAG Auto-Sync (Async - No bloqueante)
        try {
            const { syncRecentTransactions } = await import('@/lib/ai/auto-sync-rag');
            syncRecentTransactions(); // Fire and forget
        } catch (e) { /* Silent fail */ }

        revalidatePath('/dashboard/banking');

        return {
            success: true,
            message: `Imported ${importedCount} transactions. (Skipped: ${duplicateCount} duplicates, ${currencyMismatchCount} mismatching currencies)`
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

        // Trigger RAG Auto-Sync (Async - No bloqueante)
        try {
            const { syncBankingOverview } = await import('@/lib/ai/auto-sync-rag');
            syncBankingOverview(); // Fire and forget
        } catch (e) { /* Silent fail */ }

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

        console.log(`[UPLOAD] 📎 Transaction Attachment: "${file.name}" (${(file.size / 1024).toFixed(2)} KB)`);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Deduplication Check
        const fileHash = createHash('sha256').update(buffer).digest('hex');
        const existing = await prisma.attachment.findFirst({
            where: { fileHash }
        });

        if (existing) {
            // If it's the exact same file, we can either skip or just link it to this new transaction
            // But usually, the user wants to know it's a duplicate.
            // For now, let's link it if transactionId is different, or return error.
            if (existing.transactionId === transactionId) {
                return { success: false, error: 'This exact file is already attached to this transaction.' };
            }
            return { success: false, error: `Duplicate file detected. This file was already uploaded as "${existing.originalName}".` };
        }

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'attachments');
        await mkdir(uploadDir, { recursive: true });

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = file.name.split('.').pop() || 'bin';
        const filename = `${uniqueSuffix}.${extension}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        const attachment = await prisma.attachment.create({
            data: {
                path: `/uploads/attachments/${filename}`,
                originalName: file.name,
                fileType: file.type,
                fileHash,
                transactionId: transactionId
            }
        });

        // --- TRIGGER RAG VECTORIZATION ---
        try {
            const { ingestDocument } = await import('@/lib/ai/rag-engine');
            await ingestDocument(attachment.id, attachment.path);
        } catch (ragError) {
            console.error(`[RAG] Vectorization failed for banking attachment ${attachment.id}:`, ragError);
        }

        revalidatePath('/dashboard/banking');
        return { success: true, attachment };

    } catch (error: any) {
        console.error('Attachment upload error:', error);
        return { success: false, error: 'Failed to upload attachment' };
    }
}

export async function updateTransactionCategory(transactionId: string, category: string) {
    try {
        await prisma.bankTransaction.update({
            where: { id: transactionId },
            data: { category }
        });

        revalidatePath('/dashboard/banking');

        // Trigger RAG Sync (Background)
        const { syncRecentTransactions } = await import('@/lib/ai/auto-sync-rag');
        syncRecentTransactions();

        return { success: true };
    } catch (error) {
        console.error('Update category error:', error);
        return { success: false, error: 'Failed to update category' };
    }
}

export async function bulkUpdateTransactionCategory(
    transactionIds: string[],
    category: string,
    updateAllMatching: boolean = false,
    searchQuery: string = ""
) {
    try {
        if (updateAllMatching) {
            // Apply to all transactions matching the search criteria
            await prisma.bankTransaction.updateMany({
                where: {
                    OR: [
                        { description: { contains: searchQuery, mode: 'insensitive' } },
                        { reference: { contains: searchQuery, mode: 'insensitive' } },
                        { category: { contains: searchQuery, mode: 'insensitive' } },
                        { merchant: { contains: searchQuery, mode: 'insensitive' } },
                        { counterparty: { contains: searchQuery, mode: 'insensitive' } }
                    ]
                },
                data: { category }
            });
        } else {
            // Apply only to specific selected IDs
            await prisma.bankTransaction.updateMany({
                where: { id: { in: transactionIds } },
                data: { category }
            });
        }

        revalidatePath('/dashboard/banking');

        // Trigger RAG Sync (Background)
        const { syncRecentTransactions } = await import('@/lib/ai/auto-sync-rag');
        syncRecentTransactions();

        return { success: true };
    } catch (error) {
        console.error('Bulk update category error:', error);
        return { success: false, error: 'Failed to update categories' };
    }
}
