export const EXCHANGE_RATES = {
    GBP: 1,
    EUR: 0.85,
    USD: 0.78,
    CHF: 0.88,
};

export function convertToGBP(amount: number, currency: string): number {
    const rate = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1;
    return amount * rate;
}
