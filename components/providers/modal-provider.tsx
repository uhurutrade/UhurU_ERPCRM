'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ConfirmationModal } from '../ui/confirmation-modal';

interface ConfirmOptions {
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
}

interface ModalContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({
        title: '',
        message: '',
        type: 'danger',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    });

    // We use a ref to store the resolve function of the promise
    const resolveRef = useRef<(value: boolean) => void>(() => { });

    const confirm = useCallback((options: ConfirmOptions) => {
        setOptions({
            type: 'danger', // default
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            ...options
        });
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleConfirm = useCallback(() => {
        resolveRef.current(true);
        setIsOpen(false);
    }, []);

    const handleCancel = useCallback(() => {
        resolveRef.current(false);
        setIsOpen(false);
    }, []);

    return (
        <ModalContext.Provider value={{ confirm }}>
            {children}
            <ConfirmationModal
                isOpen={isOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                title={options.title}
                message={options.message}
                type={options.type}
                confirmText={options.confirmText}
                cancelText={options.cancelText}
            />
        </ModalContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useConfirm must be used within a ModalProvider');
    }
    return context;
}
