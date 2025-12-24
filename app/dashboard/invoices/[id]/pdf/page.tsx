import { prisma } from '@/lib/prisma';
import { PrintButton } from '@/components/invoices/print-button';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

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
            <div className="print:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
                <span className="font-bold">Print Preview</span>
                <PrintButton />
            </div>

            <style type="text/css" media="print">
                {`
                    @page { size: A4; margin: 0; }
                    body { margin: 0; -webkit-print-color-adjust: exact; }
                `}
            </style>

            {/* Invoice Page - A4 size 210mm x 297mm */}
            <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-[15mm] relative shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm] print:m-0 print:overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-16">
                    {/* Logo Area */}
                    {/* Logo Area */}
                    <div className="w-48 h-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/images/invoice-logo.png"
                            alt="Uhuru Logo"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                    <h1 className="text-4xl font-black text-black tracking-tight">Invoice</h1>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-16">
                    <div className="space-y-1">
                        <div className="grid grid-cols-[140px_1fr] text-sm">
                            <span className="font-bold">Invoice Number:</span>
                            <span className="font-mono">{invoice.number}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] text-sm">
                            <span className="font-bold">Issued on:</span>
                            <span>{format(new Date(invoice.date), 'd MMMM yyyy')}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] text-sm">
                            <span className="font-bold">Due date:</span>
                            <span>{format(new Date(invoice.dueDate), 'd MMMM yyyy')}</span>
                        </div>
                    </div>
                    <div></div> {/* Spacer */}
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-12 mb-16">
                    <div>
                        <h3 className="font-bold text-lg mb-4">Billed to</h3>
                        <div className="text-sm space-y-1 text-slate-700">
                            {/* Dot placeholder from design */}
                            <p className="font-bold text-black">{invoice.organization.name}</p>
                            {invoice.organization.email && <p>{invoice.organization.email}</p>}
                            {invoice.organization.address && <p>{invoice.organization.address}</p>}
                            <p>{invoice.organization.city} {invoice.organization.postcode}</p>
                            <p>{invoice.organization.country || 'United Kingdom'}</p>
                            {invoice.organization.taxId && <p className="mt-2 text-xs text-slate-500">VAT/Tax ID: {invoice.organization.taxId}</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">From</h3>
                        <div className="text-sm space-y-1 text-slate-700">
                            <p className="font-bold text-black uppercase">{settings?.companyName || 'Uhuru Trade Ltd'}</p>
                            <p>{settings?.registeredAddress}</p>
                            <p>{settings?.registeredCity}, {settings?.registeredPostcode}</p>
                            <p>{settings?.registeredCountry}</p>
                        </div>
                    </div>
                </div>



                {/* Items Table */}
                <div className="mb-12">
                    <h3 className="font-bold text-lg mb-6">Item</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="text-left py-2 font-bold w-1/2">Name / description</th>
                                <th className="text-right py-2 font-bold">Price</th>
                                <th className="text-right py-2 font-bold">Quantity</th>
                                <th className="text-right py-2 font-bold">Tax rate</th>
                                <th className="text-right py-2 font-bold">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoice.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-4 font-bold">{item.description}</td>
                                    <td className="py-4 text-right">{formatCurrency(Number(item.unitPrice), invoice.currency)}</td>
                                    <td className="py-4 text-right font-mono">{Number(item.quantity)}</td>
                                    <td className="py-4 text-right">-</td> {/* Dynamic tax later */}
                                    <td className="py-4 text-right font-bold">{formatCurrency(Number(item.total), invoice.currency)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={5} className="py-4"></td>
                            </tr>
                            <tr className="border-t-2 border-black">
                                <td colSpan={3}></td>
                                <td className="py-4 text-right font-bold">Subtotal</td>
                                <td className="py-4 text-right font-bold">{formatCurrency(Number(invoice.subtotal), invoice.currency)}</td>
                            </tr>
                            <tr className="border-t border-gray-200">
                                <td colSpan={3}></td>
                                <td className="py-4 text-right text-gray-500">Total</td>
                                <td className="py-4 text-right font-black text-lg">{formatCurrency(Number(invoice.total), invoice.currency)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Compact Footer - Half Height */}
                <div className="mt-auto bg-slate-50 -mx-[15mm] -mb-[15mm] p-[8mm] pt-4 border-t border-gray-100 flex flex-col gap-4 print:absolute print:bottom-0 print:left-0 print:right-0 print:bg-slate-50">

                    {/* Bank Details - Streamlined Layout */}
                    {invoice.bankAccount && (
                        <div className="w-full text-xs text-slate-800 font-mono space-y-0.5">
                            {/* Bank Name */}
                            <p><span className="font-bold">Bank Name:</span> {invoice.bankAccount.bank.bankName}</p>

                            {/* Account Name */}
                            <p><span className="font-bold">Account Name:</span> Uhuru Trade Ltd</p>

                            {/* BIC/SWIFT and Full Address - Single Line */}
                            <div className="flex flex-wrap items-baseline gap-x-4 leading-snug">
                                {invoice.bankAccount.swiftBic && (
                                    <span><span className="font-bold text-slate-800">BIC/SWIFT:</span> {invoice.bankAccount.swiftBic}</span>
                                )}
                                {invoice.bankAccount.bank.bankAddress && (
                                    <span>
                                        {invoice.bankAccount.bank.bankAddress
                                            .split(' ')
                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                            .join(' ')}, {invoice.bankAccount.bank.bankCity
                                                ?.split(' ')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                .join(' ')}, {invoice.bankAccount.bank.bankCountry || 'United Kingdom'}
                                    </span>
                                )}
                                {invoice.bankAccount.iban && <span><span className="font-bold text-slate-800">IBAN:</span> {invoice.bankAccount.iban}</span>}
                            </div>

                            {/* Sort Code / Account Number - Inline if present */}
                            {(invoice.bankAccount.sortCode || invoice.bankAccount.accountNumberUK || invoice.bankAccount.routingNumber) && (
                                <div className="flex gap-4">
                                    {invoice.bankAccount.sortCode && <span><span className="font-bold text-slate-800">Sort Code:</span> {invoice.bankAccount.sortCode}</span>}
                                    {invoice.bankAccount.accountNumberUK && <span><span className="font-bold text-slate-800">Account No:</span> {invoice.bankAccount.accountNumberUK}</span>}
                                    {invoice.bankAccount.routingNumber && <span><span className="font-bold text-slate-800">Routing:</span> {invoice.bankAccount.routingNumber}</span>}
                                    {invoice.bankAccount.accountNumber && !invoice.bankAccount.accountNumberUK && <span><span className="font-bold text-slate-800">Account No:</span> {invoice.bankAccount.accountNumber}</span>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Crypto Payment - Centered Vertically */}
                    <div className="flex items-center justify-between gap-6 border-t border-slate-200 pt-4">
                        {/* QR Code - Bigger */}
                        <div className="shrink-0 bg-white p-2 rounded border border-gray-200 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://crypto.uhurutrade.com"
                                alt="Crypto QR"
                                className="w-20 h-20"
                            />
                        </div>

                        {/* Crypto Text - Larger Fonts */}
                        <div className="flex-1 flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm leading-tight">Pay with Crypto</p>
                                <p className="text-xs text-slate-500 leading-snug">
                                    We accept cross-chain payments. Scan QR or visit <a href="https://crypto.uhurutrade.com" target="_blank" className="text-indigo-600 font-semibold hover:underline">crypto.uhurutrade.com</a>
                                </p>
                            </div>
                        </div>

                        {/* Powered By - Slightly Larger */}
                        <div className="text-right shrink-0">
                            <p className="text-[8px] text-slate-300 font-medium leading-tight">Powered by</p>
                            <p className="text-[9px] text-slate-400 font-semibold tracking-wide">Uhuru Invoice Engine</p>
                        </div>
                    </div>

                    {/* Bottom Legal - Compact */}
                    <div className="text-center pt-2 border-t border-slate-200">
                        <p className="text-[8px] font-bold text-slate-400 tracking-widest leading-tight">
                            Uhuru Trade Ltd. Company no. 15883242 – Unit 13 Freeland Park Wareham Road. Lytchett Matravers – BH16 6FA Poole – UK
                        </p>
                    </div>
                </div>
            </div>

            {/* Script removed, using Client Component */}
        </div>
    );
}
