import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    HiHome,
    HiTicket,
    HiPlus,
    HiUsers,
    HiOfficeBuilding,
    HiTag,
    HiChartBar,
    HiCog,
} from 'react-icons/hi';
import { cn } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

// Define navigation items with optional exactMatch property
interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    exactMatch?: boolean;
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: HiHome, exactMatch: true },
    { name: 'Tickets', href: '/tickets', icon: HiTicket },
    { name: 'Create Ticket', href: '/tickets/create', icon: HiPlus, exactMatch: true },
];

const adminNavigation: NavItem[] = [
    { name: 'Users', href: '/admin/users', icon: HiUsers },
    { name: 'Departments', href: '/admin/departments', icon: HiOfficeBuilding },
    { name: 'Categories', href: '/admin/categories', icon: HiTag },
    { name: 'Reports', href: '/reports', icon: HiChartBar },
    { name: 'Settings', href: '/settings', icon: HiCog },
];

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const { sidebarOpen } = useUIStore();

    const isAdmin = user?.role === 'Admin' || user?.role === 'Supervisor';

    // Improved isActive logic
    const checkIsActive = (item: NavItem): boolean => {
        const pathname = location.pathname;

        // Exact match for dashboard and create pages
        if (item.exactMatch) {
            return pathname === item.href;
        }

        // For Tickets: active when on /tickets but NOT on /tickets/create or /tickets/:id/edit
        if (item.href === '/tickets') {
            const isOnTicketsList = pathname === '/tickets';
            const isOnTicketDetail = /^\/tickets\/[a-f0-9-]+$/.test(pathname);
            const isOnCreateOrEdit = pathname === '/tickets/create' || pathname.endsWith('/edit');

            return isOnTicketsList || (isOnTicketDetail && !isOnCreateOrEdit);
        }

        // Default: check if pathname starts with href
        return pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href + '/'));
    };

    const NavItemComponent = ({ item }: { item: NavItem }) => {
        const isActive = checkIsActive(item);

        return (
            <NavLink
                to={item.href}
                className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                    !sidebarOpen && 'justify-center'
                )}
            >
                <item.icon className={cn('w-5 h-5', sidebarOpen && 'mr-3')} />
                {sidebarOpen && <span>{item.name}</span>}
            </NavLink>
        );
    };

    return (
        <aside
            className={cn(
                'fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
                sidebarOpen ? 'w-64' : 'w-20'
            )}
        >
            {/* Logo */}
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <HiTicket className="w-6 h-6 text-white" />
                    </div>
                    {sidebarOpen && (
                        <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                            HelpDesk
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                    <NavItemComponent key={item.name} item={item} />
                ))}

                {isAdmin && (
                    <>
                        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                            {sidebarOpen && (
                                <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Administration
                                </p>
                            )}
                            {adminNavigation.map((item) => (
                                <NavItemComponent key={item.name} item={item} />
                            ))}
                        </div>
                    </>
                )}
            </nav>
        </aside>
    );
};