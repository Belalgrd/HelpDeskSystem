import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/helpers';

interface DropdownOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

interface DropdownProps {
    trigger: React.ReactNode;
    options: DropdownOption[];
    value?: string;
    onSelect: (value: string) => void;
    className?: string;
    align?: 'left' | 'right';
    width?: 'auto' | 'full' | 'trigger';
    disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    options,
    value,
    onSelect,
    className,
    align = 'right',
    width = 'auto',
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onSelect(optionValue);
        setIsOpen(false);
    };

    const handleTriggerClick = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    // Calculate width style
    const getWidthClass = () => {
        switch (width) {
            case 'full':
                return 'w-full';
            case 'trigger':
                return 'min-w-full';
            default:
                return 'w-48';
        }
    };

    return (
        <div className={cn('relative inline-block', className)} ref={dropdownRef}>
            {/* Trigger */}
            <div
                ref={triggerRef}
                onClick={handleTriggerClick}
                className={cn(disabled && 'opacity-50 cursor-not-allowed')}
            >
                {trigger}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={cn(
                        'absolute mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg',
                        'border border-gray-200 dark:border-gray-700',
                        'py-1 z-50',
                        'animate-dropdown',
                        getWidthClass(),
                        align === 'right' ? 'right-0' : 'left-0'
                    )}
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => !option.disabled && handleSelect(option.value)}
                            disabled={option.disabled}
                            className={cn(
                                'w-full px-4 py-2 text-left text-sm transition-colors',
                                'flex items-center space-x-2',
                                'text-gray-700 dark:text-gray-200',
                                'hover:bg-gray-100 dark:hover:bg-gray-700',
                                'focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700',
                                value === option.value &&
                                'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium',
                                option.disabled && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                            <span>{option.label}</span>
                            {value === option.value && (
                                <svg
                                    className="w-4 h-4 ml-auto text-primary-600 dark:text-primary-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};