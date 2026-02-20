import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, FileText, FileImage, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export function FileUpload({ files, setFiles }) {
    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles);
    }, [setFiles]);

    const removeFile = (fileToRemove) => {
        setFiles((prev) => prev.filter((file) => file !== fileToRemove));
    };

    const clearAll = () => setFiles([]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="w-full space-y-5">
            {/* Dropzone */}
            <motion.div
                {...getRootProps()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`
          relative p-10 border-2 border-dashed rounded-2xl cursor-pointer
          flex flex-col items-center justify-center text-center
          transition-all duration-300 overflow-hidden group
          ${isDragActive
                        ? 'border-violet-500 bg-violet-500/10 dark:bg-violet-500/5'
                        : 'border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500 bg-white/50 dark:bg-white/5 hover:bg-violet-50/50 dark:hover:bg-violet-500/5'}
        `}
            >
                <input {...getInputProps()} />

                {/* Animated background blobs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                <motion.div
                    animate={isDragActive ? { y: [0, -8, 0], scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.6, repeat: isDragActive ? Infinity : 0 }}
                    className="relative z-10"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-violet-500/30 mx-auto">
                        <Upload size={36} className="text-white" />
                    </div>
                </motion.div>

                <h3 className="relative z-10 text-xl font-bold text-gray-800 dark:text-gray-100">
                    {isDragActive ? 'Dosyaları buraya bırakın!' : 'Dosyaları sürükleyip bırakın'}
                </h3>
                <p className="relative z-10 text-sm text-gray-500 dark:text-gray-400 mt-2">
                    veya <span className="text-violet-600 dark:text-violet-400 font-semibold">gözatmak için tıklayın</span>
                </p>
            </motion.div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">
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

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        <AnimatePresence>
                            {files.map((file, index) => {
                                const IconComponent = getFileIcon(file.name);
                                return (
                                    <motion.div
                                        key={`${file.name}-${index}`}
                                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center justify-between p-3 rounded-xl
                      bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10
                      hover:shadow-md dark:hover:shadow-purple-500/5 transition-all group/item"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2.5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 rounded-xl text-violet-600 dark:text-violet-400">
                                                <IconComponent size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.15 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => removeFile(file)}
                                            className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400
                        hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover/item:opacity-100"
                                        >
                                            <X size={16} />
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}
