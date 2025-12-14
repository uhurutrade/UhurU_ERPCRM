
import { parse } from 'csv-parse/sync';
import { startOfDay, parseISO } from 'date-fns';
import crypto from 'crypto';

export type NormalizedTransaction = {
    date: Date;
    description: string;
    amount: number;
    currency: string;
    fee: number;
    externalId: string | null;
    counterparty: string | null;
    merchant: string | null;
    reference: string | null;
    type: string | null;
    category: string | null;
    balanceAfter: number | null;
    exchangeRate: number | null;
    hash: string;
};

// Helper: Normalize Date
// Handles multiple formats: YYYY-MM-DD, DD/MM/YYYY, etc.
function normalizeDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    try {
        // Try standard ISO first
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date;

        // Try DD/MM/YYYY
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            // assumed dd/mm/yyyy
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
    } catch (e) {
        console.error("Date parsing error", dateStr);
    }
    return new Date();
}

// Helper: Create Hash
function createTransactionHash(tx: Partial<NormalizedTransaction>): string {
    const data = `${tx.date?.toISOString()}|${tx.amount}|${tx.currency}|${tx.description}|${tx.externalId || ''}|${tx.balanceAfter || ''}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

export function parseBankStatement(fileContent: string): NormalizedTransaction[] {
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true
    });

    if (records.length === 0) return [];

    const headers = Object.keys(records[0]);

    // Detect Bank Type
    if (headers.includes('TransferWise ID')) {
        return parseWise(records);
    } else if (headers.includes('Card number') && headers.includes('Sort code') === false) {
        // Heuristic for Revolut (usually has 'Card number', 'Balance', 'Fee')
        // User provided: "Date started (UTC)", "Card number", "Card label"
        if (headers.includes('Date started (UTC)')) {
            return parseRevolut(records);
        }
        // Fallback check
        if (headers.includes('Product') && headers.includes('Completed Date')) {
            return parseRevolut(records); // Some revolut formats
        }
        return parseRevolut(records); // Defaulting based on user input order guess
    } else if (headers.includes('Transaction type') && headers.includes('Payee account number')) {
        return parseWorldFirst(records);
    }

    throw new Error('Unsupported bank statement format. Allowed: Wise, Revolut, WorldFirst.');
}

// --- WISE PARSER ---
function parseWise(records: any[]): NormalizedTransaction[] {
    return records.map(row => {
        // Wise: Amount is usually positive/negative in 'Amount' column.
        // Or sometimes split.
        // User said: Amount, Credit, Debit? No, header says "Amount".
        const amount = parseFloat(row['Amount']);
        const fee = parseFloat(row['Total fees'] || '0');
        const date = normalizeDate(row['Date']);

        const tx: NormalizedTransaction = {
            date: date,
            description: row['Description'] || row['Merchant'] || 'Wise Transaction',
            amount: amount,
            currency: row['Currency'],
            fee: Math.abs(fee),
            externalId: row['TransferWise ID'],
            counterparty: row['Payee Name'] || row['Payer Name'],
            merchant: row['Merchant'],
            reference: row['Payment Reference'],
            type: 'TRANSFER', // Wise is mostly transfers/card
            category: null,
            balanceAfter: row['Running Balance'] ? parseFloat(row['Running Balance']) : null,
            exchangeRate: row['Exchange Rate'] ? parseFloat(row['Exchange Rate']) : null,
            hash: ''
        };
        tx.hash = createTransactionHash(tx);
        return tx;
    });
}

// --- REVOLUT PARSER ---
function parseRevolut(records: any[]): NormalizedTransaction[] {
    return records.map(row => {
        // Revolut often uses 'Date started (UTC)' or 'Completed Date'
        const dateStr = row['Date started (UTC)'] || row['Date completed (UTC)'] || row['Date'];
        const date = normalizeDate(dateStr);

        // Amount field
        let amount = parseFloat(row['Amount']);
        const fee = parseFloat(row['Fee'] || '0');

        const tx: NormalizedTransaction = {
            date: date,
            description: row['Description'],
            amount: amount, // Revolut usually has negative for spend
            currency: row['Currency'] || row['Payment currency'], // careful with multi-currency
            fee: Math.abs(fee),
            externalId: row['ID'] || '', // Revolut ID?
            counterparty: row['Payer'], // Or 'Beneficiary'? Header says 'Payer'
            merchant: null,
            reference: row['Reference'],
            type: row['Type'], // 'CARD_PAYMENT', 'TRANSFER'
            category: row['Category'] || null,
            balanceAfter: row['Balance'] ? parseFloat(row['Balance']) : null,
            exchangeRate: row['Exchange rate'] ? parseFloat(row['Exchange rate']) : null,
            hash: ''
        };
        // If externalId is missing (CSV sometimes lacks it), rely on hash
        tx.hash = createTransactionHash(tx);
        return tx;
    });
}

// --- WORLDFIRST PARSER ---
function parseWorldFirst(records: any[]): NormalizedTransaction[] {
    return records.map(row => {
        // Headers: Transaction type, Description, Currency, Amount entered, Out, Balance, Transaction ID...
        // 'Amount entered' (In?) vs 'Out' (Out?)
        // Or 'Transaction amount'?
        // User said: "Amount entered", "Out".
        // Let's look for "Transaction amount", or calculate Net.

        let amount = 0;
        if (row['Transaction amount']) {
            amount = parseFloat(row['Transaction amount']);
        } else if (row['Amount entered'] && parseFloat(row['Amount entered']) > 0) {
            amount = parseFloat(row['Amount entered']);
        } else if (row['Out'] && parseFloat(row['Out']) > 0) {
            amount = -parseFloat(row['Out']);
        }

        const date = normalizeDate(row['Transaction Creation Date'] || row['Date']);

        const tx: NormalizedTransaction = {
            date: date,
            description: row['Description'],
            amount: amount,
            currency: row['Transaction currency'] || row['Currency'],
            fee: row['Payment fee'] ? parseFloat(row['Payment fee']) : 0,
            externalId: row['Transaction ID'],
            counterparty: row['Payee name'] || row['Payer name'],
            merchant: null,
            reference: row['Payment reference number'],
            type: row['Transaction type'],
            category: null,
            balanceAfter: row['Balance'] ? parseFloat(row['Balance']) : null,
            exchangeRate: row['Rate'] ? parseFloat(row['Rate']) : null,
            hash: ''
        };
        tx.hash = createTransactionHash(tx);
        return tx;
    });
}
