import React, { useState } from 'react';
import axios from 'axios';
import { FileUpload } from './components/FileUpload';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader2, Send } from 'lucide-react';

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
      // Replace with your actual backend endpoint
      // Assuming localhost:8000 for now, user might need to configure this
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload files. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            File Analyzer
          </h1>
          <p className="text-lg text-slate-600">
            Upload your files to analyze and process them instantly.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-8 space-y-8">
          <FileUpload files={files} setFiles={setFiles} />

          <div className="flex justify-end">
            <button
              onClick={handleSend}
              disabled={files.length === 0 || loading}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all
                ${files.length === 0 || loading
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 active:scale-95'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Analyze Files
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}
        </div>

        <ResultDisplay data={result} />
      </div>
    </div>
  );
}

export default App;
