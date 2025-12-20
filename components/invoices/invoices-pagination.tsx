'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl?: string;
    pageParam?: string;
    onPageChange?: (page: number) => void;
}

export function StandardPagination({ currentPage, totalPages, baseUrl = '', pageParam = 'page', onPageChange }: PaginationProps) {
    const router = useRouter();

    const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const val = (e.target as HTMLInputElement).value;
            const pageNum = parseInt(val);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                if (onPageChange) {
                    onPageChange(pageNum);
                } else if (baseUrl) {
                    const url = new URL(window.location.href);
                    url.searchParams.set(pageParam, pageNum.toString());
                    router.push(url.pathname + url.search);
                }
            }
        }
    };

    const getUrl = (pageNum: number) => {
        if (onPageChange) return '#';
        if (typeof window === 'undefined') return `${baseUrl}?${pageParam}=${pageNum}`;
        const url = new URL(window.location.href);
        url.searchParams.set(pageParam, pageNum.toString());
        return url.pathname + url.search;
    };

    const handleClick = (e: React.MouseEvent, pageNum: number) => {
        if (onPageChange) {
            e.preventDefault();
            onPageChange(pageNum);
        }
    };

    return (
        <div className="p-4 sm:p-6 border-t border-uhuru-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/20">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-[10px] sm:text-xs text-uhuru-text-dim uppercase font-bold tracking-widest whitespace-nowrap">
                    Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages || 1}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-uhuru-text-dim bg-slate-900/40 px-2 sm:px-3 py-1.5 rounded-lg border border-white/5">
                    <span>GO:</span>
                    <input
                        type="number"
                        min={1}
                        max={totalPages || 1}
                        defaultValue={currentPage}
                        onKeyDown={handleJump}
                        className="w-8 bg-transparent text-white focus:outline-none text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-b border-white/10"
                    />
                </div>
            </div>
            <div className="flex gap-2">
                <Link
                    href={getUrl(1)}
                    onClick={(e) => handleClick(e, 1)}
                    className={`px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all border border-uhuru-border w-10 flex justify-center hover:scale-105 active:scale-95 shadow-lg ${currentPage <= 1 ? 'opacity-20 pointer-events-none' : ''}`}
                    title="First Page"
                >
                    &lt;&lt;
                </Link>
                <Link
                    href={getUrl(currentPage - 1)}
                    onClick={(e) => handleClick(e, currentPage - 1)}
                    className={`px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all border border-uhuru-border w-10 flex justify-center hover:scale-105 active:scale-95 shadow-lg ${currentPage <= 1 ? 'opacity-20 pointer-events-none' : ''}`}
                    title="Previous Page"
                >
                    &lt;
                </Link>
                <Link
                    href={getUrl(currentPage + 1)}
                    onClick={(e) => handleClick(e, currentPage + 1)}
                    className={`px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all border border-uhuru-border w-10 flex justify-center hover:scale-105 active:scale-95 shadow-lg ${currentPage >= totalPages ? 'opacity-20 pointer-events-none' : ''}`}
                    title="Next Page"
                >
                    &gt;
                </Link>
                <Link
                    href={getUrl(totalPages)}
                    onClick={(e) => handleClick(e, totalPages)}
                    className={`px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all border border-uhuru-border w-10 flex justify-center hover:scale-105 active:scale-95 shadow-lg ${currentPage >= totalPages ? 'opacity-20 pointer-events-none' : ''}`}
                    title="Last Page"
                >
                    &gt;&gt;
                </Link>
            </div>
        </div>
    );
}
