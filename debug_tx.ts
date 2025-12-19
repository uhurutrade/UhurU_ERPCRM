const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const txs = await prisma.bankTransaction.findMany({
        where: {
            OR: [
                { amount: -538.82 },
                { amount: 538.82 },
                { description: { contains: 'Alibaba', mode: 'insensitive' } }
            ]
        }
    })
    console.log(JSON.stringify(txs, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
