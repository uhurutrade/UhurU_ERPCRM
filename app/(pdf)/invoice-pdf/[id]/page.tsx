import { prisma } from '@/lib/prisma';
import { PrintButton } from '@/components/invoices/print-button';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const invoice = await prisma.invoice.findUnique({
        where: { id: params.id },
        select: { number: true }
    });

    if (!invoice) return { title: 'Invoice Not Found' };

    return {
        title: `UhuruInvoice_${invoice.number}`,
    };
}

export default async function InvoicePdfPage({ params }: { params: { id: string } }) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: params.id },
        include: {
            organization: true,
            items: true,
            bankAccount: { include: { bank: true } },
            cryptoWallet: true
        }
    });

    const settings = await prisma.companySettings.findFirst();

    if (!invoice) notFound();

    // Helper for formatting currency
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <div className="bg-white text-black min-h-screen p-0 m-0 print:p-0">
            {/* Print Helper Bar - Hidden when printing */}
            <div className="print:hidden sticky top-0 z-50 bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
                <span className="font-bold">Uhuru Invoice Preview</span>
                <PrintButton />
            </div>

            <style type="text/css" media="print">
                {`
                    @page { 
                        size: A4; 
                        margin: 0; 
                    }
                    body { 
                        margin: 0; 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                        background-color: white !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                `}
            </style>

            {/* Invoice Page - A4 size 210mm x 297mm */}
            <div className="w-[210mm] h-[297mm] mx-auto bg-white p-[18mm] pt-[12mm] pb-[8mm] relative shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm] print:m-0 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    {/* Logo Area */}
                    <div className="w-36 h-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/images/invoice-logo.png"
                            alt="Uhuru Logo"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                    <div className="text-right">
                        <h1 className="text-4xl font-black text-black tracking-tight uppercase leading-none">Invoice</h1>
                        <p className="text-[10px] font-mono text-black mt-2">{invoice.number}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8 mb-4 border-b border-black pb-3">
                    <div className="space-y-0.5">
                        <div className="grid grid-cols-[110px_1fr] text-[10px]">
                            <span className="font-bold text-black uppercase tracking-wider">Invoice Number</span>
                            <span className="font-mono font-bold">{invoice.number}</span>
                        </div>
                        <div className="grid grid-cols-[110px_1fr] text-[10px]">
                            <span className="font-bold text-black uppercase tracking-wider">Issued Date</span>
                            <span className="font-bold text-black">{format(new Date(invoice.date), 'd MMMM yyyy')}</span>
                        </div>
                        <div className="grid grid-cols-[110px_1fr] text-[10px]">
                            <span className="font-bold text-black uppercase tracking-wider">Due Date</span>
                            <span className="font-bold text-black">{format(new Date(invoice.dueDate), 'd MMMM yyyy')}</span>
                        </div>
                    </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-12 mb-4">
                    <div>
                        <h3 className="font-bold text-[8px] uppercase tracking-[0.2em] text-black mb-1.5">Billed to</h3>
                        <div className="text-[11px] space-y-0 text-black leading-normal">
                            <p className="font-bold text-black text-sm">{invoice.organization.name}</p>
                            {invoice.organization.email && <p>{invoice.organization.email}</p>}
                            {invoice.organization.address && <p>{invoice.organization.address}</p>}
                            <p>{invoice.organization.city} {invoice.organization.postcode}</p>
                            <p>{invoice.organization.country || 'United Kingdom'}</p>
                            {invoice.organization.taxId && <p className="mt-1 text-[8px] font-bold text-black uppercase tracking-tighter">VAT/Tax ID: {invoice.organization.taxId}</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-[8px] uppercase tracking-[0.2em] text-black mb-1.5 text-right">From</h3>
                        <div className="text-[11px] space-y-0 text-black text-right leading-normal">
                            <p className="font-bold text-black uppercase text-sm">{settings?.companyName || 'Uhuru Trade Ltd'}</p>
                            <p>{settings?.registeredAddress}</p>
                            <p>{settings?.registeredCity}, {settings?.registeredPostcode}</p>
                            <p>{settings?.registeredCountry}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="flex-1">
                    <table className="w-full text-[12px]">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="text-left py-2 font-bold uppercase text-[9px] tracking-wider w-1/2 text-black">Name / description</th>
                                <th className="text-right py-2 font-bold uppercase text-[9px] tracking-wider text-black">Price</th>
                                <th className="text-right py-2 font-bold uppercase text-[9px] tracking-wider text-black">Quantity</th>
                                <th className="text-right py-2 font-bold uppercase text-[9px] tracking-wider text-black">Tax rate</th>
                                <th className="text-right py-2 font-bold uppercase text-[9px] tracking-wider text-black">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black">
                            {invoice.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-2 pr-4">
                                        <div className="font-bold text-black">{item.description}</div>
                                    </td>
                                    <td className="py-2 text-right font-medium text-black">{formatCurrency(Number(item.unitPrice), invoice.currency)}</td>
                                    <td className="py-2 text-right font-mono text-black">{Number(item.quantity)}</td>
                                    <td className="py-2 text-right text-black text-[10px]">-</td>
                                    <td className="py-2 text-right font-bold text-black">{formatCurrency(Number(item.total), invoice.currency)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Section */}
                <div className="mb-6 flex justify-end">
                    <div className="w-1/2 space-y-1">
                        <div className="flex justify-between items-center py-1.5 border-t-2 border-black">
                            <span className="font-bold uppercase text-[9px] tracking-[0.2em] text-black">Subtotal</span>
                            <span className="font-bold text-black">{formatCurrency(Number(invoice.subtotal), invoice.currency)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 bg-slate-50 px-4">
                            <span className="font-black uppercase text-xs tracking-[0.2em] text-black">Total</span>
                            <span className="text-xl font-black text-black">{formatCurrency(Number(invoice.total), invoice.currency)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-auto pt-6 border-t border-black flex flex-col gap-4">

                    {/* Bank Details & QR - Split Layout */}
                    <div className="grid grid-cols-[1fr_auto] gap-8 items-start">
                        {/* Bank Details */}
                        {invoice.bankAccount && (
                            <div className="text-[11px] text-black font-mono space-y-1">
                                <p className="font-bold text-black uppercase tracking-wider mb-2 text-sm underline decoration-1 underline-offset-4">Payment Information</p>
                                <p className="text-black leading-tight"><span className="font-bold">Bank Name:</span> {invoice.bankAccount.bank.bankName}</p>
                                <p className="text-black leading-tight"><span className="font-bold">Account Name:</span> Uhuru Trade Ltd</p>

                                <div className="leading-tight text-black">
                                    {invoice.bankAccount.swiftBic && (
                                        <span className="mr-4"><span className="font-bold">BIC/SWIFT:</span> {invoice.bankAccount.swiftBic}</span>
                                    )}
                                    {invoice.bankAccount.iban && <span><span className="font-bold">IBAN:</span> {invoice.bankAccount.iban}</span>}
                                </div>

                                <div className="flex gap-4 text-black leading-tight">
                                    {invoice.bankAccount.sortCode && <span><span className="font-bold">Sort Code:</span> {invoice.bankAccount.sortCode}</span>}
                                    {invoice.bankAccount.accountNumberUK && <span><span className="font-bold">Account No:</span> {invoice.bankAccount.accountNumberUK}</span>}
                                    {invoice.bankAccount.routingNumber && <span><span className="font-bold">Routing:</span> {invoice.bankAccount.routingNumber}</span>}
                                </div>
                                <p className="text-[10px] text-black mt-2 leading-tight">
                                    {(invoice.bankAccount.bank.bankAddress || '') + ', ' + (invoice.bankAccount.bank.bankCity || '') + ', ' + (invoice.bankAccount.bank.bankCountry || 'UK')}
                                </p>
                            </div>
                        )}

                        {/* QR Code & Pay Link */}
                        <div className="flex flex-col items-end gap-2 pr-2">
                            <div className="bg-white p-1.5 rounded border-2 border-black shadow-[4px_4px_0px_black] mb-1">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://crypto.uhurutrade.com"
                                    alt="Crypto QR"
                                    className="w-20 h-20"
                                />
                            </div>
                            <div className="text-right">
                                <p className="font-black text-black text-[11px] uppercase tracking-[0.1em] leading-none mb-1">Pay with CRYPTO</p>
                                <p className="text-[10px] text-black font-black">crypto.uhurutrade.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Legal - Very Compact */}
                    <div className="pt-4 border-t border-black">
                        <p className="text-center text-[8px] font-bold text-black tracking-[0.1em] leading-tight">
                            Uhuru Trade Ltd. Co. 15883242 – Unit 13 Freeland Park Wareham Road – Lytchett Matravers – BH16 6FA Poole – UK
                        </p>
                        <p className="text-center text-[7px] text-black mt-1 uppercase tracking-[0.3em] font-black">
                            Powered by Uhuru Invoice Engine
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
