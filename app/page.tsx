import Link from "next/link";
import { Lock } from "lucide-react";
import { signIn } from "@/auth";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-950 to-slate-900">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex border-b border-gray-800 pb-6 mb-12">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    Uhuru Trade Ltd
                </p>
            </div>

            <div className="relative flex place-items-center flex-col gap-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
                        Management Outlook ERP&CRM
                    </h1>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Secure Enterprise Resource Planning & Customer Relationship Management
                    </p>
                </div>

                <div className="flex flex-col gap-4 mt-8">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                        Enter ERP & CRM
                    </Link>
                </div>
            </div>
        </main>
    );
}
