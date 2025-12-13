import { Decimal } from "@prisma/client/runtime/library";

export interface UnifiedTransaction {
    externalId: string | null;
    date: Date;
    description: string;
    amount: number;
    currency: string;
    fee: number | null;
    status: string;
    category?: string;
    reference?: string;
    hash: string; // Unique deduplication hash
}

export type BankProvider = 'REVOLUT' | 'WISE' | 'WORLDFIRST';
