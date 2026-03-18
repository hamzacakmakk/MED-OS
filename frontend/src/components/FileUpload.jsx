import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, FileText, FileImage, FileCode, Play, Loader2, CircleCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadXRay, checkTaskStatus } from '../services/api';

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return FileImage;
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css'].includes(ext)) return FileCode;
    if (['txt', 'md', 'pdf', 'doc', 'docx'].includes(ext)) return FileText;
    return File;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function FileUpload({ onAnalysisComplete }) {
    const [files, setFiles] = useState([]);
    const [taskId, setTaskId] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, processing, completed, error
    const [result, setResult] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles);
        setStatus('idle');
        setTaskId(null);
        setResult(null);
    }, []);

    const removeFile = (fileToRemove) => {
        setFiles((prev) => prev.filter((file) => file !== fileToRemove));
    };

    const clearAll = () => {
        setFiles([]);
        setStatus('idle');
        setTaskId(null);
        setResult(null);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setStatus('uploading');
        try {
            const data = await uploadXRay(files);
            if (data.tasks && data.tasks.length > 0) {
                setTaskId(data.tasks[0].task_id);
                setStatus('processing');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Upload failed', error);
            setStatus('error');
        }
    };

    useEffect(() => {
        let interval = null;
        if (status === 'processing' && taskId) {
            interval = setInterval(async () => {
                try {
                    const data = await checkTaskStatus(taskId);
                    if (data.status === 'SUCCESS') {
                        setStatus('completed');
                        setResult(data.result);
                        clearInterval(interval);
                        if (onAnalysisComplete) onAnalysisComplete(data.result);
                    } else if (data.status === 'FAILURE') {
                        setStatus('error');
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error('Polling failed', error);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, taskId, onAnalysisComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="w-full space-y-5">
            {/* Dropzone */}
            <motion.div
                {...getRootProps()}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className={`
          relative p-10 border-2 border-dashed rounded-3xl cursor-pointer
          flex flex-col items-center justify-center text-center
          transition-all duration-300 overflow-hidden group
          ${isDragActive
                        ? 'border-medical-500 bg-medical-50 dark:bg-medical-500/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-medical-400 dark:hover:border-medical-500 bg-gray-50 dark:bg-white/5 hover:bg-medical-50/50 dark:hover:bg-medical-500/5'}
        `}
            >
                <input {...getInputProps()} />
                <motion.div
                    animate={isDragActive ? { y: [0, -8, 0], scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.6, repeat: isDragActive ? Infinity : 0 }}
                    className="relative z-10"
                >
                    <div className="w-20 h-20 bg-medical-500 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-medical-500/30 mx-auto">
                        <Upload size={36} className="text-white" />
                    </div>
                </motion.div>

                <h3 className="relative z-10 text-xl font-bold text-gray-800 dark:text-gray-100">
                    {isDragActive ? 'Dosyaları buraya bırakın!' : 'Röntgen Yüklemek İçin Sürükleyin'}
                </h3>
                <p className="relative z-10 text-sm text-gray-500 dark:text-gray-400 mt-2">
                    veya <span className="text-medical-600 dark:text-medical-400 font-semibold">gözatmak için tıklayın</span>
                </p>
            </motion.div>

            {/* File List & Status */}
            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-medical-100 dark:bg-medical-500/20 text-medical-600 dark:text-medical-400 flex items-center justify-center text-xs font-bold">
                                {files.length}
                            </span>
                            Dosya Seçildi
                        </h4>
                        <button
                            onClick={clearAll}
                            className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium hover:underline transition-colors"
                        >
                            Tümünü Temizle
                        </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        <AnimatePresence>
                            {files.map((file, index) => {
                                const IconComponent = getFileIcon(file.name);
                                return (
                                    <motion.div
                                        key={`${file.name}-${index}`}
                                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                        className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2.5 bg-medical-50 dark:bg-medical-500/10 rounded-full text-medical-600 dark:text-medical-400">
                                                <IconComponent size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        {status === 'idle' && (
                                            <button onClick={() => removeFile(file)} className="p-1.5 text-gray-400 hover:text-red-500">
                                                <X size={16} />
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Action Button & Status Info */}
                    <div className="pt-2">
                        {status === 'idle' && (
                            <button
                                onClick={handleUpload}
                                className="w-full flex items-center justify-center gap-2 bg-medical-600 hover:bg-medical-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
                            >
                                <Play className="w-5 h-5" /> Analizi Başlat
                            </button>
                        )}
                        {status === 'uploading' && (
                            <div className="w-full flex items-center justify-center gap-2 bg-medical-900/50 text-medical-300 border border-medical-800 py-3 rounded-xl font-bold">
                                <Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...
                            </div>
                        )}
                        {status === 'processing' && (
                            <div className="w-full flex items-center justify-center gap-2 bg-amber-900/50 text-amber-300 border border-amber-800 py-3 rounded-xl font-bold">
                                <Loader2 className="w-5 h-5 animate-spin" /> Yapay Zeka İşliyor... (Task ID Bekleniyor)
                            </div>
                        )}
                        {status === 'completed' && (
                            <div className="w-full flex flex-col items-center justify-center gap-2 bg-emerald-900/50 text-emerald-300 border border-emerald-800 py-3 rounded-xl font-bold">
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Analiz Tamamlandı</span>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-full text-center text-red-500 py-2 font-bold">Bir hata oluştu.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
