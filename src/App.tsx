import React, { useState, useRef } from 'react';
import Upscaler from 'upscaler';
import ESRGANSlim from '@upscalerjs/esrgan-slim';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Upload, Download, Twitter, Sparkles, RefreshCw, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const upscaler = new Upscaler({
  model: ESRGANSlim,
});

function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size too large. Please upload an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setProcessedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await upscaler.upscale(originalImage);
      setProcessedImage(result);
    } catch (err) {
      console.error('Upscaling error:', err);
      setError('Failed to process image. Browser AI can be intensive, try a smaller image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'unblurred-memory.png';
    link.click();
  };

  const shareToX = () => {
    const text = encodeURIComponent("Just fixed my blurry memories using this 100% browser-based AI tool! No servers, just magic. ✨🚀\n\nBuild by @golldyydev");
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Unblur AI</h1>
        </div>
        <div className="flex gap-4">
          <a href="https://github.com/golldyydev/unblur-ai" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
            <Github className="w-6 h-6" />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Restore Your Blurry Memories
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          100% Client-side AI. No servers. No cost. Your images never leave your browser.
        </p>
      </motion.div>

      {/* Main Container */}
      <main className="w-full max-w-4xl bg-slate-800/50 border border-slate-700 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Decorative Blur */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {!originalImage ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-colors bg-slate-900/30 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Upload className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-lg font-medium text-slate-300">Click to upload or drag & drop</p>
              <p className="text-sm text-slate-500 mt-2">Any image format supported (Max 5MB)</p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="relative rounded-2xl overflow-hidden bg-black/40 min-h-[400px] flex items-center justify-center border border-slate-700 shadow-inner">
                {processedImage ? (
                  <ReactCompareSlider
                    itemOne={<ReactCompareSliderImage src={originalImage} alt="Original" />}
                    itemTwo={<ReactCompareSliderImage src={processedImage} alt="Unblurred" />}
                    className="w-full h-full max-h-[600px] object-contain"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={originalImage} alt="Original" className="max-h-[600px] object-contain opacity-50 blur-sm" />
                    {isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          className="mb-4"
                        >
                          <RefreshCw className="w-12 h-12 text-indigo-400" />
                        </motion.div>
                        <p className="text-indigo-400 font-bold tracking-widest text-sm uppercase animate-pulse">
                          AI Restoring Image...
                        </p>
                        <p className="text-slate-400 text-xs mt-2 px-8 text-center">
                          This might take 10-30 seconds depending on your hardware.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-4 justify-center items-center pt-4">
                {!processedImage && !isProcessing && (
                  <button
                    onClick={processImage}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-5 h-5" />
                    Run AI Restore
                  </button>
                )}

                {processedImage && (
                  <>
                    <button
                      onClick={downloadImage}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold transition-all active:scale-95 border border-slate-600"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                    <button
                      onClick={shareToX}
                      className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-zinc-900 text-white rounded-full font-bold transition-all active:scale-95 border border-zinc-800"
                    >
                      <Twitter className="w-5 h-5" />
                      Share to X
                    </button>
                  </>
                )}

                <button
                  onClick={reset}
                  className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors"
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">
            {error}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="mt-12 text-slate-500 text-sm flex flex-col items-center gap-2">
        <p>Built with TensorFlow.js • Runs locally in your browser</p>
        <p className="opacity-50">© 2026 • Designed for X Virality • Build by @golldyydev</p>
      </footer>
    </div>
  );
}

export default App;
