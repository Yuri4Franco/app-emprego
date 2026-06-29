"use client";

import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between flex-col sm:flex-row gap-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                    <HiChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, index, array) => {
                        const showEllipsis = index > 0 && page - array[index - 1] > 1;

                        return (
                            <div key={page} className="flex items-center">
                                {showEllipsis && <span className="px-2 text-gray-400 font-bold">...</span>}
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${currentPage === page
                                            ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                                            : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            </div>
                        );
                    })}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                    <HiChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}