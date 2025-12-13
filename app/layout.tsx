import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Management Outlook ERP&CRM",
    description: "Uhuru Trade Ltd Management System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen bg-slate-950 text-slate-100">{children}</body>
        </html>
    );
}
