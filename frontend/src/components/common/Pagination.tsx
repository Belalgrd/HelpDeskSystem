import React from 'react';
import { HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { cn } from '../../utils/helpers';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const delta = 2;

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }

        return pages;
    };

    const buttonClass = cn(
        'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed'
    );

    return (
        <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
            </p>

            <nav className="flex items-center space-x-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={cn(buttonClass, 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700')}
                >
                    <HiChevronDoubleLeft className="w-4 h-4" />
                </button>

                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn(buttonClass, 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700')}
                >
                    <HiChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                        <span key={index} className="px-3 py-2 text-gray-400">
                            ...
                        </span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => onPageChange(page as number)}
                            className={cn(
                                buttonClass,
                                page === currentPage
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            )}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={cn(buttonClass, 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700')}
                >
                    <HiChevronRight className="w-4 h-4" />
                </button>

                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={cn(buttonClass, 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700')}
                >
                    <HiChevronDoubleRight className="w-4 h-4" />
                </button>
            </nav>
        </div>
    );
};