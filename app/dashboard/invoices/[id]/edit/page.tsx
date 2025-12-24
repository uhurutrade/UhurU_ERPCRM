import { prisma } from '@/lib/prisma';
import EditInvoiceForm from './form';
import { notFound } from 'next/navigation';

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
    const [invoice, organizations, bankAccounts, cryptoWallets, settings] = await Promise.all([
        prisma.invoice.findUnique({
            where: { id: params.id },
            include: { items: true }
        }),
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

    if (!invoice) notFound();

    // Prevent editing deleted invoices
    if (invoice.deletedAt) {
        return (
            <div className="p-12 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
                <p className="text-uhuru-text-muted">This invoice has been moved to the trash and cannot be edited. Please restore it first if you wish to make changes.</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <EditInvoiceForm
                invoice={invoice}
                organizations={organizations}
                bankAccounts={bankAccounts}
                cryptoWallets={cryptoWallets}
                settings={settings}
            />
        </div>
    );
}
