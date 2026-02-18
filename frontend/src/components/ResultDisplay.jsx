import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

function JsonValue({ value, depth = 0 }) {
    const [expanded, setExpanded] = useState(depth < 2);

    if (value === null) return <span className="text-gray-400 italic">null</span>;
    if (typeof value === 'boolean') return <span className="text-amber-500 dark:text-amber-400">{value.toString()}</span>;
    if (typeof value === 'number') return <span className="text-emerald-600 dark:text-emerald-400">{value}</span>;
    if (typeof value === 'string') return <span className="text-sky-600 dark:text-sky-400">"{value}"</span>;

    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-gray-400">[]</span>;
        return (
            <div className="inline">
                <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-violet-500 transition-colors inline-flex items-center gap-0.5">
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="text-xs text-gray-400">[{value.length}]</span>
                </button>
                {expanded && (
                    <div className="ml-5 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                        {value.map((item, i) => (
                            <div key={i} className="py-0.5">
                                <JsonValue value={item} depth={depth + 1} />
                                {i < value.length - 1 && <span className="text-gray-400">,</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) return <span className="text-gray-400">{'{}'}</span>;
        return (
            <div className="inline">
                <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-violet-500 transition-colors inline-flex items-center gap-0.5">
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="text-xs text-gray-400">{'{' + keys.length + '}'}</span>
                </button>
                {expanded && (
                    <div className="ml-5 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                        {keys.map((key, i) => (
                            <div key={key} className="py-0.5">
                                <span className="text-purple-600 dark:text-purple-400 font-medium">"{key}"</span>
                                <span className="text-gray-400 mx-1">:</span>
                                <JsonValue value={value[key]} depth={depth + 1} />
                                {i < keys.length - 1 && <span className="text-gray-400">,</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return <span>{String(value)}</span>;
}

export function ResultDisplay({ data }) {
    const [copied, setCopied] = useState(false);

    if (!data) return null;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full mt-8 rounded-2xl overflow-hidden
        bg-white dark:bg-white/5 backdrop-blur-xl
        border border-gray-200 dark:border-white/10
        shadow-xl dark:shadow-purple-500/5"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Sonuç</h3>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400
            bg-gray-50 dark:bg-white/5 hover:bg-violet-50 dark:hover:bg-violet-500/10
            border border-gray-200 dark:border-white/10 transition-all"
                >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Kopyalandı!' : 'Kopyala'}
                </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-x-auto font-mono text-sm leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                <JsonValue value={data} />
            </div>
        </motion.div>
    );
}
