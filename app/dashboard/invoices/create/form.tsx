'use client';

import { useState, useEffect } from 'react';
import { createInvoice, getNextNumberForPrefix } from '@/app/actions/invoicing';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, UserPlus, Building2, CreditCard, Wallet, FileText, Settings } from 'lucide-react';
import { Organization, BankAccount, CryptoWallet, CompanySettings } from '@prisma/client';

type Props = {
    organizations: Organization[];
    bankAccounts: (BankAccount & { bank: any })[];
    cryptoWallets: CryptoWallet[];
    settings: CompanySettings | null;
};

export default function CreateInvoiceForm({ organizations, bankAccounts, cryptoWallets, settings }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isNewCustomer, setIsNewCustomer] = useState(false);

    // Form States
    const [currency, setCurrency] = useState('GBP');
    const [paymentMethod, setPaymentMethod] = useState<'BANK' | 'CRYPTO'>('BANK');
    const [selectedBankId, setSelectedBankId] = useState<string>('');
    const [selectedWalletId, setSelectedWalletId] = useState<string>('');

    // Invoice Number Logic
    const [invoicePrefix, setInvoicePrefix] = useState(settings?.invoicePrefix || 'INV-');
    const [invoiceNumber, setInvoiceNumber] = useState<number>(1); // Changed to number for easier math display

    // Fetch next number when prefix changes
    useEffect(() => {
        const fetchNext = async () => {
            if (!invoicePrefix) return;
            const next = await getNextNumberForPrefix(invoicePrefix);
            setInvoiceNumber(next);
        };
        // Debounce slightly to avoid spamming server while typing
        const timer = setTimeout(fetchNext, 500);
        return () => clearTimeout(timer);
    }, [invoicePrefix]);

    // Items
    const [items, setItems] = useState([
        { description: 'Service', quantity: 1, unitPrice: 0 }
    ]);

    // Initialize defaults
    useEffect(() => {
        if (bankAccounts.length > 0) setSelectedBankId(bankAccounts[0].id);
        if (cryptoWallets.length > 0) setSelectedWalletId(cryptoWallets[0].id);
    }, [bankAccounts, cryptoWallets]);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const tax = 0;
    const total = subtotal + tax;

    // Currency Symbols
    const getSymbol = (curr: string) => {
        switch (curr) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            default: return curr;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.append('items', JSON.stringify(items));
        formData.append('currency', currency);

        // Pass the prefix explicitly
        formData.append('invoicePrefix', invoicePrefix);

        if (isNewCustomer) {
            formData.append('isNewCustomer', 'true');
        }

        if (paymentMethod === 'BANK' && selectedBankId) {
            formData.append('bankAccountId', selectedBankId);
        } else if (paymentMethod === 'CRYPTO' && selectedWalletId) {
            formData.append('cryptoWalletId', selectedWalletId);
        }

        const res = await createInvoice(formData);

        if (res?.success) {
            router.push('/dashboard/invoices');
        } else {
            console.error(res?.error);
            alert('Error creating invoice');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">New Invoice</h1>
                    <p className="text-uhuru-text-muted mt-2 text-sm font-medium">Create and manage financial documents</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-white/5">
                    <div className="px-4 py-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Invoice Prefix & Number</span>
                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                value={invoicePrefix}
                                onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                                className="bg-transparent border-b border-indigo-500/30 text-white font-mono font-bold text-lg w-20 text-right focus:outline-none focus:border-indigo-500 uppercase placeholder:text-slate-600"
                                placeholder="INV-"
                            />
                            <span className="text-lg font-mono font-bold text-slate-500">{invoiceNumber.toString().padStart(3, '0')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-uhuru-card rounded-[2rem] shadow-2xl border border-white/10 backdrop-blur-xl overflow-hidden">

                {/* 1. Customer Section */}
                <div className="p-8 border-b border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Building2 size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-white">Bill To</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsNewCustomer(!isNewCustomer)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${isNewCustomer ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 text-uhuru-text-dim hover:text-white'}`}
                        >
                            <UserPlus size={14} />
                            {isNewCustomer ? 'Select Existing' : 'New Customer'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {isNewCustomer ? (
                            <>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Company Name</label>
                                        <input name="newCustomerName" required type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700" placeholder="e.g. Acme Corp Inc." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Email Address</label>
                                        <input name="newCustomerEmail" type="email" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700" placeholder="billing@acme.com" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Address</label>
                                        <input name="newCustomerAddress" type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700" placeholder="123 Business Rd, London" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Tax ID / VAT</label>
                                            <input name="newCustomerTaxId" type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700" placeholder="GB123456789" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Contact Person</label>
                                            <input name="newCustomerContact" type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700" placeholder="John Doe" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="col-span-2">
                                <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest block mb-1">Select Organization</label>
                                <select name="organizationId" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id} className="bg-slate-900 text-white">{org.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Invoice Details & Payment */}
                <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-white/5">
                    {/* Dates & Currency */}
                    <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/5 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <FileText size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-white">Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Issue Date</label>
                                <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Due Date</label>
                                <input name="dueDate" type="date" required className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Currency</label>
                                <select
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                                >
                                    <option value="GBP">GBP (£)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="USDC">USDC</option>
                                    <option value="ETH">ETH</option>
                                    <option value="BTC">BTC</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="col-span-2 p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <Wallet size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-white">Payment Method</h2>
                        </div>

                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('BANK')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border transition-all ${paymentMethod === 'BANK' ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-900/30 border-white/5 text-uhuru-text-dim hover:bg-slate-800'}`}
                            >
                                <CreditCard size={18} />
                                <span className="font-bold text-sm">Bank Transfer</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CRYPTO')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border transition-all ${paymentMethod === 'CRYPTO' ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-900/30 border-white/5 text-uhuru-text-dim hover:bg-slate-800'}`}
                            >
                                <div className="i-lucide-bitcoin w-5 h-5" /> {/* Fallback icon or custom */}
                                <span className="font-bold text-sm">Crypto / Blockchain</span>
                            </button>
                        </div>

                        {paymentMethod === 'BANK' ? (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Select Bank Account</label>
                                <select
                                    value={selectedBankId}
                                    onChange={(e) => setSelectedBankId(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                                >
                                    <option value="">Select Account...</option>
                                    {bankAccounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.accountName} - {acc.currency}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-uhuru-text-dim px-2">
                                    The IBAN and Bank details will be included in the invoice footer.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Select Wallet</label>
                                <select
                                    value={selectedWalletId}
                                    onChange={(e) => setSelectedWalletId(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                                >
                                    <option value="">Select Wallet...</option>
                                    {cryptoWallets.map(w => (
                                        <option key={w.id} value={w.id}>{w.walletName} ({w.asset}) - {w.network}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-uhuru-text-dim px-2">
                                    A QR code for this wallet address will be generated on the final invoice.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Items Table */}
                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                            <Settings size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Services & Items</h2>
                    </div>

                    <div className="bg-slate-900/30 rounded-2xl border border-white/5 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 bg-slate-900/50">
                                    <th className="text-left py-3 px-6 text-[10px] uppercase tracking-widest font-bold text-uhuru-text-dim w-1/2">Description</th>
                                    <th className="text-center py-3 px-6 text-[10px] uppercase tracking-widest font-bold text-uhuru-text-dim w-24">Qty</th>
                                    <th className="text-right py-3 px-6 text-[10px] uppercase tracking-widest font-bold text-uhuru-text-dim w-32">Price ({getSymbol(currency)})</th>
                                    <th className="text-right py-3 px-6 text-[10px] uppercase tracking-widest font-bold text-uhuru-text-dim w-32">Total</th>
                                    <th className="w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {items.map((item, i) => (
                                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-3">
                                            <input
                                                value={item.description}
                                                onChange={e => updateItem(i, 'description', e.target.value)}
                                                placeholder="Item description..."
                                                className="w-full bg-transparent border-none text-white text-sm focus:ring-0 placeholder:text-slate-700"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={e => updateItem(i, 'quantity', e.target.value)}
                                                className="w-full bg-slate-800/50 rounded-lg py-1 text-center text-white text-sm focus:outline-none border border-transparent focus:border-white/10"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                                                className="w-full bg-slate-800/50 rounded-lg py-1 text-right text-white text-sm focus:outline-none border border-transparent focus:border-white/10"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="p-3 text-right font-mono text-white text-sm font-bold">
                                            {getSymbol(currency)}{(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button type="button" onClick={() => removeItem(i)} className="text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button type="button" onClick={addItem} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300">
                        <Plus size={14} /> Add New Line
                    </button>
                </div>

                {/* 4. Notes & Footer */}
                <div className="p-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Invoice Note (Internal/Customer)</label>
                            <textarea name="notes" rows={3} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-indigo-500/50 resize-none placeholder:text-slate-700" placeholder="Payment terms, PO number, etc..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest">Footer Text</label>
                            <textarea name="footerNote" rows={2} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-indigo-500/50 resize-none placeholder:text-slate-700" placeholder="Thank you for your business..." defaultValue={settings?.notes || ''} />
                        </div>
                    </div>

                    <div className="flex flex-col justify-end space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-uhuru-text-dim font-medium">Subtotal</span>
                            <span className="text-white font-mono font-bold">{getSymbol(currency)}{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-uhuru-text-dim font-medium">Tax/VAT (0%)</span>
                            <span className="text-white font-mono font-bold">{getSymbol(currency)}{tax.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="flex justify-between items-end">
                            <span className="text-lg font-bold text-white uppercase tracking-widest">Total Due</span>
                            <span className="text-3xl font-black text-white tracking-tighter">{getSymbol(currency)}{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-slate-900/80 border-t border-white/5 flex justify-end gap-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl text-xs font-bold text-uhuru-text-dim hover:text-white uppercase tracking-widest transition-colors">
                        Cancel
                    </button>
                    <button disabled={loading} type="submit" className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
                        {loading ? 'Processing...' : (
                            <>
                                <Save size={16} />
                                Create Invoice
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
