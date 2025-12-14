
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

    // Handle Prisma Decimal and other custom types
    if (data && typeof data === 'object') {
        const proto = Object.getPrototypeOf(data);
        if (proto?.constructor?.name === 'Decimal') {
            return data.toNumber();
        }
        // Fallback for older versions or different builds
        if (typeof data.toNumber === 'function') {
            return data.toNumber(); // Convert Decimal to number
        }
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
