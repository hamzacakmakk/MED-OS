import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center
        bg-white/60 dark:bg-white/10 backdrop-blur-xl
        border border-gray-200 dark:border-white/20
        hover:bg-white/80 dark:hover:bg-white/20
        transition-all duration-300 shadow-lg"
            aria-label="Toggle theme"
        >
            <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.3 }}
            >
                {theme === 'dark' ? (
                    <Sun size={20} className="text-amber-400" />
                ) : (
                    <Moon size={20} className="text-indigo-600" />
                )}
            </motion.div>
        </motion.button>
    );
}
