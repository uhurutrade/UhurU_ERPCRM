'use client';

import { useState, useRef, useEffect } from 'react';
import { updateTransactionCategory } from '@/app/actions/banking';
import { getTransactionCategories, createTransactionCategory } from '@/app/actions/categories';
import { Check, Plus, Tag, Palette } from 'lucide-react';

const PRESET_COLORS = [
    { name: 'White', solid: 'bg-slate-100', class: 'bg-slate-100/10 text-slate-200 border-slate-100/20 hover:bg-slate-100/20' },
    { name: 'Yellow', solid: 'bg-yellow-400', class: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/20 hover:bg-yellow-400/20' },
    { name: 'Blue', solid: 'bg-blue-400', class: 'bg-blue-400/10 text-blue-300 border-blue-400/20 hover:bg-blue-400/20' },
    { name: 'Red', solid: 'bg-rose-400', class: 'bg-rose-400/10 text-rose-300 border-rose-400/20 hover:bg-rose-400/20' },
    { name: 'Green', solid: 'bg-emerald-400', class: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20 hover:bg-emerald-400/20' },
    { name: 'Purple', solid: 'bg-purple-400', class: 'bg-purple-400/10 text-purple-300 border-purple-400/20 hover:bg-purple-400/20' },
    { name: 'Pink', solid: 'bg-pink-400', class: 'bg-pink-400/10 text-pink-300 border-pink-400/20 hover:bg-pink-400/20' },
    { name: 'Cyan', solid: 'bg-cyan-400', class: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20 hover:bg-cyan-400/20' },
    { name: 'Orange', solid: 'bg-orange-400', class: 'bg-orange-400/10 text-orange-300 border-orange-400/20 hover:bg-orange-400/20' },
    { name: 'Lime', solid: 'bg-lime-400', class: 'bg-lime-400/10 text-lime-300 border-lime-400/20 hover:bg-lime-400/20' },
];

const DEFAULT_CATEGORIES = [
    { name: 'Sales', color: PRESET_COLORS[0].class },
    { name: 'Marketing', color: PRESET_COLORS[1].class },
    { name: 'Software', color: PRESET_COLORS[2].class },
    { name: 'Travel', color: PRESET_COLORS[3].class },
    { name: 'Meals', color: PRESET_COLORS[4].class },
    { name: 'Office', color: PRESET_COLORS[5].class },
    { name: 'Payroll', color: PRESET_COLORS[6].class },
    { name: 'Taxes', color: PRESET_COLORS[7].class },
    { name: 'Utilities', color: PRESET_COLORS[8].class },
];

export function CategoryBadge({ transactionId, initialCategory }: { transactionId: string, initialCategory: string | null }) {
    const [category, setCategory] = useState(initialCategory);
    const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
    const [isOpen, setIsOpen] = useState(false);

    // Custom Category State
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customColor, setCustomColor] = useState(PRESET_COLORS[5].class); // Default to Slate

    const menuRef = useRef<HTMLDivElement>(null);

    // Fetch categories when opening the menu to ensure fresh data across rows
    useEffect(() => {
        if (isOpen) {
            getTransactionCategories().then(res => {
                if (res.success && res.categories && res.categories.length > 0) {
                    // Merge DB categories with Default ones (deduplicating by name)
                    const dbCats = res.categories.map((c: any) => ({ name: c.name, color: c.color }));
                    const allCats = [...dbCats];

                    // Add defaults if they don't exist
                    DEFAULT_CATEGORIES.forEach(def => {
                        if (!allCats.find(c => c.name === def.name)) {
                            allCats.push(def);
                        }
                    });

                    setCategories(allCats.sort((a, b) => a.name.localeCompare(b.name)));
                }
            });
        }
    }, [isOpen]);

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

    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (customName.trim()) {
            const name = customName.trim();
            // Optimistic update
            const newCat = { name, color: customColor };
            setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
            setCategory(name);
            setIsOpen(false);
            setIsCustomMode(false);
            setCustomName('');

            // API calls
            await createTransactionCategory(name, customColor); // Persist category
            await updateTransactionCategory(transactionId, name); // Update transaction
        }
    };

    const currentCat = categories.find(c => c.name === category);
    const currentStyle = currentCat?.color || 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700';

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
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {!isCustomMode ? (
                        <>
                            <div className="max-h-60 overflow-y-auto p-1.5 grid grid-cols-1 gap-0.5 custom-scrollbar">
                                {categories.map((cat) => (
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
                                    <Plus size={12} />
                                    New Category...
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleCustomSubmit} className="p-3" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. Subscriptions"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-uhuru-blue"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Color</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => setCustomColor(color.class)}
                                            className={`
                                                w-6 h-6 rounded-full flex items-center justify-center transition-all
                                                ${color.solid}
                                                ${customColor === color.class ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}
                                            `}
                                            title={color.name}
                                        >
                                            {customColor === color.class && <Check size={10} className="text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCustomMode(false)}
                                    className="flex-1 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!customName.trim()}
                                    className="flex-1 py-1.5 text-xs text-white bg-uhuru-blue hover:bg-uhuru-blue-light rounded-md disabled:opacity-50 transition-colors font-medium shadow-uhuru-sm"
                                >
                                    Create & Save
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
