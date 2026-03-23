/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  ArrowRight, 
  Download, 
  RefreshCw,
  Zap,
  Layers,
  Palette
} from 'lucide-react';
import { analyzeScreenshot, generateMastDesign } from './services/aiService';

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [redesignedImage, setRedesignedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setRedesignedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerTransform = async () => {
    if (!originalImage) return;

    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Step 1: Analyze
      const analysis = await analyzeScreenshot(originalImage);
      
      setIsAnalyzing(false);
      setIsGenerating(true);
      
      // Step 2: Generate
      const result = await generateMastDesign(analysis);
      setRedesignedImage(result);
      
    } catch (err) {
      console.error(err);
      setError("Something went wrong during the transformation. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setRedesignedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-mast-orange selection:text-white">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-mast-orange/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 mast-gradient rounded-xl flex items-center justify-center shadow-lg shadow-mast-orange/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tighter font-display">MastUi</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#" className="hover:text-white transition-colors">Showcase</a>
          <a href="#" className="hover:text-white transition-colors">Process</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <button className="px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
            Sign In
          </button>
        </nav>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-mast-orange mb-6">
              <Zap size={14} />
              <span>AI-POWERED UI TRANSFORMATION</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold font-display leading-[0.9] tracking-tight mb-8">
              Turn Basic UI into <span className="text-mast-orange">Mast</span> Masterpieces.
            </h1>
            <p className="text-xl text-white/60 leading-relaxed mb-10 max-w-xl">
              Upload your UI screenshots and let our world-class AI designer redesign them with premium glassmorphism, fluid gradients, and artist-level aesthetics.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Layers size={16} />
                <span>Maintains Layout</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Palette size={16} />
                <span>Premium Styles</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Sparkles size={16} />
                <span>Artist Level</span>
              </div>
            </div>

            {!originalImage ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer group relative overflow-hidden p-8 rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-mast-orange/50 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-mast-orange/10 transition-colors">
                    <Upload className="w-8 h-8 text-white/40 group-hover:text-mast-orange transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Upload Screenshot</h3>
                    <p className="text-sm text-white/40">Drag and drop or click to browse</p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </motion.div>
            ) : (
              <div className="flex flex-col gap-4">
                <button 
                  onClick={triggerTransform}
                  disabled={isAnalyzing || isGenerating}
                  className="w-full py-4 rounded-2xl mast-gradient font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-mast-orange/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="animate-spin" />
                      Analyzing UI...
                    </>
                  ) : isGenerating ? (
                    <>
                      <RefreshCw className="animate-spin" />
                      Designing Masterpiece...
                    </>
                  ) : (
                    <>
                      <Sparkles />
                      Make it Mast
                    </>
                  )}
                </button>
                <button 
                  onClick={reset}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-medium hover:bg-white/10 transition-all"
                >
                  Upload Different Image
                </button>
              </div>
            )}

            {error && (
              <p className="mt-4 text-red-400 text-sm font-medium">{error}</p>
            )}
          </motion.div>

          {/* Right Column: Preview */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {!originalImage ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="aspect-square rounded-[40px] glass-card flex items-center justify-center p-12 border border-white/10 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-mast-orange/5 to-transparent pointer-events-none" />
                  <div className="text-center relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 mx-auto mb-6 flex items-center justify-center animate-float">
                      <ImageIcon className="w-12 h-12 text-white/20" />
                    </div>
                    <p className="text-white/40 font-medium">Your design preview will appear here</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid gap-6"
                >
                  <div className="relative group">
                    <div className="absolute -top-3 -left-3 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest z-20 border border-white/10">
                      Original
                    </div>
                    <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 bg-white/5">
                      <img 
                        src={originalImage} 
                        alt="Original UI" 
                        className="w-full h-full object-cover opacity-60 grayscale-[0.5]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <ArrowRight className="text-white/40" />
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -top-3 -left-3 px-3 py-1 mast-gradient rounded-lg text-[10px] font-bold uppercase tracking-widest z-20 shadow-lg shadow-mast-orange/20">
                      Mast Version
                    </div>
                    <div className="aspect-video rounded-3xl overflow-hidden border border-mast-orange/30 bg-white/5 relative">
                      {redesignedImage ? (
                        <>
                          <img 
                            src={redesignedImage} 
                            alt="Redesigned UI" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-4 right-4 flex gap-2">
                            <button className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 transition-all">
                              <Download size={18} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                          {(isAnalyzing || isGenerating) ? (
                            <div className="space-y-4">
                              <div className="w-12 h-12 border-4 border-mast-orange/30 border-t-mast-orange rounded-full animate-spin mx-auto" />
                              <p className="text-sm text-white/60 font-medium">
                                {isAnalyzing ? "Analyzing elements..." : "Applying Mast magic..."}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-white/40">Click "Make it Mast" to generate</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold tracking-tighter">MastUi</span>
          </div>
          <p className="text-white/30 text-sm">
            © 2026 MastUi AI. All rights reserved. Built with Gemini 3.1.
          </p>
          <div className="flex gap-6 text-white/30 text-sm">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
