import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden bg-uhuru-base">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-uhuru-accent-blue/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-uhuru-accent-purple/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-16">
                <div className="fixed left-0 top-0 flex w-full justify-center border-b border-uhuru-border bg-uhuru-base/80 backdrop-blur-xl pb-6 pt-8 lg:static lg:w-auto lg:rounded-2xl lg:border lg:bg-uhuru-card lg:p-6">
                    <p className="text-white font-semibold text-lg">
                        Uhuru Trade Ltd
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative flex place-items-center flex-col gap-12 z-10">
                <div className="text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-uhuru-accent-blue/10 border border-uhuru-accent-blue/30 text-uhuru-accent-blue mb-6 backdrop-blur-sm">
                        <Sparkles size={16} />
                        <span className="text-sm font-medium">Enterprise Resource Planning & CRM</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-uhuru-accent-blue via-uhuru-accent-purple to-emerald-400">
                            Management Outlook
                        </span>
                        <br />
                        <span className="text-white">ERP & CRM</span>
                    </h1>

                    <p className="text-uhuru-text-muted text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                        Secure Enterprise Resource Planning & Customer Relationship Management.
                        Streamline your business operations with our powerful platform.
                    </p>

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-uhuru-accent-blue hover:bg-blue-600 text-white rounded-xl font-semibold text-lg transition-all shadow-glow hover:shadow-lg transform hover:scale-105"
                    >
                        Enter ERP & CRM
                        <ArrowRight size={20} />
                    </Link>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl w-full">
                    {[
                        { title: "Banking", desc: "Manage transactions and accounts" },
                        { title: "CRM", desc: "Track leads and customer relationships" },
                        { title: "Compliance", desc: "Stay on top of deadlines" }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-uhuru-card backdrop-blur-sm border border-uhuru-border hover:border-uhuru-accent-blue/50 transition-all group">
                            <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-uhuru-accent-blue transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-uhuru-text-dim text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-center text-uhuru-text-dim text-sm">
                <p>© 2025 Uhuru Trade Ltd. All rights reserved.</p>
            </div>
        </main>
    );
}
