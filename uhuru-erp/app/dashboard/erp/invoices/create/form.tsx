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
            router.push('/dashboard/erp');
        } else {
            alert('Error creating invoice');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 my-8">
            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Create New Invoice</h1>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Customer</label>
                        <select name="organizationId" required className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white">
                            <option value="">Select Organization</option>
                            {organizations?.map((org: any) => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Invoice Date</label>
                            <input type="date" name="date" required className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Due Date</label>
                            <input type="date" name="dueDate" required className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white" />
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-8">
                    <table className="w-full text-left mb-4">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-500">
                                <th className="py-2 w-1/2">Description</th>
                                <th className="py-2 w-24">Qty</th>
                                <th className="py-2 w-32">Price</th>
                                <th className="py-2 w-32 text-right">Total</th>
                                <th className="py-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-2 pr-4">
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            placeholder="Item description"
                                            className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent"
                                            required
                                        />
                                    </td>
                                    <td className="py-2 pr-4">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                            className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent"
                                            min="1"
                                        />
                                    </td>
                                    <td className="py-2 pr-4">
                                        <input
                                            type="number"
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                            className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-transparent"
                                            step="0.01"
                                        />
                                    </td>
                                    <td className="py-2 text-right font-medium text-slate-900 dark:text-white">
                                        £{(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}
                                    </td>
                                    <td className="py-2 pl-4">
                                        <button type="button" onClick={() => removeItem(index)} className="text-slate-400 hover:text-red-500">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button type="button" onClick={addItem} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        <Plus size={16} /> Add Item
                    </button>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Subtotal</span>
                            <span>£{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>VAT (20%)</span>
                            <span>£{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                            <span>Total</span>
                            <span>£{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
                        Cancel
                    </button>
                    <button disabled={loading} type="submit" className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );
}
