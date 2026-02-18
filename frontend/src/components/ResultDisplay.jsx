import React from 'react';
import { motion } from 'framer-motion';

export function ResultDisplay({ data }) {
    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Results</h3>
            </div>
            <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        </motion.div>
    );
}
