import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FileUpload({ files, setFiles }) {
    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, [setFiles]);

    const removeFile = (fileToRemove) => {
        setFiles((prev) => prev.filter((file) => file !== fileToRemove));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div
                {...getRootProps()}
                className={`p-10 border-2 border-dashed rounded-2xl transition-colors cursor-pointer flex flex-col items-center justify-center text-center
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
            >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Upload size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-700">
                    {isDragActive ? 'Drop files here' : 'Drag & Drop files here'}
                </h3>
                <p className="text-sm text-gray-500 mt-2">or click to browse</p>
            </div>

            {files.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Selected Files ({files.length})</h4>
                    <AnimatePresence>
                        {files.map((file, index) => (
                            <motion.div
                                key={`${file.name}-${index}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-gray-100 rounded text-gray-600">
                                        <File size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(file)}
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
