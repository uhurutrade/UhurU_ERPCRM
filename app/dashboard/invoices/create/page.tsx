export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import CreateInvoiceForm from './form';

export default async function CreateInvoicePage() {
    const [organizations, bankAccounts, cryptoWallets, settings] = await Promise.all([
        prisma.organization.findMany(),
        prisma.bankAccount.findMany({
            where: { isActive: true },
            include: { bank: true }
        }),
        prisma.cryptoWallet.findMany({
            where: { isActive: true }
        }),
        prisma.companySettings.findFirst()
    ]);

    return (
        <div className="p-8">
            <CreateInvoiceForm
                organizations={organizations}
                bankAccounts={bankAccounts}
                cryptoWallets={cryptoWallets}
                settings={settings}
            />
        </div>
    );
}
