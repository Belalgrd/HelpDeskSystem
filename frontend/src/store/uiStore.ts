import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    darkMode: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleDarkMode: () => void;
    setDarkMode: (dark: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    darkMode: localStorage.getItem('darkMode') === 'true',
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
    toggleDarkMode: () =>
        set((state) => {
            const newDarkMode = !state.darkMode;
            localStorage.setItem('darkMode', String(newDarkMode));
            if (newDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return { darkMode: newDarkMode };
        }),
    setDarkMode: (dark: boolean) => {
        localStorage.setItem('darkMode', String(dark));
        if (dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        set({ darkMode: dark });
    },
}));