
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
    isDateInferred?: boolean;
};

// Helper: Normalize Date
// Returns { date, inferred } tuple to track fallbacks
function normalizeDate(dateStr: string): { date: Date, inferred: boolean } {
    if (!dateStr) return { date: new Date(), inferred: true };

    try {
        const cleanStr = dateStr.trim();

        // 1. DD-MM-YYYY (e.g. 14-12-2025)
        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanStr)) {
            const [day, month, year] = cleanStr.split('-').map(Number);
            return { date: new Date(Date.UTC(year, month - 1, day)), inferred: false };
        }

        // 2. DD/MM/YYYY (e.g. 14/12/2025)
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanStr)) {
            const [day, month, year] = cleanStr.split('/').map(Number);
            return { date: new Date(Date.UTC(year, month - 1, day)), inferred: false };
        }

        // 3. DD.MM.YYYY (e.g. 14.12.2025)
        if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(cleanStr)) {
            const [day, month, year] = cleanStr.split('.').map(Number);
            return { date: new Date(Date.UTC(year, month - 1, day)), inferred: false };
        }

        // 4. Dec 14, 2025 (Textual) or ISO
        const date = new Date(cleanStr);
        if (!isNaN(date.getTime())) return { date, inferred: false };

    } catch {
        // fallback
    }
    return { date: new Date(), inferred: true };
}

// Helper: Create Hash
function createTransactionHash(tx: Partial<NormalizedTransaction>): string {
    const data = `${tx.date?.toISOString()}|${tx.amount}|${tx.currency}|${tx.description}|${tx.externalId || ''}|${tx.balanceAfter || ''}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

export type ParseResult = {
    transactions: NormalizedTransaction[];
    detectedBank: 'Wise' | 'Revolut' | 'WorldFirst' | 'Unknown';
};

export function parseBankStatement(fileContent: string): ParseResult {
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true
    }) as Record<string, string>[];

    if (records.length === 0) return { transactions: [], detectedBank: 'Unknown' };

    const headers = Object.keys(records[0]);

    // ------------------------------------------------------------------------
    // FUTURE BANKS EXTENSION POINT:
    // To add a new bank:
    // 1. Identify a unique column name in the CSV header (e.g. "Crypto Address", "Santander Ref").
    // 2. Add an 'else if' block here checking for that header.
    // 3. Create a new parseFunction below (like parseWise) mapping columns to NormalizedTransaction.
    // ------------------------------------------------------------------------

    // Detect Bank Type
    if (headers.includes('TransferWise ID')) {
        return { transactions: parseWise(records), detectedBank: 'Wise' };
    } else if (headers.includes('Card number') && headers.includes('Sort code') === false) {
        // Heuristic for Revolut (usually has 'Card number', 'Balance', 'Fee')
        // User provided: "Date started (UTC)", "Card number", "Card label"
        if (headers.includes('Date started (UTC)')) {
            return { transactions: parseRevolut(records), detectedBank: 'Revolut' };
        }
        // Fallback check
        if (headers.includes('Product') && headers.includes('Completed Date')) {
            return { transactions: parseRevolut(records), detectedBank: 'Revolut' };
        }
        return { transactions: parseRevolut(records), detectedBank: 'Revolut' }; // Defaulting based on user input order guess
    } else if (headers.includes('Transaction type') && headers.includes('Payee account number')) {
        return { transactions: parseWorldFirst(records), detectedBank: 'WorldFirst' };
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
        const { date, inferred } = normalizeDate(row['Date']);

        const tx: NormalizedTransaction = {
            date: date,
            isDateInferred: inferred,
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
        const { date, inferred } = normalizeDate(dateStr);

        // Amount field
        let amount = parseFloat(row['Amount']);
        const fee = parseFloat(row['Fee'] || '0');

        const tx: NormalizedTransaction = {
            date: date,
            isDateInferred: inferred,
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

        const { date, inferred } = normalizeDate(row['Transaction Creation Date'] || row['Date']);

        const tx: NormalizedTransaction = {
            date: date,
            isDateInferred: inferred,
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
