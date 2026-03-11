import React, { useState, useRef, useCallback } from 'react';
import Upscaler from 'upscaler';
import { x2 } from '@upscalerjs/esrgan-slim';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { 
  Upload, 
  Download, 
  Twitter, 
  Sparkles, 
  RefreshCw, 
  Github, 
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const upscaler = new Upscaler({
  model: x2,
});

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large (max 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const processImage = async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await upscaler.upscale(originalImage);
      setProcessedImage(result);
    } catch (err) {
      setError('AI Processing failed. Try a smaller image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">UnblurImage.ai</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Guide</a>
            <a href="https://github.com/golldyydev" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all">
              <Github className="w-4 h-4" />
              Github
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              Unblur Image with AI <br />
              <span className="text-indigo-600">Instantly & Free</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Powerful AI tool to fix blurry photos, sharpen edges, and restore clarity. 
              Everything runs locally in your browser—images are never uploaded.
            </p>
          </motion.div>

          {/* Core Action */}
          <div className="flex flex-col items-center gap-4">
            {!originalImage ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full max-w-xl p-12 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center group ${
                  isDragging ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" accept="image/*" />
                <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload or Drag Image</h3>
                <p className="text-slate-500 font-medium">Supports JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden min-h-[500px] flex items-center justify-center">
                {processedImage ? (
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-100">
                    <ReactCompareSlider
                      itemOne={<ReactCompareSliderImage src={originalImage} />}
                      itemTwo={<ReactCompareSliderImage src={processedImage} />}
                      className="w-full max-h-[650px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img src={originalImage} className={`max-h-[650px] rounded-2xl object-contain transition-all duration-700 ${isProcessing ? 'blur-xl opacity-30 grayscale' : ''}`} />
                    {isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                        <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Processing via Neural AI...</p>
                      </div>
                    )}
                    {!isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                        <button 
                          onClick={processImage}
                          className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Sparkles className="w-5 h-5" />
                          Unblur Image
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Reset Button */}
                <button 
                  onClick={() => { setOriginalImage(null); setProcessedImage(null); }}
                  className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur shadow-md hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all border border-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {processedImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mt-8"
              >
                <button
                  onClick={() => {
                    const a = document.createElement('a'); a.href = processedImage; a.download = 'restored.png'; a.click();
                  }}
                  className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Result
                </button>
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Sharpened my blurry photo with AI! 🚀\n\nBuild by @golldyydev")}`, '_blank')}
                  className="px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-full font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <Twitter className="w-5 h-5 text-[#1DA1F2] fill-current" />
                  Share to X
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Feature Bento Grid */}
        <section className="grid md:grid-cols-3 gap-6 mt-32">
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-green-500" />}
            title="100% Private"
            description="Images stay on your device. We use browser-based AI, ensuring your data never touches a server."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-amber-500" />}
            title="Fast Processing"
            description="Leverage your computer's GPU power via TensorFlow.js for near-instant restoration results."
          />
          <FeatureCard 
            icon={<LayoutGrid className="w-6 h-6 text-indigo-500" />}
            title="High Accuracy"
            description="Using state-of-the-art ESRGAN models to upscale and deblur your blurry memories with ease."
          />
        </section>

        {/* Guide Section */}
        <div className="mt-32 p-12 bg-slate-50 rounded-[3rem] border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">How to unblur an image?</h2>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-black text-slate-200 mb-4">01</div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Upload Photo</h4>
              <p className="text-slate-500 text-sm">Drag or click to select your blurry JPEG, PNG, or WEBP image.</p>
            </div>
            <div>
              <div className="text-4xl font-black text-slate-200 mb-4">02</div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">AI Processing</h4>
              <p className="text-slate-500 text-sm">Our neural network analyzes and sharpens the image details instantly.</p>
            </div>
            <div>
              <div className="text-4xl font-black text-slate-200 mb-4">03</div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Download & Share</h4>
              <p className="text-slate-500 text-sm">Preview the result with our slider and download your HD photo.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
        <p>© 2026 UnblurImage.ai • Built for X Growth by @golldyydev</p>
        <div className="flex gap-8 font-medium">
          <a href="#" className="hover:text-slate-900">Privacy</a>
          <a href="#" className="hover:text-slate-900">Terms</a>
          <a href="https://twitter.com/golldyydev" className="hover:text-indigo-600">Follow Dev</a>
        </div>
      </footer>

      {error && (
        <div className="fixed bottom-8 right-8 px-6 py-4 bg-white border border-red-100 shadow-2xl rounded-2xl flex items-center gap-3 text-red-500 animate-bounce">
          <X className="w-5 h-5 cursor-pointer" onClick={() => setError(null)} />
          <span className="font-bold text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white border border-slate-100 rounded-3xl hover:border-indigo-100 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:shadow-sm transition-all">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
    </div>
  );
}
