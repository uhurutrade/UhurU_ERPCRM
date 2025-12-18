'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-2xl'
}: ModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => {
                clearTimeout(timer);
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={`relative w-full ${maxWidth} transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <div className="bg-uhuru-card border border-uhuru-border rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-uhuru-border bg-slate-900/40">
                        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-uhuru-text-dim hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
