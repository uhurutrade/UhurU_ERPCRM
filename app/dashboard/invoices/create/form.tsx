'use client';

import { useState } from 'react';
import { createInvoice } from '@/app/actions/invoicing'; // Need to create this
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';
import { OrganizationList } from '@/components/crm/organization-list'; // Reusing components or fetch data logic

// Would normally fetch organizations from server component and pass as props
// For this client component, assuming it receives organizations as props or fetches them
// Just stubbing the props structure for now
export default function CreateInvoiceForm({ organizations }: { organizations: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([
        { description: 'Service', quantity: 1, unitPrice: 0 }
    ]);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.append('items', JSON.stringify(items));

        const res = await createInvoice(formData);

        if (res?.success) {
            router.push('/dashboard/invoices');
        } else {
            alert('Error creating invoice');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-uhuru-card rounded-[2rem] shadow-card border border-uhuru-border p-8 my-8 backdrop-blur-xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Create Financial Instrument</h1>
                <p className="text-uhuru-text-muted mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">New Invoice Generation</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-8 p-6 bg-slate-900/40 rounded-2xl border border-white/5">
                    <div>
                        <label className="block text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest mb-2">Recipient Organization</label>
                        <select
                            name="organizationId"
                            required
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-slate-900">Select Organization</option>
                            {organizations?.map((org: any) => (
                                <option key={org.id} value={org.id} className="bg-slate-900">{org.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest mb-2">Emission Date</label>
                            <input
                                type="date"
                                name="date"
                                required
                                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-uhuru-text-muted uppercase tracking-widest mb-2">Maturity Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                required
                                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Line Items & Services</h4>
                        <div className="h-px flex-1 bg-indigo-500/10 mx-4" />
                    </div>

                    <div className="bg-slate-900/20 rounded-2xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-uhuru-text-dim uppercase tracking-widest bg-slate-900/40 border-b border-white/5">
                                    <th className="px-6 py-4 w-1/2">Description</th>
                                    <th className="px-6 py-4 w-24 text-center">Qty</th>
                                    <th className="px-6 py-4 w-32 text-right">Unit Price</th>
                                    <th className="px-6 py-4 w-32 text-right">Sum</th>
                                    <th className="px-6 py-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {items.map((item, index) => (
                                    <tr key={index} className="group">
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                placeholder="Service or Product name"
                                                className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-slate-600"
                                                required
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                className="w-full bg-slate-800/40 border border-white/5 rounded-lg py-1 px-2 text-center text-sm text-white focus:outline-none focus:border-white/20 transition-all font-mono"
                                                min="1"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                                className="w-full bg-slate-800/40 border border-white/5 rounded-lg py-1 px-2 text-right text-sm text-white focus:outline-none focus:border-white/20 transition-all font-mono"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-white text-sm">
                                            £{(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest py-2"
                    >
                        <Plus size={14} /> Add Line Item
                    </button>
                </div>

                {/* Totals */}
                <div className="flex justify-end pt-4">
                    <div className="w-80 p-6 bg-slate-900/40 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between text-xs font-bold text-uhuru-text-dim uppercase tracking-tighter">
                            <span>Subtotal</span>
                            <span className="text-white font-mono">£{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-uhuru-text-dim uppercase tracking-tighter">
                            <span>VAT (20%)</span>
                            <span className="text-white font-mono">£{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-end pt-3 border-t border-white/10">
                            <span className="text-sm font-bold text-white uppercase tracking-widest">Total Amount</span>
                            <span className="text-2xl font-black text-white tracking-tighter">£{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-3 rounded-xl text-xs font-bold text-uhuru-text-dim hover:text-white hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={loading}
                        type="submit"
                        className="flex items-center gap-3 px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Save size={16} />
                                Finalize Invoice
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
