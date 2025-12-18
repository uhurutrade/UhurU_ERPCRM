'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth,
    size = '2xl'
}: ModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const sizeClasses = {
        sm: 'max-w-md',      // 448px
        md: 'max-w-lg',      // 512px
        lg: 'max-w-2xl',     // 672px - Perfect for "complete" but compact
        xl: 'max-w-4xl',     // 896px
        '2xl': 'max-w-6xl',   // 1152px
    };

    const finalMaxWidth = maxWidth || sizeClasses[size as keyof typeof sizeClasses] || 'max-w-2xl';

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

    if (!mounted || !isVisible) return null;

    const modalContent = (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={`relative w-full ${finalMaxWidth} transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <div className="bg-[#0B1121] border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.4)] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/40">
                        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
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

    return createPortal(modalContent, document.body);
}
