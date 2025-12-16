import { auth } from "@/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import InactivityMonitor from "@/components/auth/inactivity-monitor";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth();

    return (
        <InactivityMonitor>
            <div className="min-h-screen bg-background">
                <Sidebar userEmail={session?.user?.email} />

                {/* Main Content */}
                <main className="md:ml-72 min-h-screen bg-background p-4 md:p-8 relative transition-all duration-300">
                    {/* Background decorative elements */}
                    <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
                    </div>

                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </InactivityMonitor>
    )
}
