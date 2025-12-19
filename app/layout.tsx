import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Management Outlook ERP&CRM",
    description: "Uhuru Trade Ltd Management System",
};

import { ModalProvider } from "@/components/providers/modal-provider";
import { Toaster } from 'sonner';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
                <ModalProvider>
                    {children}
                </ModalProvider>
                <Toaster richColors position="top-right" theme="dark" />
            </body>
        </html>
    );
}
