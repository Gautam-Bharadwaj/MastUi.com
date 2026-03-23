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
  Palette,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { analyzeScreenshot, generateMastDesign, DesignStyle } from './services/aiService';

type Page = 'home' | 'showcase' | 'process' | 'pricing' | 'signin' | 'signup';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [redesignedImage, setRedesignedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>("mast");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredStyle, setHoveredStyle] = useState<DesignStyle | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (selectedStyle !== 'story') return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

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
      const result = await generateMastDesign(analysis, selectedStyle);
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

  const handleDownload = () => {
    if (!redesignedImage) return;
    const link = document.createElement('a');
    link.href = redesignedImage;
    link.download = `mast-ui-redesign-${selectedStyle}-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNavClick = (e: React.MouseEvent, page: Page) => {
    e.preventDefault();
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderSampleUI = (style: DesignStyle) => {
    const baseStyles = "w-full p-6 transition-all duration-500 rounded-2xl border";
    
    switch (style) {
      case 'mast':
        return (
          <div className={`${baseStyles} bg-white/5 border-white/10 backdrop-blur-md shadow-xl`}>
            <div className="w-12 h-12 rounded-full bg-mast-orange/20 mb-4" />
            <div className="h-4 w-3/4 bg-white/20 rounded mb-2" />
            <div className="h-4 w-1/2 bg-white/10 rounded" />
          </div>
        );
      case 'neumorphism':
        return (
          <div className={`${baseStyles} bg-[#1a1a1a] border-transparent shadow-[10px_10px_20px_#0d0d0d,-10px_-10px_20px_#272727]`}>
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] shadow-[inset_5px_5px_10px_#0d0d0d,inset_-5px_-5px_10px_#272727] mb-4" />
            <div className="h-4 w-3/4 bg-[#1a1a1a] shadow-[inset_2px_2px_5px_#0d0d0d,inset_-2px_-2px_5px_#272727] rounded mb-2" />
            <div className="h-4 w-1/2 bg-[#1a1a1a] shadow-[inset_2px_2px_5px_#0d0d0d,inset_-2px_-2px_5px_#272727] rounded" />
          </div>
        );
      case 'brutalism':
        return (
          <div className={`${baseStyles} bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
            <div className="w-12 h-12 bg-yellow-400 border-4 border-black mb-4" />
            <div className="h-4 w-3/4 bg-black rounded-none mb-2" />
            <div className="h-4 w-1/2 bg-black/20 rounded-none" />
          </div>
        );
      case 'cyberpunk':
        return (
          <div className={`${baseStyles} bg-black border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]`}>
            <div className="w-12 h-12 bg-magenta-500 border-2 border-magenta-400 mb-4 clip-path-poly" style={{ clipPath: 'polygon(20% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%, 0% 20%)' }} />
            <div className="h-4 w-3/4 bg-cyan-400/20 border-l-4 border-cyan-400 mb-2" />
            <div className="h-4 w-1/2 bg-magenta-400/20 border-l-4 border-magenta-400" />
          </div>
        );
      case 'story':
        return (
          <div className={`${baseStyles} bg-[#fdfcf8] border-transparent text-black font-serif`}>
            <div className="w-16 h-1 bg-black mb-6" />
            <h4 className="text-2xl italic mb-4">The Narrative</h4>
            <div className="h-px w-full bg-black/10 mb-4" />
            <p className="text-xs leading-relaxed opacity-60">A cinematic approach to interface design.</p>
          </div>
        );
      case 'artist':
        return (
          <div className={`${baseStyles} bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-white/5 overflow-hidden relative`}>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl" />
            <div className="w-12 h-12 bg-white/10 rotate-45 mb-6 border border-white/20" />
            <div className="space-y-2 relative z-10">
              <div className="h-1 w-full bg-white/40 rounded-full" />
              <div className="h-1 w-2/3 bg-white/20 rounded-full" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderLoadingState = () => {
    if (isAnalyzing) {
      return (
        <div className="w-full h-full p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02] animate-pulse" />
          <div className="w-full max-w-md space-y-6 relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-mast-orange/20 flex items-center justify-center animate-bounce">
                <RefreshCw className="text-mast-orange animate-spin" size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold">Analyzing Interface</h4>
                <p className="text-xs text-white/40 uppercase tracking-widest">Identifying UI patterns & components</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-mast-orange/40 to-transparent"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                <div className="h-20 bg-white/5 rounded-2xl animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="h-20 bg-white/5 rounded-2xl animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <div className="h-32 bg-white/5 rounded-2xl animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
          
          {/* Scanning Line */}
          <motion.div 
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-mast-orange to-transparent shadow-[0_0_20px_rgba(255,99,33,0.5)] z-20"
          />
        </div>
      );
    }

    if (isGenerating) {
      return (
        <div className="w-full h-full p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-mast-orange/[0.01]" />
          <div className="text-center space-y-8 relative z-10">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-3xl bg-mast-orange/10 border border-mast-orange/20 flex items-center justify-center">
                <Sparkles className="text-mast-orange animate-pulse" size={32} />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border border-dashed border-mast-orange/20 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-bold font-display">Crafting Masterpiece</h4>
              <p className="text-sm text-white/40">Applying {selectedStyle} style architecture...</p>
            </div>

            <div className="w-64 h-1.5 bg-white/5 rounded-full mx-auto overflow-hidden">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, repeat: Infinity }}
                className="h-full mast-gradient"
              />
            </div>

            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 rounded-full bg-mast-orange"
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderModeOverlay = () => {
    const commonTransition = (
      <motion.div 
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute inset-0 bg-black z-30 origin-right"
      />
    );

    switch (selectedStyle) {
      case 'mast':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {commonTransition}
            {/* Glass Shards */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 10, 0],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }}
                className="absolute w-32 h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full"
                style={{ 
                  top: `${20 * i}%`, 
                  left: `${15 * i}%`,
                  filter: 'blur(40px)'
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-br from-mast-orange/10 via-transparent to-blue-500/10 opacity-30" />
          </div>
        );
      case 'neumorphism':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {commonTransition}
            {/* Inner Shadow Simulation */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.4)]" />
            <div className="absolute inset-0 border-[20px] border-white/5 blur-md" />
            <div className="absolute top-8 left-8 flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Tactile Mode</span>
            </div>
          </div>
        );
      case 'brutalism':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {commonTransition}
            {/* Bold Borders & Grid */}
            <div className="absolute inset-0 border-[2px] border-black/80" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />
            <motion.div 
              initial={{ rotate: -15, scale: 2, opacity: 0 }}
              animate={{ rotate: -15, scale: 1, opacity: 0.8 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute top-12 right-12 px-6 py-2 border-4 border-black font-black text-black bg-yellow-400 text-2xl uppercase tracking-tighter"
            >
              RAW UI
            </motion.div>
          </div>
        );
      case 'cyberpunk':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {commonTransition}
            {/* Scanlines & Digital Noise */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] z-10" />
            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            {/* HUD Elements */}
            <div className="absolute top-4 right-4 text-cyan-400 font-mono text-[10px] space-y-1">
              <div className="flex justify-between gap-4"><span>SYS_LINK:</span> <span className="animate-pulse">ACTIVE</span></div>
              <div className="flex justify-between gap-4"><span>ENCRYPT:</span> <span>AES-256</span></div>
              <div className="w-full h-1 bg-cyan-900/40 mt-2 overflow-hidden">
                <motion.div 
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-1/2 h-full bg-cyan-400"
                />
              </div>
            </div>
            
            <div className="absolute inset-0 border border-cyan-500/20 shadow-[inset_0_0_50px_rgba(6,182,212,0.1)]" />
          </div>
        );
      case 'story':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {commonTransition}
            {/* Cinematic Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            
            {/* Narrative Text */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="absolute bottom-12 left-8 right-8"
            >
              <div className="w-12 h-0.5 bg-mast-orange mb-4" />
              <h4 className="text-2xl font-serif italic text-white/90 mb-2 tracking-wide">Chapter One: The Interface</h4>
              <p className="text-sm text-white/50 font-serif leading-relaxed max-w-md">
                A new digital landscape emerges, where every pixel tells a story of elegance and purpose.
              </p>
            </motion.div>
            
            {/* Film Grain Effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
          </div>
        );
      case 'artist':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {commonTransition}
            {/* Abstract Paint Bleeds */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="absolute top-8 right-8">
              <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center rotate-12">
                <Palette className="text-white/20" size={24} />
              </div>
            </div>
            
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-color-dodge" />
          </div>
        );
      default:
        return commonTransition;
    }
  };

  const renderHome = () => (
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

        {/* Style Selector */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Select Design Style</label>
            <span className="text-[10px] font-bold text-mast-orange uppercase tracking-tighter animate-pulse">Live Preview</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(["mast", "neumorphism", "brutalism", "cyberpunk", "story", "artist"] as DesignStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  onMouseEnter={() => setHoveredStyle(style)}
                  onMouseLeave={() => setHoveredStyle(null)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    selectedStyle === style 
                      ? "mast-gradient border-transparent shadow-lg shadow-mast-orange/20" 
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="hidden lg:block">
              <div className="relative h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={hoveredStyle || selectedStyle}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-[280px]"
                  >
                    {renderSampleUI(hoveredStyle || selectedStyle)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
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
            <motion.button 
              animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
              onClick={triggerTransform}
              disabled={isAnalyzing || isGenerating}
              className={`w-full py-4 rounded-2xl ${error ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'mast-gradient text-white'} font-bold text-lg flex items-center justify-center gap-3 shadow-xl ${error ? 'shadow-red-500/10' : 'shadow-mast-orange/20'} active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
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
            </motion.button>
            <button 
              onClick={reset}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-medium hover:bg-white/10 transition-all"
            >
              Upload Different Image
            </button>
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
                <AlertCircle size={18} />
              </div>
              <div className="flex-1 pt-1">
                <h5 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-1">Transformation Error</h5>
                <p className="text-red-400/80 text-sm leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="p-1 text-red-400/40 hover:text-red-400 transition-colors"
              >
                <ArrowLeft size={16} className="rotate-90" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
                <div className={`aspect-video rounded-3xl overflow-hidden border ${error ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10'} bg-white/5 relative transition-all duration-500`}>
                  <img 
                    src={originalImage} 
                    alt="Original UI" 
                    className={`w-full h-full object-cover transition-all duration-700 ${isAnalyzing ? 'opacity-40 grayscale blur-[2px]' : error ? 'opacity-40 grayscale blur-[1px]' : 'opacity-60 grayscale-[0.5]'}`}
                    referrerPolicy="no-referrer"
                  />
                  {isAnalyzing && (
                    <motion.div 
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-mast-orange shadow-[0_0_15px_rgba(255,99,33,0.8)] z-10"
                    />
                  )}
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
                <div className={`aspect-video rounded-3xl overflow-hidden border ${selectedStyle === 'story' ? 'border-white/20 shadow-2xl shadow-white/5' : 'border-mast-orange/30'} bg-white/5 relative`}>
                  {redesignedImage ? (
                    <motion.div
                      initial={selectedStyle === 'story' ? { opacity: 0, scale: 1.1 } : {}}
                      animate={selectedStyle === 'story' ? {
                        opacity: 1,
                        scale: 1.05,
                        x: mousePos.x,
                        y: mousePos.y
                      } : {}}
                      transition={{ 
                        opacity: { duration: 1.5 },
                        scale: { duration: 2 },
                        type: "spring", 
                        damping: 20, 
                        stiffness: 100 
                      }}
                      className="w-full h-full relative"
                    >
                      <img 
                        src={redesignedImage} 
                        alt="Redesigned UI" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {renderModeOverlay()}
                      <div className="absolute bottom-6 right-6 flex gap-3 z-40">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDownload}
                          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-mast-orange text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-mast-orange/40 hover:brightness-110 transition-all"
                        >
                          <Download size={16} />
                          Download Masterpiece
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (isAnalyzing || isGenerating) ? (
                    renderLoadingState()
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                      <p className="text-sm text-white/40">Click "Make it Mast" to generate</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderShowcase = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-bold font-display mb-6 tracking-tight">Design <span className="text-mast-orange">Showcase</span></h2>
        <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">Explore how MastUi transforms ordinary interfaces into extraordinary digital experiences across six distinct design philosophies.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { mode: 'Mast', desc: 'Glassmorphism & Minimalist', seed: 'glass', color: 'from-mast-orange/20' },
          { mode: 'Neumorphism', desc: 'Soft UI & Tactile depth', seed: 'soft', color: 'from-blue-500/20' },
          { mode: 'Brutalism', desc: 'Bold, raw & high-contrast', seed: 'brutal', color: 'from-yellow-500/20' },
          { mode: 'Cyberpunk', desc: 'Futuristic & neon-infused', seed: 'cyber', color: 'from-purple-500/20' },
          { mode: 'Story', desc: 'Editorial & narrative-driven', seed: 'editorial', color: 'from-white/10' },
          { mode: 'Artist', desc: 'Creative & unconventional', seed: 'abstract', color: 'from-pink-500/20' }
        ].map((item, idx) => (
          <motion.div 
            key={idx} 
            whileHover={{ y: -10 }}
            className="glass-card rounded-[32px] overflow-hidden group border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500"
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${item.seed}/800/600`} 
                alt={item.mode} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                referrerPolicy="no-referrer" 
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${item.color} via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity`} />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                {item.mode} Mode
              </div>
            </div>
            <div className="p-8">
              <h3 className="font-bold text-2xl mb-2 group-hover:text-mast-orange transition-colors">{item.mode} Style</h3>
              <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mast-orange opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                View Details <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderProcess = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto py-12">
      <h2 className="text-5xl font-bold font-display mb-8 text-center">The <span className="text-mast-orange">Mast</span> Process</h2>
      <div className="space-y-12 mt-16">
        {[
          { step: '01', title: 'Upload Screenshot', desc: 'Provide your existing UI screenshot. Our AI vision model analyzes every pixel, element, and layout constraint.' },
          { step: '02', title: 'Select Your Vibe', desc: 'Choose from our curated styles like Neumorphism, Cyberpunk, or the signature Mast Glassmorphism.' },
          { step: '03', title: 'AI Transformation', desc: 'Our world-class designer model applies premium aesthetics while maintaining the functional integrity of your layout.' },
          { step: '04', title: 'Export & Implement', desc: 'Download your high-resolution masterpiece and use it as a blueprint for your next big project.' }
        ].map((item, idx) => (
          <div key={idx} className="flex gap-8 items-start">
            <div className="text-4xl font-bold font-display text-mast-orange opacity-50">{item.step}</div>
            <div className="glass-card p-8 rounded-3xl border border-white/10 flex-1">
              <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
              <p className="text-white/60 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderPricing = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto py-12">
      <h2 className="text-5xl font-bold font-display mb-16 text-center">Simple <span className="text-mast-orange">Pricing</span></h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { name: 'Free', price: '$0', features: ['3 Transformations/mo', 'Standard Styles', 'Community Support'] },
          { name: 'Pro', price: '$19', features: ['Unlimited Transformations', 'All Premium Styles', 'Priority AI Queue', 'Commercial License'], featured: true },
          { name: 'Team', price: '$49', features: ['Everything in Pro', 'Custom Style Training', 'API Access', 'Team Collaboration'] }
        ].map((plan, idx) => (
          <div key={idx} className={`glass-card p-8 rounded-[32px] border ${plan.featured ? 'border-mast-orange shadow-2xl shadow-mast-orange/10 scale-105' : 'border-white/10'} flex flex-col`}>
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-sm font-normal text-white/40">/mo</span></div>
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle2 size={16} className="text-mast-orange" />
                  {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.featured ? 'mast-gradient' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
              Get Started
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderAuth = (type: 'signin' | 'signup') => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto py-12">
      <div className="glass-card p-10 rounded-[40px] border border-white/10">
        <h2 className="text-3xl font-bold font-display mb-2 text-center">{type === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-center text-white/40 mb-8 text-sm">{type === 'signin' ? 'Enter your details to access your dashboard' : 'Join the community of world-class designers'}</p>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {type === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input type="text" placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-mast-orange/50 transition-colors" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-mast-orange/50 transition-colors" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input type="password" placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-mast-orange/50 transition-colors" />
          </div>
          <button className="w-full py-4 rounded-2xl mast-gradient font-bold text-lg shadow-lg shadow-mast-orange/20 active:scale-95 transition-all mt-4">
            {type === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-white/40">
          {type === 'signin' ? (
            <p>Don't have an account? <a href="#" onClick={(e) => handleNavClick(e, 'signup')} className="text-mast-orange hover:underline">Sign Up</a></p>
          ) : (
            <p>Already have an account? <a href="#" onClick={(e) => handleNavClick(e, 'signin')} className="text-mast-orange hover:underline">Sign In</a></p>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div 
      className="min-h-screen bg-[#050505] text-white selection:bg-mast-orange selection:text-white"
      onMouseMove={handleMouseMove}
    >
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-mast-orange/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={(e) => handleNavClick(e, 'home')}>
          <span className="text-2xl font-bold tracking-tighter font-display bg-gradient-to-r from-white via-white to-mast-orange bg-clip-text text-transparent group-hover:to-white transition-all duration-500">
            MastUi.com
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#" onClick={(e) => handleNavClick(e, 'showcase')} className={`transition-colors ${currentPage === 'showcase' ? 'text-mast-orange' : 'text-white/60 hover:text-white'}`}>Showcase</a>
          <a href="#" onClick={(e) => handleNavClick(e, 'process')} className={`transition-colors ${currentPage === 'process' ? 'text-mast-orange' : 'text-white/60 hover:text-white'}`}>Process</a>
          <a href="#" onClick={(e) => handleNavClick(e, 'pricing')} className={`transition-colors ${currentPage === 'pricing' ? 'text-mast-orange' : 'text-white/60 hover:text-white'}`}>Pricing</a>
          <div className="flex items-center gap-3 ml-4">
            <button 
              onClick={(e) => handleNavClick(e, 'signin')}
              className={`px-5 py-2 rounded-full border transition-colors ${currentPage === 'signin' ? 'border-mast-orange text-mast-orange' : 'border-white/10 text-white/60 hover:bg-white/5'}`}
            >
              Sign In
            </button>
            <button 
              onClick={(e) => handleNavClick(e, 'signup')}
              className="px-5 py-2 rounded-full mast-gradient font-bold shadow-lg shadow-mast-orange/10 hover:shadow-mast-orange/20 transition-all"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        {currentPage !== 'home' && (
          <button 
            onClick={(e) => handleNavClick(e, 'home')}
            className="mb-8 flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Editor
          </button>
        )}

        <AnimatePresence mode="wait">
          {currentPage === 'home' && <div key="home">{renderHome()}</div>}
          {currentPage === 'showcase' && <div key="showcase">{renderShowcase()}</div>}
          {currentPage === 'process' && <div key="process">{renderProcess()}</div>}
          {currentPage === 'pricing' && <div key="pricing">{renderPricing()}</div>}
          {currentPage === 'signin' && <div key="signin">{renderAuth('signin')}</div>}
          {currentPage === 'signup' && <div key="signup">{renderAuth('signup')}</div>}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 cursor-pointer" onClick={(e) => handleNavClick(e, 'home')}>
            <span className="font-bold tracking-tighter font-display">MastUi.com</span>
          </div>
          <p className="text-white/30 text-sm">
            © 2026 MastUi.com AI. All rights reserved. Built with Gemini 3.1.
          </p>
          <div className="flex gap-6 text-white/30 text-sm">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Twitter</a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Discord</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
