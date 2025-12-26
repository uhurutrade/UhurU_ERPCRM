'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateTransactionCategory } from '@/app/actions/banking';
import { getTransactionCategories, createTransactionCategory, deleteTransactionCategory, updateTransactionCategoryDefinition } from '@/app/actions/categories';
import { Check, Plus, Tag, Palette, Trash2, X, Pencil } from 'lucide-react';
import { useConfirm } from '@/components/providers/modal-provider';

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

export function CategoryBadge({ transactionId, initialCategory, allCategories = [] }: { transactionId: string, initialCategory: string | null, allCategories?: any[] }) {
    const router = useRouter();
    const [category, setCategory] = useState(initialCategory);
    const { confirm } = useConfirm();

    // Initialize with provided categories (server ensures they are populated)
    const [categories, setCategories] = useState<any[]>(() => {
        return allCategories.sort((a, b) => a.name.localeCompare(b.name));
    });

    const [isOpen, setIsOpen] = useState(false);

    // Custom Category State
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [editingCategory, setEditingCategory] = useState<string | null>(null); // Track if editing existing
    const [customName, setCustomName] = useState('');
    const [customColor, setCustomColor] = useState(PRESET_COLORS[5].class); // Default to Slate

    const menuRef = useRef<HTMLDivElement>(null);

    // Fetch categories when opening the menu to ensure fresh data across rows
    useEffect(() => {
        if (isOpen) {
            getTransactionCategories().then(res => {
                if (res.success && res.categories) {
                    setCategories(res.categories.sort((a: any, b: any) => a.name.localeCompare(b.name)));
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
        router.refresh(); // Sync all instances of this transaction in UI
    };

    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (customName.trim()) {
            const name = customName.trim();

            if (editingCategory) {
                // --- EDIT MODE ---
                await updateTransactionCategoryDefinition(editingCategory, name, customColor);

                // Update local state
                setCategories(prev => prev.map(c => c.name === editingCategory ? { name, color: customColor } : c));
                if (category === editingCategory) setCategory(name);

            } else {
                // --- CREATE MODE ---
                // Optimistic update
                const newCat = { name, color: customColor };
                setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
                setCategory(name);

                await createTransactionCategory(name, customColor);
                await updateTransactionCategory(transactionId, name);
                router.refresh();
            }

            setIsOpen(false);
            setIsCustomMode(false);
            setEditingCategory(null);
            setCustomName('');
            setCustomColor(PRESET_COLORS[5].class);
        }
    };

    const handleEditClick = (cat: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCategory(cat.name);
        setCustomName(cat.name);
        setCustomColor(cat.color);
        setIsCustomMode(true);
    };

    const handleDeleteCategory = async (catName: string, e: React.MouseEvent) => {
        e.stopPropagation();

        const confirmed = await confirm({
            title: 'Delete Category',
            message: `Are you sure you want to delete "${catName}"? This will set all related transactions to Uncategorized.`,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        // Optimistic update locally
        setCategories(prev => prev.filter(c => c.name !== catName));
        if (category === catName) {
            setCategory(null);
        }

        const res = await deleteTransactionCategory(catName);
        if (!res.success) {
            // Show error using confirm modal
            await confirm({
                title: 'Error',
                message: 'Failed to delete category. Please try again.',
                type: 'danger',
                confirmText: 'OK',
                cancelText: ''
            });
            // Re-fetch or revert if critical (skipping for now for UI responsiveness)
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
                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {!isCustomMode ? (
                        <>
                            <div className="max-h-60 overflow-y-auto p-1.5 grid grid-cols-1 gap-0.5 custom-scrollbar">
                                {/* Always present Uncategorized option */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleSelect(''); }}
                                    className={`
                                        w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-3 group
                                        ${!category ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'}
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                                        Uncategorized
                                    </div>
                                    {!category && <Check size={12} className="ml-auto text-emerald-400" />}
                                </button>

                                <div className="h-px bg-slate-800 my-1 mx-2" />

                                {(() => {
                                    // Group categories by prefix
                                    const groups: Record<string, any[]> = {};
                                    const ungrouped: any[] = [];

                                    categories.forEach(cat => {
                                        if (cat.name.includes(':')) {
                                            const [groupName, itemName] = cat.name.split(':').map(s => s.trim());
                                            if (!groups[groupName]) groups[groupName] = [];
                                            groups[groupName].push({ ...cat, displayName: itemName });
                                        } else {
                                            ungrouped.push({ ...cat, displayName: cat.name });
                                        }
                                    });

                                    return (
                                        <>
                                            {/* Render Groups */}
                                            {Object.entries(groups).map(([groupName, items]) => (
                                                <div key={groupName} className="mb-2 last:mb-0">
                                                    <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter bg-slate-800/30 rounded-md mb-1 mx-1 flex items-center gap-2">
                                                        <Tag size={10} />
                                                        {groupName}
                                                    </div>
                                                    {items.map((cat) => (
                                                        <button
                                                            key={cat.name}
                                                            onClick={(e) => { e.stopPropagation(); handleSelect(cat.name); }}
                                                            className={`
                                                                w-full text-left px-5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-3 group
                                                                ${cat.name === category ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${cat.color.split(' ')[0].replace('/10', '')}`} />
                                                                {cat.displayName}
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                                                                {cat.name === category && <Check size={12} className="text-emerald-400 mr-1" />}
                                                                <div onClick={(e) => handleEditClick(cat, e)} className="p-1 text-slate-500 hover:text-uhuru-blue hover:bg-slate-700 rounded cursor-pointer transition-colors" title="Edit Category">
                                                                    <Pencil size={11} />
                                                                </div>
                                                                <div onClick={(e) => handleDeleteCategory(cat.name, e)} className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded cursor-pointer transition-colors" title="Delete Category">
                                                                    <Trash2 size={11} />
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}

                                            {/* Render Ungrouped */}
                                            {ungrouped.length > 0 && (
                                                <div className="mt-1">
                                                    {Object.keys(groups).length > 0 && <div className="h-px bg-slate-800 my-1 mx-2" />}
                                                    {ungrouped.map((cat) => (
                                                        <button
                                                            key={cat.name}
                                                            onClick={(e) => { e.stopPropagation(); handleSelect(cat.name); }}
                                                            className={`
                                                                w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-3 group
                                                                ${cat.name === category ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${cat.color.split(' ')[0].replace('/10', '')}`} />
                                                                {cat.displayName}
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                                                                {cat.name === category && <Check size={12} className="text-emerald-400 mr-1" />}
                                                                <div onClick={(e) => handleEditClick(cat, e)} className="p-1 text-slate-500 hover:text-uhuru-blue hover:bg-slate-700 rounded cursor-pointer transition-colors" title="Edit Category">
                                                                    <Pencil size={11} />
                                                                </div>
                                                                <div onClick={(e) => handleDeleteCategory(cat.name, e)} className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded cursor-pointer transition-colors" title="Delete Category">
                                                                    <Trash2 size={11} />
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
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
                                <label className="block text-xs font-semibold text-slate-500 mb-1">
                                    {editingCategory ? 'Edit Category Name' : 'New Category Name'}
                                </label>
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
                                    {editingCategory ? 'Save Changes' : 'Create & Save'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
