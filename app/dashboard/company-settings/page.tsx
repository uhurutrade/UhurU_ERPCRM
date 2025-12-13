import { prisma } from "@/lib/prisma";
import CompanySettingsForm from "@/components/company-settings/company-settings-form";
import ComplianceOverview from "@/components/company-settings/compliance-overview";

export default async function CompanySettingsPage() {
    // Fetch existing company settings (there should only be one record)
    const companySettings = await prisma.companySettings.findFirst();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Company Settings</h1>
                <p className="text-slate-400">
                    Manage your company information for UK legal compliance (Companies House, HMRC, VAT)
                </p>
            </div>

            {/* Compliance Overview */}
            <ComplianceOverview />

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <CompanySettingsForm initialData={companySettings} />
            </div>
        </div>
    );
}
