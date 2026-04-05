import React from 'react';
import { cn } from '../../utils/helpers';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', className }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <div
                className={cn(
                    'border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin',
                    sizes[size]
                )}
            />
        </div>
    );
};

export const PageLoading: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loading size="lg" />
        </div>
    );
};

export const FullPageLoading: React.FC = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
            <div className="text-center">
                <Loading size="lg" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        </div>
    );
};