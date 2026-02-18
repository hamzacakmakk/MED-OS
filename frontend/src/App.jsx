import React, { useState } from 'react';
import axios from 'axios';
import { FileUpload } from './components/FileUpload';
import { ResultDisplay } from './components/ResultDisplay';
import { ThemeToggle } from './components/ThemeToggle';
import { Loader2, Send, Sparkles, Zap } from 'lucide-react';
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
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Dosya yükleme başarısız oldu. Backend bağlantısını kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500
      bg-gradient-to-br from-gray-50 via-white to-gray-100
      dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-purple-500/20 dark:from-violet-500/10 dark:to-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-cyan-500/15 dark:from-blue-500/10 dark:to-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-gradient-to-br from-pink-400/15 to-rose-500/15 dark:from-pink-500/10 dark:to-rose-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            File<span className="text-violet-600 dark:text-violet-400">Analyzer</span>
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100/80 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-5">
            <Sparkles size={14} />
            Dosya Analiz Platformu
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Dosyalarınızı{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              Analiz Edin
            </span>
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Dosyalarınızı yükleyin ve anında sonuçlarınızı görün.
          </p>
        </motion.div>

        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl p-6 sm:p-8 space-y-6
            bg-white/70 dark:bg-white/5 backdrop-blur-xl
            border border-gray-200/80 dark:border-white/10
            shadow-xl shadow-gray-200/50 dark:shadow-purple-500/5"
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
                flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm
                transition-all duration-300 shadow-lg
                ${files.length === 0 || loading
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-500/30 hover:shadow-violet-500/50'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Dosyaları Gönder
                </>
              )}
            </motion.button>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/20 text-sm"
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
