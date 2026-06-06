import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            className="relative w-12 h-12 rounded-full flex items-center justify-center
        bg-white/70 dark:bg-white/10
        border border-gray-200 dark:border-white/20
        hover:bg-white/90 dark:hover:bg-white/20
        transition-all duration-300 shadow-lg"
            aria-label="Toggle theme"
        >
            <motion.div
                key={theme}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
            >
                {theme === 'dark' ? (
                    <Sun size={20} className="text-amber-400" />
                ) : (
                    <Moon size={20} className="text-rose-600" />
                )}
            </motion.div>
        </motion.button>
    );
}
