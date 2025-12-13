"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bank } from "@prisma/client";

interface AddAccountFormProps {
    bankId: string;
    preselectedCurrency?: string;
}

import { useConfirm } from "@/components/providers/modal-provider";

export default function AddAccountForm({ bankId, preselectedCurrency }: AddAccountFormProps) {
    const router = useRouter();
    const { confirm } = useConfirm();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        accountName: "",
        accountType: "BUSINESS",
        currency: preselectedCurrency || "EUR",
        iban: "",
        accountNumber: "",
        routingNumber: "",
        sortCode: "",
        accountNumberUK: "",
        swiftBic: "",
        currentBalance: "",
        isPrimary: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/banks/${bankId}/accounts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to create account");
            }

            // Artificial delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            router.push(`/dashboard/bank-settings`);
            router.refresh();
        } catch (error) {
            console.error("Error creating account:", error);
            await confirm({
                title: "Error",
                message: "Error creating account. Please try again.",
                type: "danger",
                confirmText: "Close",
                cancelText: "",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Account Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Main EUR Account"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Account Type <span className="text-rose-400">*</span>
                        </label>
                        <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        >
                            <option value="BUSINESS">Business</option>
                            <option value="SAVINGS">Savings</option>
                            <option value="CHECKING">Checking</option>
                            <option value="MULTI_CURRENCY">Multi-Currency</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Currency <span className="text-rose-400">*</span>
                        </label>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        >
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="CHF">CHF - Swiss Franc</option>
                        </select>
                    </div>

                    {/* Conditional fields based on currency */}
                    {formData.currency === "EUR" && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                IBAN
                            </label>
                            <input
                                type="text"
                                name="iban"
                                value={formData.iban}
                                onChange={handleChange}
                                placeholder="IE29..."
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white font-mono"
                            />
                        </div>
                    )}

                    {formData.currency === "GBP" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Sort Code
                                </label>
                                <input
                                    type="text"
                                    name="sortCode"
                                    value={formData.sortCode}
                                    onChange={handleChange}
                                    placeholder="00-00-00"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    name="accountNumberUK"
                                    value={formData.accountNumberUK}
                                    onChange={handleChange}
                                    placeholder="8 digits"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white font-mono"
                                />
                            </div>
                        </>
                    )}

                    {formData.currency === "USD" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Routing Number
                                </label>
                                <input
                                    type="text"
                                    name="routingNumber"
                                    value={formData.routingNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white font-mono"
                                />
                            </div>
                        </>
                    )}

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            SWIFT/BIC Code (Optional)
                        </label>
                        <input
                            type="text"
                            name="swiftBic"
                            value={formData.swiftBic}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Initial Balance
                        </label>
                        <input
                            type="number"
                            name="currentBalance"
                            value={formData.currentBalance}
                            onChange={handleChange}
                            step="0.01"
                            placeholder="0.00"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>

                    <div className="flex items-center pt-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isPrimary"
                                checked={formData.isPrimary}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                            />
                            <span className="text-sm text-slate-300">Set as Primary Account for this currency</span>
                        </label>
                    </div>

                </div>
            </section>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                    {loading ? "Creating..." : "Create Account"}
                </button>
            </div>
        </form>
    );
}
