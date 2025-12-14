
export function serializeData(data: any): any {
    if (data === null || data === undefined) {
        return data;
    }

    if (typeof data !== 'object') {
        return data;
    }

    if (data instanceof Date) {
        return data.toISOString();
    }

    // Handle Prisma Decimal
    if (typeof data.toNumber === 'function') {
        return data.toNumber();
    }
    // Or if it's just an object with decimal properties that looks like a decimal
    // Usually Prisma Decimals have .d (digits), .e (exponent), etc.

    if (Array.isArray(data)) {
        return data.map(serializeData);
    }

    const newData: any = {};
    for (const key of Object.keys(data)) {
        newData[key] = serializeData(data[key]);
    }
    return newData;
}
