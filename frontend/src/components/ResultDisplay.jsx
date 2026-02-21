import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Copy, Check, FileText, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

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
    const [report, setReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);
    const [approved, setApproved] = useState(false);

    if (!data) return null;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerateReport = async () => {
        setReportLoading(true);
        setReportError(null);
        setReport(null);
        setApproved(false);
        try {
            // YOLO Sonuçlarını metin olarak toparlıyoruz. Projenin gerçek verisi geldikçe burası şekillenebilir.
            let findingsStr = "";
            if (typeof data === 'object') {
                 findingsStr = JSON.stringify(data);
                 // JSON çok uzunsa kırpalım
                 if(findingsStr.length > 200) findingsStr = findingsStr.substring(0, 200) + "...";
            } else {
                 findingsStr = String(data);
            }
            
            const yoloFindings = [`Yapay Zeka Analizi: ${findingsStr}`];
            
            const reqData = {
                yolo_findings: yoloFindings,
                blood_test_anomalies: ["CRP Yüksek", "Lökosit (WBC) Yüksek"],
                patient_info: "Örnek Hasta, 45 Yaş"
            };
            
            const response = await axios.post('http://localhost:8000/api/generate-report', reqData);
            setReport(response.data.report_text);
        } catch (err) {
            setReportError("Rapor oluşturulamadı. Lütfen backend'in çalıştığından ve Gemini API Key'in ayarlandığından emin olun.");
            console.error(err);
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <div className="w-full mt-8 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full rounded-2xl overflow-hidden
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
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Röntgen Analiz Sonucu</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGenerateReport}
                            disabled={reportLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    text-white bg-gradient-to-r from-emerald-500 to-teal-500
                    hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-75"
                        >
                            {reportLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                            {reportLoading ? 'Üretiliyor...' : 'Otomatik Rapor Üret'}
                        </motion.button>
                        
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
                            {copied ? 'Kopyalandı!' : 'Kopyala JSON'}
                        </motion.button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-x-auto font-mono text-sm leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                    <JsonValue value={data} />
                </div>
            </motion.div>

            {/* ERROR DISPLAY */}
            {reportError && (
                 <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/20 text-sm"
               >
                 {reportError}
               </motion.div>
            )}

            {/* REPORT DISPLAY SECTION */}
            <AnimatePresence>
                {report && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.4 }}
                        className="w-full rounded-2xl overflow-hidden
                        bg-gradient-to-br from-indigo-50/80 to-blue-50/50 dark:from-indigo-950/40 dark:to-blue-900/20 backdrop-blur-xl
                        border border-indigo-200/50 dark:border-indigo-500/20
                        shadow-2xl dark:shadow-indigo-500/10"
                    >
                        <div className="flex items-center justify-between px-6 py-4 bg-indigo-100/50 dark:bg-indigo-900/30 border-b border-indigo-200/50 dark:border-indigo-500/20">
                            <div className="flex items-center gap-2">
                                <FileText className="text-indigo-600 dark:text-indigo-400" size={18} />
                                <h3 className="font-bold text-indigo-900 dark:text-indigo-100">SGK Formatlı Epikriz / Anamnez Raporu</h3>
                            </div>
                            {approved && (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">
                                    <CheckCircle size={14} />
                                    Onaylandı
                                </span>
                            )}
                        </div>
                        <div className="p-6">
                            <textarea
                                readOnly
                                value={report}
                                rows={10}
                                className="w-full bg-white/70 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-xl p-4 border border-indigo-100 dark:border-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-medium text-sm leading-relaxed custom-scrollbar shadow-inner"
                            />
                            
                            {!approved && (
                                <div className="mt-5 flex justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setApproved(true)}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white
                                        bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                                        shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
                                    >
                                        <CheckCircle size={18} />
                                        Hekim Olarak Onayla
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
