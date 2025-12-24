'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-indigo-600/20"
        >
            <Printer size={16} />
            Print / Save PDF
        </button>
    );
}
