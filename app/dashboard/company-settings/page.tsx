export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { BrainCircuit } from "lucide-react";
import CompanySettingsForm from "@/components/company-settings/company-settings-form";
import ComplianceOverview from "@/components/company-settings/compliance-overview";
import { serializeData } from "@/lib/serialization";
import SyncNodeButton from "@/components/company-settings/sync-node-button";
export default async function CompanySettingsPage() {
    // Fetch existing company settings (there should only be one record)
    const companySettings = await prisma.companySettings.findFirst();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Company Settings</h1>
                    <p className="text-slate-400">
                        Manage your company information for UK legal compliance (Companies House, HMRC, VAT)
                    </p>
                </div>
                <SyncNodeButton />
            </div>

            {/* Compliance Overview */}
            <ComplianceOverview initialData={serializeData(companySettings)} />

            <div className="bg-gradient-card backdrop-blur-xl rounded-xl border border-slate-800 p-6">
                <CompanySettingsForm initialData={serializeData(companySettings)} />
            </div>
        </div>
    );
}
