import { prisma } from "../lib/prisma";

async function checkAccounts() {
    const accounts = await prisma.account.findMany({
        where: { provider: 'google' },
        include: { user: true }
    });

    console.log(`Found ${accounts.length} Google accounts.`);
    accounts.forEach(acc => {
        console.log(`User: ${acc.user.email}, Provider: ${acc.provider}, Has Access Token: ${!!acc.access_token}`);
    });
}

checkAccounts().catch(console.error);
