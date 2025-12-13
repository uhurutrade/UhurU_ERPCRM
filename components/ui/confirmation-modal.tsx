'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'danger',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}: ConfirmationModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertTriangle className="text-rose-500" size={32} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={32} />;
            case 'success': return <CheckCircle className="text-emerald-500" size={32} />;
            case 'info': return <Info className="text-blue-500" size={32} />;
        }
    };

    const getConfirmButtonClass = () => {
        switch (type) {
            case 'danger': return 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500';
            case 'warning': return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
            case 'success': return 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500';
            case 'info': return 'bg-uhuru-blue hover:bg-uhuru-blue-light focus:ring-uhuru-blue';
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={`relative w-full max-w-md transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <div className="bg-gradient-card backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 mx-4">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 p-3 bg-slate-800/50 rounded-full border border-slate-700/50">
                            {getIcon()}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">
                            {title}
                        </h3>

                        <p className="text-slate-300 mb-6 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex gap-3 w-full justify-end">
                            {cancelText && (
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700/50 transition-colors"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl ${getConfirmButtonClass()}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
