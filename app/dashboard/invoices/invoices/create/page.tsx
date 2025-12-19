import { prisma } from '@/lib/prisma';
import CreateInvoiceForm from './form';

export default async function CreateInvoicePage() {
    const organizations = await prisma.organization.findMany();

    return (
        <div className="p-8">
            <CreateInvoiceForm organizations={organizations} />
        </div>
    );
}
