import { addMonths, addDays, endOfMonth, isWeekend, addYears } from 'date-fns';

export enum ObligationType {
    VAT = 'VAT',
    CORPORATION_TAX = 'CORPORATION_TAX', // Payment
    ACCOUNTS = 'ACCOUNTS', // Filing
    CONFIRMATION_STATEMENT = 'CONFIRMATION_STATEMENT',
    PAYE = 'PAYE'
}

/**
 * Calculates the VAT deadline for a given period end.
 * Rule: 1 calendar month and 7 days after the end of the VAT period.
 */
export function calculateVATDeadline(periodEnd: Date): Date {
    const oneMonthAfter = addMonths(periodEnd, 1);
    return addDays(oneMonthAfter, 7);
}

/**
 * Calculates Corporation Tax payment deadline.
 * Rule: 9 months and 1 day after the end of the accounting period.
 */
export function calculateCorpTaxPaymentDeadline(periodEnd: Date): Date {
    const nineMonthsAfter = addMonths(periodEnd, 9);
    return addDays(nineMonthsAfter, 1);
}

/**
 * Calculates Annual Accounts filing deadline (Companies House).
 * Rule: 9 months after the end of the accounting period.
 */
export function calculateAccountsDeadline(periodEnd: Date): Date {
    return addMonths(periodEnd, 9);
}

/**
 * Calculates Confirmation Statement deadline.
 * Rule: 14 days after the review period ends (usually 1 year from incorporation/last statement).
 */
export function calculateConfirmationStatementDeadline(reviewPeriodEnd: Date): Date {
    return addDays(reviewPeriodEnd, 14);
}

export function getStatusColor(dueDate: Date, isCompleted: boolean): string {
    if (isCompleted) return 'bg-emerald-500';

    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-600'; // Overdue
    if (diffDays <= 7) return 'bg-amber-500'; // Due soon
    if (diffDays <= 30) return 'bg-blue-500'; // Upcoming
    return 'bg-slate-500'; // Far future
}
