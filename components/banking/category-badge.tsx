'use client';

import { useState, useRef, useEffect } from 'react';
import { updateTransactionCategory } from '@/app/actions/banking';
import { Check, Plus, Tag } from 'lucide-react';

const CATEGORIES = [
    { name: 'Sales', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' },
    { name: 'Marketing', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20 hover:bg-pink-500/20' },
    { name: 'Software', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20' },
    { name: 'Travel', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' },
    { name: 'Meals', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20' },
    { name: 'Office', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20' },
    { name: 'Payroll', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20' },
    { name: 'Taxes', color: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' },
    { name: 'Utilities', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20' },
];

export function CategoryBadge({ transactionId, initialCategory }: { transactionId: string, initialCategory: string | null }) {
    const [category, setCategory] = useState(initialCategory);
    const [isOpen, setIsOpen] = useState(false);
    const [customCategory, setCustomCategory] = useState('');
    const [isCustomMode, setIsCustomMode] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsCustomMode(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = async (newCategory: string) => {
        setCategory(newCategory);
        setIsOpen(false);
        setIsCustomMode(false);
        await updateTransactionCategory(transactionId, newCategory);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customCategory.trim()) {
            handleSelect(customCategory.trim());
        }
    };

    const currentStyle = CATEGORIES.find(c => c.name === category)?.color || 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700';

    return (
        <div className="relative inline-block" ref={menuRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`
                    px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-200
                    flex items-center gap-1.5 whitespace-nowrap
                    ${currentStyle}
                `}
            >
                {category || 'Uncategorized'}
                {!category && <Plus size={12} className="opacity-50" />}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {!isCustomMode ? (
                        <>
                            <div className="p-1.5 grid grid-cols-1 gap-0.5">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.name}
                                        onClick={(e) => { e.stopPropagation(); handleSelect(cat.name); }}
                                        className={`
                                            w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between group
                                            ${cat.name === category ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${cat.color.split(' ')[0].replace('/10', '')}`} />
                                            {cat.name}
                                        </div>
                                        {cat.name === category && <Check size={12} className="text-emerald-400" />}
                                    </button>
                                ))}
                            </div>
                            <div className="border-t border-slate-800 p-1.5">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsCustomMode(true); }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-uhuru-blue transition-colors flex items-center gap-2"
                                >
                                    <Tag size={12} />
                                    Custom Category...
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleCustomSubmit} className="p-2" onClick={(e) => e.stopPropagation()}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Enter category..."
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-uhuru-blue mb-2"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCustomMode(false)}
                                    className="flex-1 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!customCategory.trim()}
                                    className="flex-1 py-1.5 text-xs text-white bg-uhuru-blue hover:bg-uhuru-blue-light rounded-md disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
