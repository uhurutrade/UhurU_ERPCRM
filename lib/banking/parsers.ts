import { createHash } from 'crypto';

export type BankProvider = 'HSBC' | 'Lloyds' | 'Barclays' | 'Monzo' | 'Generic'; 

export interface BankStatementRow {
    date: Date;
    description: string;
    amount: number;
    currency: string;
    reference?: string;
    hash: string; 
    externalId: string; 
    // CORRECCIÓN 3: Añadida la propiedad 'fee' (Número)
    fee?: number; // Lo hacemos opcional porque no se parsea del CSV actualmente
    // CORRECCIÓN 4: Añadida la propiedad 'status' (String)
    status?: string; // Lo hacemos opcional porque no se parsea del CSV actualmente
}

export function generateTransactionHash(row: BankStatementRow): string {
    const data = `${row.date.toISOString()}_${row.amount}_${row.description}_${row.currency}`;
    return createHash('md5').update(data).digest('hex');
}

export function parseAmount(amountStr: string): number {
    const cleanStr = amountStr.replace(/[^\d.-]/g, '');
    const val = parseFloat(cleanStr);
    return isNaN(val) ? 0 : val;
}

export function parseCSVLines(content: string): BankStatementRow[] {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    const rows: BankStatementRow[] = [];

    if (lines.length === 0) return [];

    const header = lines[0].toLowerCase();
    const columns = header.split(',').map(c => c.replace(/"/g, '').trim());

    const dateIdx = columns.findIndex(c => c.includes('date'));
    const amountIdx = columns.findIndex(c => c.includes('amount') || c.includes('value'));
    const descIdx = columns.findIndex(c => c.includes('desc') || c.includes('narration') || c.includes('reference'));

    if (dateIdx === -1 || amountIdx === -1) {
        throw new Error("Could not detect 'Date' or 'Amount' columns in CSV.");
    }

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(',');

        if (parts.length < columns.length) continue;

        const dateStr = parts[dateIdx];
        const amountStr = parts[amountIdx];
        const descStr = descIdx !== -1 ? parts[descIdx] : 'No description';

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) continue; 

        // Creación de la fila base
        const partialRow = {
            date: date,
            amount: parseAmount(amountStr),
            description: descStr.replace(/"/g, ''),
            currency: 'GBP' 
        };

        const hash = generateTransactionHash(partialRow as BankStatementRow); 

        // Completamos la fila, añadiendo valores por defecto para las nuevas propiedades
        const finalRow: BankStatementRow = {
            ...partialRow,
            hash: hash,
            externalId: hash,
            fee: 0, // Valor por defecto
            status: 'COMPLETED' // Valor por defecto
        };

        rows.push(finalRow);
    }

    return rows;
}

export function parseBankCSV(content: string, provider: BankProvider): BankStatementRow[] {
    return parseCSVLines(content);
}
