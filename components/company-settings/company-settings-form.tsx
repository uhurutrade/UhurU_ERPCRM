"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FinancialCategoriesGuide } from "./financial-categories-guide";

interface CompanySettingsFormProps {
    initialData: any;
}

import { useConfirm } from "@/components/providers/modal-provider";

export default function CompanySettingsForm({ initialData }: CompanySettingsFormProps) {
    const router = useRouter();
    const { confirm } = useConfirm();
    const [loading, setLoading] = useState(false);
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
        aiCustomInstructions: initialData?.aiCustomInstructions || `Actúa como el Chief Financial Officer (CFO) y Consultor Estratégico Senior de esta compañía Private Limited (LTD) del Reino Unido.

IDENTIDAD OPERATIVA:
- Entidad: UK Ltd (Sujeta a Companies House y HMRC).
- Director: Único accionista, de nacionalidad española y residente fiscal en España (Modelo 100/720 en España).
- Modelos de Negocio: Consultoría de servicios profesionales IT/Estratégica y Venta Retail Multicanal (Amazon FBA, Shopify, Stripe).

PROTOCOLOS DE COMPORTAMIENTO (SYSTEM PROMPT):
1. PERSPECTIVA DUAL (UK-ES): Cada vez que analices un gasto o ingreso, considera no solo su deducibilidad en el Reino Unido (Corporation Tax), sino también las implicaciones del Convenio para evitar la Doble Imposición (CDI) entre UK y España.
2. FOCO EN AMAZON FBA: Entiende la estructura de los informes de Amazon (fees, removals, storage, VAT en destino). Ayuda a conciliar los Settlements con las transacciones bancarias.
3. CUMPLIMIENTO FISCAL (VAT/TAX): Sé extremadamente riguroso con los umbrales de IVA (VAT thresholds) y las reglas de "Place of Supply" para servicios. Alerta proactivamente sobre fechas de "Confirmation Statement" y "Annual Accounts".
4. TONO Y LENGUAJE: Dirígete a mí SIEMPRE en Español, ya que soy español. Aunque el sistema y los documentos estén en inglés y podamos tratar conceptos técnicos en ese idioma, tu comunicación conmigo debe ser en castellano profesional y directo. Usa terminología técnica inglesa cuando sea necesario (e.g., "Shareholders Agreement", "Capital Allowance") pero siempre explicada o integrada en una respuesta en español.

OBJETIVOS DEL RAG (USER EXPECTATIONS):
- Al recuperar datos financieros, no te limites a listar transacciones; sintetiza la salud de la tesorería.
- Si detectas una factura de un proveedor español, recuerda la importancia del IVA intracomunitario (VIES) o la posible retención si aplica.
- Evalúa los movimientos entre la cuenta de la empresa y la cuenta personal del director como "Director's Loan Account" o dividendos, advirtiendo sobre las implicaciones fiscales según las leyes de UK y la residencia en España.

Tu misión es transformar los datos crudos en inteligencia de negocio para minimizar la carga fiscal de forma legal y maximizar la rentabilidad operativa.`,

        // Additional Notes
        notes: initialData?.notes || "",
    });

    const [isCalculatingAI, setIsCalculatingAI] = useState(false);

    const handleCalculateDeadlines = async () => {
        setIsCalculatingAI(true);
        try {
            const prompt = `Calcula las próximas fechas de vencimiento (Next Deadlines) para una empresa UK Ltd basándome en:
- Fecha de Incorporación: ${formData.incorporationDate}
- Última Presentación CompaniesHouse: ${formData.lastAccountsCompaniesHouseDate || 'No disponible'}
- Última Presentación HMRC: ${formData.lastAccountsHMRCDate || 'No disponible'}
- Última Confirmation Statement: ${formData.lastConfirmationStatementDate || 'No disponible'}
- Último Año Fiscal Finalizado: ${formData.lastFYEndDate || 'No disponible'}

Devuelve un JSON estrictamente con este formato:
{
  "nextConfirmationStatementDue": "YYYY-MM-DD",
  "nextAccountsCompaniesHouseDue": "YYYY-MM-DD",
  "nextAccountsHMRCDue": "YYYY-MM-DD",
  "nextFYEndDate": "YYYY-MM-DD"
}`;

            const res = await fetch('/api/compliance/ai-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt })
            });

            const data = await res.json();
            // Parse JSON from AI response
            const jsonStr = data.reply.match(/\{[\s\S]*\}/)[0];
            const deadlines = JSON.parse(jsonStr);

            setFormData(prev => ({
                ...prev,
                ...deadlines
            }));

            // Also update the fallback legacy fields
            setFormData(prev => ({
                ...prev,
                accountsNextDueDate: deadlines.nextAccountsCompaniesHouseDue,
                confirmationNextDueDate: deadlines.nextConfirmationStatementDue
            }));

        } catch (error) {
            console.error("AI Deadline Calculation failed:", error);
        } finally {
            setIsCalculatingAI(false);
        }
    };

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

            // Artificial delay for better UX as requested
            await new Promise(resolve => setTimeout(resolve, 1000));

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
                    <button
                        type="button"
                        onClick={handleCalculateDeadlines}
                        disabled={isCalculatingAI}
                        className={`flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-black transition-all ${isCalculatingAI ? 'animate-pulse opacity-50' : ''}`}
                    >
                        <span>{isCalculatingAI ? '🤖 CALCULATING...' : '🤖 SYNC LEGAL DEADLINES (AI)'}</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Row 1: Last Filed Status */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">Row 1: Last Filed (Manual Entry)</label>
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
                            Row 2: Future Deadlines (AI Predicted)
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

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Company Secretary
                        </label>
                        <input
                            type="text"
                            name="companySecretary"
                            value={formData.companySecretary}
                            onChange={handleChange}
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

            {/* Accounting Software & Methods */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Accounting Software & Methods</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Accounting Software
                        </label>
                        <select
                            name="accountingSoftware"
                            value={formData.accountingSoftware}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        >
                            <option value="">Select software...</option>
                            <option value="Xero">Xero</option>
                            <option value="QuickBooks">QuickBooks</option>
                            <option value="Sage">Sage</option>
                            <option value="FreeAgent">FreeAgent</option>
                            <option value="Manual">Manual</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Accounting Method
                        </label>
                        <select
                            name="accountingMethod"
                            value={formData.accountingMethod}
                            onChange={handleChange}
                            className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-xs sm:text-sm"
                        >
                            <option value="">Select method...</option>
                            <option value="Cash Basis">Cash Basis</option>
                            <option value="Accrual Basis">Accrual Basis</option>
                        </select>
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

            {/* AI Configuration */}
            <section className="bg-slate-900/40 p-6 rounded-xl border border-indigo-500/20 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-indigo-400 flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-500/10 rounded-lg">🤖</span>
                    AI Configuration & Assistant
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Select AI Infrastructure Provider
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, aiProvider: 'openai' }))}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${formData.aiProvider === 'openai'
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <span className="text-lg">✨</span>
                                OpenAI (ChatGPT)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, aiProvider: 'gemini' }))}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${formData.aiProvider === 'gemini'
                                    ? 'bg-teal-600/20 border-teal-500 text-white font-bold'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <span className="text-lg">💎</span>
                                Google Gemini
                            </button>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                            {formData.aiProvider === 'openai'
                                ? "Infrastructure: GPT-4o Mini (Cost Optimized)"
                                : "Infrastructure: Gemini 1.5 Flash (Optimized Cost)"}
                        </p>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-2 h-2 rounded-full ${process.env.NEXT_PUBLIC_AI_STATUS === 'ready' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">System Status</span>
                        </div>
                        <p className="text-xs text-slate-400 ">
                            All API keys are securely managed via environment variables. Ensure OPENAI_API_KEY or GEMINI_API_KEY are configured in your .env file on the VPS.
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <span>📝</span>
                        AI Personal Behavior & RAG Instructions (System/User Prompt)
                    </label>
                    <textarea
                        name="aiCustomInstructions"
                        value={formData.aiCustomInstructions}
                        onChange={handleChange}
                        rows={12}
                        placeholder="Define how the AI should behave and what context it should prioritize..."
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm font-mono leading-relaxed"
                    />
                    <p className="mt-2 text-[10px] text-slate-500 italic">
                        This prompt acts as the primary identity and knowledge base for the RAG engine. Be specific about tax residency, business models, and legal expectations.
                    </p>
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
