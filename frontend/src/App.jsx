import React, { useState } from 'react';
import axios from 'axios';
import { FileUpload } from './components/FileUpload';
import { ResultDisplay } from './components/ResultDisplay';
import { ThemeToggle } from './components/ThemeToggle';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('http://localhost:8000/yolo/detect/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
      setFiles([]); // Clear files after successful upload and analysis
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Dosya yükleme başarısız oldu. Backend bağlantısını kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500
      bg-white dark:bg-neutral-950">

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center">
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Rose<span className="text-rose-600 dark:text-rose-400">ware</span>
          </span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Dosya <span className="text-rose-600 dark:text-rose-400">Analiz</span> Platformu
          </h1>

        </motion.div>

        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-[32px] p-6 sm:p-8 space-y-6
            bg-white/80 dark:bg-white/5
            border border-gray-200/80 dark:border-white/10
            shadow-xl shadow-gray-200/50 dark:shadow-white/5"
        >
          <FileUpload files={files} setFiles={setFiles} />

          {/* Send Button */}
          <div className="flex justify-end pt-2">
            <motion.button
              onClick={handleSend}
              disabled={files.length === 0 || loading}
              whileHover={files.length > 0 && !loading ? { scale: 1.03 } : {}}
              whileTap={files.length > 0 && !loading ? { scale: 0.97 } : {}}
              className={`
                flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-white text-sm
                transition-all duration-300 shadow-lg
                ${files.length === 0 || loading
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/30 hover:shadow-rose-500/50'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  İşleniyor...
                </>
              ) : (
                'Dosyaları Gönder'
              )}
            </motion.button>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-500/20 text-sm"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        <ResultDisplay data={result} />
      </main>
    </div>
  );
}

export default App;
