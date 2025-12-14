"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bank } from "@prisma/client";

import { useConfirm } from "@/components/providers/modal-provider";

interface EditBankFormProps {
    bank: Bank;
}

export default function EditBankForm({ bank }: EditBankFormProps) {
    const router = useRouter();
    const { confirm } = useConfirm();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bankName: bank.bankName,
        bankType: bank.bankType,
        swiftBic: bank.swiftBic || "",
        bankCode: bank.bankCode || "",
        website: bank.website || "",
        supportEmail: bank.supportEmail || "",
        supportPhone: bank.supportPhone || "",
        bankAddress: bank.bankAddress || "",
        bankCity: bank.bankCity || "",
        bankPostcode: bank.bankPostcode || "",
        bankCountry: bank.bankCountry || "",
        notes: bank.notes || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/banks/${bank.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update bank");
            }

            // Artificial delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            router.push(`/dashboard/bank-settings`);
            router.refresh();
        } catch (error) {
            console.error("Error updating bank:", error);
            await confirm({
                title: "Error",
                message: "Error updating bank. Please try again.",
                type: "danger",
                confirmText: "Close",
                cancelText: "",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: "Delete Bank",
            message: "Are you sure you want to delete this bank? This action cannot be undone.",
            type: "danger",
            confirmText: "Delete",
            cancelText: "Cancel",
        });

        if (!confirmed) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/banks/${bank.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete bank");
            }

            router.push(`/dashboard/bank-settings`);
            router.refresh();
        } catch (error: any) {
            console.error("Error deleting bank:", error);
            await confirm({
                title: "Cannot Delete Bank",
                message: error.message || "Error deleting bank. Please try again.",
                type: "danger",
                confirmText: "Close",
                cancelText: "",
            });
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600/20 text-red-500 hover:bg-red-600/30 hover:text-red-400 rounded-lg transition-colors text-sm font-semibold"
                >
                    Delete Bank
                </button>
            </div>

            {/* Basic Information */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Bank Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Revolut, Wise, HSBC"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Bank Type <span className="text-rose-400">*</span>
                        </label>
                        <select
                            name="bankType"
                            value={formData.bankType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        >
                            <option value="TRADITIONAL">Traditional Bank</option>
                            <option value="NEOBANK">Neobank (Revolut, Wise, N26)</option>
                            <option value="PAYMENT_PROVIDER">Payment Provider</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            SWIFT/BIC Code
                        </label>
                        <input
                            type="text"
                            name="swiftBic"
                            value={formData.swiftBic}
                            onChange={handleChange}
                            placeholder="e.g., REVOGB21"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Bank Code
                        </label>
                        <input
                            type="text"
                            name="bankCode"
                            value={formData.bankCode}
                            onChange={handleChange}
                            placeholder="Country-specific bank code"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Website
                        </label>
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://www.bank.com"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Support Email
                        </label>
                        <input
                            type="email"
                            name="supportEmail"
                            value={formData.supportEmail}
                            onChange={handleChange}
                            placeholder="support@bank.com"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Support Phone
                        </label>
                        <input
                            type="tel"
                            name="supportPhone"
                            value={formData.supportPhone}
                            onChange={handleChange}
                            placeholder="+44 20 1234 5678"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>
                </div>
            </section>

            {/* Bank Address */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Bank Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Address
                        </label>
                        <input
                            type="text"
                            name="bankAddress"
                            value={formData.bankAddress}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            City
                        </label>
                        <input
                            type="text"
                            name="bankCity"
                            value={formData.bankCity}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Postcode
                        </label>
                        <input
                            type="text"
                            name="bankPostcode"
                            value={formData.bankPostcode}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Country
                        </label>
                        <input
                            type="text"
                            name="bankCountry"
                            value={formData.bankCountry}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        />
                    </div>
                </div>
            </section>

            {/* Notes */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Additional Notes</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                    />
                </div>
            </section>

            {/* Submit Buttons */}
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
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
