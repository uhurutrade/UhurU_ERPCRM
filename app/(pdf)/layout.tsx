import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
    title: "Uhuru Invoice",
    description: "Uhuru Trade Ltd Invoice System",
};

export default function PdfLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white text-black">
            {children}
        </div>
    );
}
