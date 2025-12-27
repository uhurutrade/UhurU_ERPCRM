"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FinancialCategoriesGuide } from "./financial-categories-guide";
import { RefreshCw, Sparkles, AlertTriangle, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/modal-provider";

interface CompanySettingsFormProps {
    initialData: any;
}

export default function CompanySettingsForm({ initialData }: CompanySettingsFormProps) {
    const router = useRouter();
    const { confirm } = useConfirm();
    const [loading, setLoading] = useState(false);
    const [isRefreshingAI, setIsRefreshingAI] = useState(false);
    const [formData, setFormData] = useState({
        // Basic Company Information
        companyName: initialData?.companyName || "",
        companyNumber: initialData?.companyNumber || "",
        incorporationDate: initialData?.incorporationDate
            ? new Date(initialData.incorporationDate).toISOString().split('T')[0]
            : "",

        // Registered Office Address
        registeredAddress: initialData?.registeredAddress || "",
        registeredCity: initialData?.registeredCity || "",
        registeredPostcode: initialData?.registeredPostcode || "",
        registeredCountry: initialData?.registeredCountry || "United Kingdom",

        // Trading Address
        tradingAddress: initialData?.tradingAddress || "",
        tradingCity: initialData?.tradingCity || "",
        tradingPostcode: initialData?.tradingPostcode || "",

        // Company Type & SIC Codes
        companyType: initialData?.companyType || "",
        sicCodes: initialData?.sicCodes || "",

        financialYearEnd: initialData?.financialYearEnd || "",
        accountsNextDueDate: initialData?.accountsNextDueDate
            ? new Date(initialData.accountsNextDueDate).toISOString().split('T')[0]
            : "",
        confirmationNextDueDate: initialData?.confirmationNextDueDate
            ? new Date(initialData.confirmationNextDueDate).toISOString().split('T')[0]
            : "",

        lastConfirmationStatementDate: initialData?.lastConfirmationStatementDate
            ? new Date(initialData.lastConfirmationStatementDate).toISOString().split('T')[0]
            : "",
        lastAccountsCompaniesHouseDate: initialData?.lastAccountsCompaniesHouseDate
            ? new Date(initialData.lastAccountsCompaniesHouseDate).toISOString().split('T')[0]
            : "",
        lastAccountsHMRCDate: initialData?.lastAccountsHMRCDate
            ? new Date(initialData.lastAccountsHMRCDate).toISOString().split('T')[0]
            : "",
        lastFYEndDate: initialData?.lastFYEndDate
            ? new Date(initialData.lastFYEndDate).toISOString().split('T')[0]
            : "",

        nextConfirmationStatementDue: initialData?.nextConfirmationStatementDue
            ? new Date(initialData.nextConfirmationStatementDue).toISOString().split('T')[0]
            : "",
        nextAccountsCompaniesHouseDue: initialData?.nextAccountsCompaniesHouseDue
            ? new Date(initialData.nextAccountsCompaniesHouseDue).toISOString().split('T')[0]
            : "",
        nextAccountsHMRCDue: initialData?.nextAccountsHMRCDue
            ? new Date(initialData.nextAccountsHMRCDue).toISOString().split('T')[0]
            : "",
        nextFYEndDate: initialData?.nextFYEndDate
            ? new Date(initialData.nextFYEndDate).toISOString().split('T')[0]
            : "",

        // Tax Information
        vatRegistered: initialData?.vatRegistered || false,
        vatNumber: initialData?.vatNumber || "",
        vatRegistrationDate: initialData?.vatRegistrationDate
            ? new Date(initialData.vatRegistrationDate).toISOString().split('T')[0]
            : "",
        vatScheme: initialData?.vatScheme || "",
        vatReturnFrequency: initialData?.vatReturnFrequency || "",

        // HMRC Information
        payeReference: initialData?.payeReference || "",
        corporationTaxReference: initialData?.corporationTaxReference || "",
        utr: initialData?.utr || "",

        // Directors & Officers
        directors: initialData?.directors || "",
        companySecretary: initialData?.companySecretary || "",

        // Share Capital
        shareCapital: initialData?.shareCapital || "",
        numberOfShares: initialData?.numberOfShares || "",

        // Accounting Software & Methods
        accountingSoftware: initialData?.accountingSoftware || "",
        accountingMethod: initialData?.accountingMethod || "",

        // Contact Information
        contactEmail: initialData?.contactEmail || "",
        contactPhone: initialData?.contactPhone || "",
        website: initialData?.website || "",

        // AI Preferences
        aiProvider: initialData?.aiProvider || "openai",
        aiSystemPrompt: initialData?.aiSystemPrompt || `Act as the Chief Financial Officer (CFO) and Senior Strategic Consultant for this UK Private Limited (LTD) company.

OPERATIONAL IDENTITY:
- Entity: UK Ltd (Subject to Companies House and HMRC).
- Director: Sole shareholder, Spanish nationality, tax resident in Spain.
- Business Models: IT/Strategic professional services and Multichannel Retail (Amazon FBA, Shopify, Stripe).`,
        aiStrategicDirectives: initialData?.aiStrategicDirectives || `BEHAVIORAL PROTOCOLS:
1. DUAL PERSPECTIVE (UK-ES): Consider UK Corporation Tax and Spanish Tax Residency implications (CDI).
2. AMAZON FBA FOCUS: Understand Amazon reports (fees, storage, VAT) and reconcile Settlements.
3. FISCAL COMPLIANCE: Be rigorous with VAT thresholds and Companies House deadlines.
4. TONE: Professional, strategic, and direct.`,
        aiMemoryPrompt: initialData?.aiMemoryPrompt || `RAG OBJECTIVES & USER EXPECTATIONS:
- Synthesize treasury health when retrieving financial data.
- Alert on VAT implications for EU suppliers (VIES).
- Monitor Director's Loan Account (DLA) movements between personal and company accounts.`,
        aiCustomInstructions: initialData?.aiCustomInstructions || "",

        // Additional Notes
        notes: initialData?.notes || "",
    });



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/company-settings", {
                method: initialData ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    id: initialData?.id,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save company settings");
            }

            // After saving, trigger the AI sync to recalculate deadlines based on new data
            const syncResponse = await fetch("/api/compliance/refresh-dates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullSync: false }) // Just compliance sync for speed
            });
            const syncData = await syncResponse.json();

            // Artificial delay for better UX as requested
            await new Promise(resolve => setTimeout(resolve, 1000));

            window.dispatchEvent(new Event('settings-saved'));

            if (syncData.success) {
                toast.success("Settings Saved & Consensus Reached", {
                    description: `Dual-AI verification complete via ${syncData.provider}. Deadlines secured.`
                });
            } else {
                toast.success("Settings Saved", {
                    description: "Note: AI Recalculation pending."
                });
            }

            router.refresh();
        } catch (error) {
            console.error("Error saving company settings:", error);
            await confirm({
                title: "Error",
                message: "Error saving company settings. Please try again.",
                type: "danger",
                confirmText: "Close",
                cancelText: "",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
        // Notify siblings that there are unsaved changes
        window.dispatchEvent(new Event('settings-dirty'));
    };

    const handleAIRefresh = async () => {
        setIsRefreshingAI(true);
        try {
            const response = await fetch("/api/compliance/refresh-dates", {
                method: "POST",
            });
            const data = await response.json();

            if (data.success) {
                toast.success("AI Recalculation started", {
                    description: "The dates will update in a few seconds. Refresh the page to see changes."
                });
                // Wait a bit and refresh
                setTimeout(() => router.refresh(), 3000);
            } else {
                throw new Error(data.error || "Failed to trigger AI refresh");
            }
        } catch (error: any) {
            console.error("AI Refresh Error:", error);
            toast.error("AI Refresh failed", {
                description: error.message
            });
        } finally {
            setIsRefreshingAI(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Company Information */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Basic Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Company Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Company Number <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="companyNumber"
                            value={formData.companyNumber}
                            onChange={handleChange}
                            required
                            placeholder="e.g., 12345678"
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Incorporation Date <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="date"
                            name="incorporationDate"
                            value={formData.incorporationDate}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Company Type <span className="text-rose-400">*</span>
                        </label>
                        <select
                            name="companyType"
                            value={formData.companyType}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        >
                            <option value="">Select type...</option>
                            <option value="Ltd">Private Limited Company (Ltd)</option>
                            <option value="PLC">Public Limited Company (PLC)</option>
                            <option value="LLP">Limited Liability Partnership (LLP)</option>
                            <option value="Sole Trader">Sole Trader</option>
                            <option value="Partnership">Partnership</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            SIC Codes
                        </label>
                        <input
                            type="text"
                            name="sicCodes"
                            value={formData.sicCodes}
                            onChange={handleChange}
                            placeholder="e.g., 62012, 62020 (comma separated)"
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Registered Office Address */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Registered Office Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Address <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="registeredAddress"
                            value={formData.registeredAddress}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            City <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="registeredCity"
                            value={formData.registeredCity}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Postcode <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="registeredPostcode"
                            value={formData.registeredPostcode}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Country <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="registeredCountry"
                            value={formData.registeredCountry}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Trading Address */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Trading Address (if different)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Address
                        </label>
                        <input
                            type="text"
                            name="tradingAddress"
                            value={formData.tradingAddress}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            City
                        </label>
                        <input
                            type="text"
                            name="tradingCity"
                            value={formData.tradingCity}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Postcode
                        </label>
                        <input
                            type="text"
                            name="tradingPostcode"
                            value={formData.tradingPostcode}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Financial Year & Deadlines */}
            <section className="bg-slate-900/20 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-emerald-400">Financial Year & Deadlines</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">UK Filing Lifecycle Matrix</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Row 1: Last Filed Status */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">Last Filed (Manual Entry)</label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-2">CompaniesHouse Confirmation Statement</label>
                                <input
                                    type="date"
                                    name="lastConfirmationStatementDate"
                                    value={formData.lastConfirmationStatementDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-2">CompaniesHouse Annual Accounts</label>
                                <input
                                    type="date"
                                    name="lastAccountsCompaniesHouseDate"
                                    value={formData.lastAccountsCompaniesHouseDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-2">HMRC Accounts</label>
                                <input
                                    type="date"
                                    name="lastAccountsHMRCDate"
                                    value={formData.lastAccountsHMRCDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-2">Last Fiscal Year End</label>
                                <input
                                    type="date"
                                    name="lastFYEndDate"
                                    value={formData.lastFYEndDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white text-sm border-dashed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* Row 2: Future Deadlines */}
                    <div>
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 px-1 flex items-center gap-2">
                            Future Deadlines (AI Predicted)
                            <div className="px-2 py-0.5 bg-indigo-500/10 rounded-full text-[8px]">UK LAW COMPLIANT</div>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-indigo-300 mb-2 italic">Next Confirmation Due</label>
                                <input
                                    type="date"
                                    name="nextConfirmationStatementDue"
                                    value={formData.nextConfirmationStatementDue}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white text-sm font-bold active:scale-95 transition-transform"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-indigo-300 mb-2 italic">Next CompaniesHouse Accounts Due</label>
                                <input
                                    type="date"
                                    name="nextAccountsCompaniesHouseDue"
                                    value={formData.nextAccountsCompaniesHouseDue}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white text-sm font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-indigo-300 mb-2 italic">Next HMRC Accounts Due</label>
                                <input
                                    type="date"
                                    name="nextAccountsHMRCDue"
                                    value={formData.nextAccountsHMRCDue}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white text-sm font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-indigo-300 mb-2 italic">Next Year End Projection</label>
                                <input
                                    type="date"
                                    name="nextFYEndDate"
                                    value={formData.nextFYEndDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white text-sm font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Financial Year End Reference <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="financialYearEnd"
                                value={formData.financialYearEnd}
                                onChange={handleChange}
                                required
                                placeholder="DD-MM (e.g., 31-03)"
                                className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                            />
                        </div>
                        <div className="flex-1 hidden md:block opacity-50 pointer-events-none">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Legacy Sync Status</label>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-500 font-mono">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                LEGACY CompaniesHouse FIELDS SYNCHRONIZED
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VAT Information */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">VAT Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="vatRegistered"
                                checked={formData.vatRegistered}
                                onChange={handleChange}
                                className="w-5 h-5 bg-slate-800 border border-slate-700 rounded focus:ring-2 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium text-slate-300">VAT Registered</span>
                        </label>
                    </div>

                    {formData.vatRegistered && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    VAT Number
                                </label>
                                <input
                                    type="text"
                                    name="vatNumber"
                                    value={formData.vatNumber}
                                    onChange={handleChange}
                                    placeholder="GB123456789"
                                    className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    VAT Registration Date
                                </label>
                                <input
                                    type="date"
                                    name="vatRegistrationDate"
                                    value={formData.vatRegistrationDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    VAT Scheme
                                </label>
                                <select
                                    name="vatScheme"
                                    value={formData.vatScheme}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                                >
                                    <option value="">Select scheme...</option>
                                    <option value="Standard">Standard</option>
                                    <option value="Flat Rate">Flat Rate</option>
                                    <option value="Cash Accounting">Cash Accounting</option>
                                    <option value="Annual Accounting">Annual Accounting</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    VAT Return Frequency
                                </label>
                                <select
                                    name="vatReturnFrequency"
                                    value={formData.vatReturnFrequency}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                                >
                                    <option value="">Select frequency...</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Annual">Annual</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* HMRC Information */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">HMRC Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            UTR (Unique Taxpayer Reference)
                        </label>
                        <input
                            type="text"
                            name="utr"
                            value={formData.utr}
                            onChange={handleChange}
                            placeholder="1234567890"
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Corporation Tax Reference
                        </label>
                        <input
                            type="text"
                            name="corporationTaxReference"
                            value={formData.corporationTaxReference}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            PAYE Reference (if employer)
                        </label>
                        <input
                            type="text"
                            name="payeReference"
                            value={formData.payeReference}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Directors & Officers */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Directors & Officers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Directors (JSON format or comma-separated names)
                        </label>
                        <textarea
                            name="directors"
                            value={formData.directors}
                            onChange={handleChange}
                            rows={3}
                            placeholder='e.g., John Smith, Jane Doe'
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>


                </div>
            </section>

            {/* Share Capital */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Share Capital</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Share Capital (£)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="shareCapital"
                            value={formData.shareCapital}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Number of Shares
                        </label>
                        <input
                            type="number"
                            name="numberOfShares"
                            value={formData.numberOfShares}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>
                </div>
            </section>



            {/* Contact Information */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Contact Email
                        </label>
                        <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
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
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Strategic Neural Center (AI Configuration) */}
            <section className="bg-slate-900/40 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BrainCircuit size={80} className="text-indigo-400" />
                </div>

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl shadow-inner">
                                <Sparkles className="text-indigo-400" size={20} />
                            </div>
                            Strategic Neural Center
                        </h2>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.25em] mt-1 ml-11">Core Behavioral Engine</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter">RAG Memory Active</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Primary Intelligence Infrastructure</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, aiProvider: 'openai' }));
                                    window.dispatchEvent(new Event('settings-dirty'));
                                }}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all group/btn ${formData.aiProvider === 'openai'
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.2)]'
                                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:border-slate-600'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${formData.aiProvider === 'openai' ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black uppercase tracking-widest opacity-60">OpenAI</p>
                                    <p className="text-sm font-bold">GPT-4o Mini</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, aiProvider: 'gemini' }));
                                    window.dispatchEvent(new Event('settings-dirty'));
                                }}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all group/btn ${formData.aiProvider === 'gemini'
                                    ? 'bg-teal-600/20 border-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.2)]'
                                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:border-slate-600'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${formData.aiProvider === 'gemini' ? 'bg-teal-500' : 'bg-slate-700'}`}>
                                    <BrainCircuit size={18} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Google</p>
                                    <p className="text-sm font-bold">Gemini 1.5 Flash</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Multi-Model Protocol</p>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            The system now operates under a "Safe Consensus" logic. Both neural nodes are consulted for compliance and the most restrictive date is chosen automatically.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Core Identity & Rules */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Sparkles size={14} className="text-indigo-400" />
                                1. System Identity & Role
                            </label>
                            <textarea
                                name="aiSystemPrompt"
                                value={formData.aiSystemPrompt}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Define who the AI is (e.g., Strategic CFO)..."
                                className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-indigo-100 text-xs font-mono leading-relaxed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <BrainCircuit size={14} className="text-purple-400" />
                                2. Strategic Directives
                            </label>
                            <textarea
                                name="aiStrategicDirectives"
                                value={formData.aiStrategicDirectives}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Define business rules, compliance logic, and operational constraints..."
                                className="w-full px-4 py-2 bg-slate-950/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-purple-100 text-xs font-mono leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Right Column: Adaptive Memory (Dumping Ground) */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <label className="block text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <RefreshCw size={14} className="animate-spin-slow" />
                                    3. Adaptive Memory (Trash Box / Log)
                                </label>
                                <p className="text-[10px] text-slate-500 font-medium">Throw here day-to-day notes for the AI to learn from you.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const timestamp = new Date().toLocaleDateString('en-GB');
                                    const directive = `\n[DIRECTIVE ${timestamp}]: `;
                                    setFormData(prev => ({
                                        ...prev,
                                        aiMemoryPrompt: (prev.aiMemoryPrompt || "") + directive
                                    }));
                                }}
                                className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-[9px] font-bold text-amber-400 uppercase tracking-widest transition-all active:scale-95"
                            >
                                + New Directive
                            </button>
                        </div>

                        <div className="relative h-full">
                            <textarea
                                name="aiMemoryPrompt"
                                value={formData.aiMemoryPrompt}
                                onChange={handleChange}
                                rows={11}
                                placeholder="Neural Trash Box: Dump everything you want me to remember here (rules, context, style)..."
                                className="w-full h-full px-4 py-3 bg-slate-950/60 border border-amber-500/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-amber-50/90 text-[13px] font-mono leading-relaxed placeholder:opacity-20"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {["Tax Resident ES", "Bilingual ES/EN", "Cashflow Focus"].map((chip) => (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => {
                                        const directive = `\n# MEMORY: ${chip.toUpperCase()}`;
                                        setFormData(prev => ({
                                            ...prev,
                                            aiMemoryPrompt: (prev.aiMemoryPrompt || "") + directive
                                        }));
                                        window.dispatchEvent(new Event('settings-dirty'));
                                    }}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-[9px] font-medium text-slate-500 transition-colors"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Financial Categories Reference */}
            <FinancialCategoriesGuide />

            {/* Additional Notes */}

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
                        className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                    />
                </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
                >
                    {loading ? "Saving..." : "Save Company Settings"}
                </button>
            </div>
        </form>
    );
}
