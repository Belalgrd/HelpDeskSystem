// src/components/common/Avatar.tsx

import React from 'react';
import { cn } from '../../utils/helpers';

interface AvatarProps {
    src?: string | null;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';  // Added 'xl'
    className?: string;
}

const getInitials = (name: string): string => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-20 h-20 text-xl',  // Added 'xl' size
    };

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={cn('rounded-full object-cover', sizes[size], className)}
            />
        );
    }

    return (
        <div
            className={cn(
                'rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center font-medium',
                sizes[size],
                className
            )}
        >
            {getInitials(name)}
        </div>
    );
};