import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Management Outlook ERP&CRM",
    description: "Uhuru Trade Ltd Management System",
    icons: {
        icon: '/icon.png',
        apple: '/apple-icon.png',
    }
};

export const viewport: Viewport = {
    themeColor: '#020617', // slate-950
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

import { ModalProvider } from "@/components/providers/modal-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from 'sonner';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
                <AuthProvider>
                    <ModalProvider>
                        {children}
                    </ModalProvider>
                </AuthProvider>
                <Toaster richColors position="top-right" theme="dark" />
            </body>
        </html>
    );
}
