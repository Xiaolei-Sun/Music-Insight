/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormEvent, useState } from 'react';
import { Search, Music2, ArrowLeft, Loader2, Sparkles, User, History, Music, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchMusicInfo } from './services/geminiService';
import { MusicInfo, AppState } from './types';

function CopyableText({ content, className = '' }: { content?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <p className={className}>
        {content}
      </p>
      <button 
        onClick={handleCopy}
        className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-neutral-300 hover:text-black"
        title="Copy"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<AppState>('idle');
  const [result, setResult] = useState<MusicInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setState('searching');
    setError(null);
    try {
      const data = await fetchMusicInfo(query);
      setResult(data);
      setState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('error');
    }
  };

  const handleBack = () => {
    setState('idle');
    setQuery('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 md:p-10 selection:bg-black selection:text-white">
      <div className="w-full max-w-6xl bg-white editorial-container flex flex-col overflow-hidden relative min-h-[800px]">
        {/* Header */}
        <header className="h-20 border-b-2 border-black flex items-center px-6 md:px-10 gap-8 bg-neutral-50 sticky top-0 z-50">
          <button 
            onClick={handleBack}
            className="text-lg font-black uppercase tracking-tighter shrink-0 hover:opacity-70 transition-opacity"
          >
            MusiContext / 01
          </button>
          
          <div className="flex-1 relative hidden md:block">
            <input 
              type="text" 
              value={query || (result ? `${result.songName} – ${result.artistName}` : '')}
              readOnly
              onClick={handleBack}
              placeholder="Start new search..."
              className="w-full h-12 bg-white border-2 border-black px-4 font-mono text-xs focus:outline-none cursor-pointer"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase opacity-40 pointer-events-none">
              {state === 'result' ? 'Click to re-search' : 'Ready for input'}
            </div>
          </div>

          <button 
            onClick={handleBack}
            className="h-12 px-6 md:px-8 bg-black text-white font-bold uppercase text-[10px] md:text-xs tracking-widest hover:bg-neutral-800 transition-colors"
          >
            {state === 'result' ? 'NEW SEARCH' : 'SEARCH TOOL'}
          </button>
        </header>

        <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
          <AnimatePresence mode="wait">
            {state === 'idle' || state === 'searching' || state === 'error' ? (
              <motion.div
                key="search-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-10"
              >
                <div className="max-w-2xl">
                  <h1 className="text-6xl md:text-8xl font-serif italic leading-[0.85] tracking-tight mb-8">
                    Rapid <br />
                    Music <br />
                    Research.
                  </h1>
                  <p className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-neutral-400 mb-12">
                    Enter Song Name or Artist
                  </p>

                  <form onSubmit={handleSearch} className="relative w-full max-w-xl mx-auto">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Dreams – Fleetwood Mac"
                      disabled={state === 'searching'}
                      className="w-full h-16 border-b-4 border-black px-4 text-2xl md:text-3xl font-bold focus:outline-none placeholder:text-neutral-200 bg-transparent disabled:opacity-50"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={state === 'searching' || !query.trim()}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:translate-x-1 transition-transform disabled:opacity-30"
                    >
                      {state === 'searching' ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        <Search className="w-8 h-8" />
                      )}
                    </button>
                  </form>

                  {state === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-4 border border-black bg-red-50 text-red-600 font-mono text-[10px] uppercase font-bold tracking-widest"
                    >
                      {error}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col md:flex-row overflow-hidden"
              >
                {/* Sidebar */}
                <aside className="w-full md:w-80 border-b-2 md:border-b-0 md:border-r-2 border-black p-8 flex flex-col gap-10 bg-white shrink-0 overflow-y-auto">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Song Title</p>
                    <h1 className="text-5xl font-serif italic leading-none">{result?.songName}</h1>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Artist</p>
                    <p className="text-2xl font-black tracking-tight">{result?.artistName}</p>
                  </div>

                  <div className="space-y-4 py-4 border-t border-neutral-100">
                    <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Album</span>
                      <span className="text-xs font-mono font-bold truncate max-w-[120px]">{result?.album || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-neutral-50 pb-2">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Year</span>
                      <span className="text-xs font-mono font-bold">{result?.releaseYear || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="hidden md:flex mt-auto pt-8 items-center gap-4">
                    <div className="w-16 h-16 bg-black flex items-center justify-center shrink-0">
                      <Music2 className="text-white w-8 h-8" />
                    </div>
                    <div className="text-[9px] font-mono leading-tight uppercase font-bold text-neutral-400">
                      Processed by <br />
                      MusiContext v1.0
                    </div>
                  </div>
                </aside>

                {/* Main Content Area */}
                <section className="flex-1 flex flex-col overflow-y-auto bg-white custom-scrollbar">
                  {/* Top Analysis Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 border-b-2 border-black min-h-[300px]">
                    <div className="p-8 lg:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-black space-y-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1">01 / Artist Overview</h2>
                      </div>
                      <div className="space-y-4">
                        <CopyableText 
                          content={result?.artistOverviewCN} 
                          className="text-base leading-relaxed text-neutral-700 font-medium"
                        />
                        <CopyableText 
                          content={result?.artistOverviewEN} 
                          className="text-sm leading-relaxed text-neutral-400 font-gill"
                        />
                      </div>
                    </div>

                    <div className="p-8 lg:p-10 space-y-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1">02 / Track Background</h2>
                      </div>
                      <div className="space-y-4">
                        <CopyableText 
                          content={result?.trackBackgroundCN} 
                          className="text-base leading-relaxed text-neutral-700 font-medium"
                        />
                        <CopyableText 
                          content={result?.trackBackgroundEN} 
                          className="text-sm leading-relaxed text-neutral-400 font-gill"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Style Insight */}
                  <div className="p-8 lg:p-10 bg-neutral-50 border-b-2 border-black">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1">03 / Style Description</h2>
                      </div>
                      <div className="space-y-4">
                        <CopyableText 
                          content={result?.styleDescriptionCN} 
                          className="text-2xl font-serif italic leading-snug text-neutral-800"
                        />
                        <CopyableText 
                          content={result?.styleDescriptionEN} 
                          className="text-lg leading-snug text-neutral-500 font-gill"
                        />
                      </div>
                  </div>

                  {/* Combined Summary Section */}
                  <div className="bg-white border-t-2 border-black p-8 lg:p-10 space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1">04 / Bilingual Summary</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold uppercase tracking-tighter text-neutral-400">Chinese Version</span>
                        </div>
                        <CopyableText 
                          content={result?.summaryCN} 
                          className="text-base leading-relaxed text-neutral-700 font-medium"
                        />
                      </div>
                      
                      <div className="space-y-4 lg:border-l lg:border-neutral-100 lg:pl-10">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold uppercase tracking-tighter text-neutral-400 font-gill">English Version</span>
                        </div>
                        <CopyableText 
                          content={result?.summaryEN} 
                          className="text-base leading-relaxed text-neutral-700 font-gill italic"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="h-10 bg-black text-white flex items-center justify-between px-6 md:px-10 text-[9px] font-bold uppercase tracking-[0.2em] relative z-50">
          <div className="flex gap-4">
            <span className="opacity-50">Status:</span>
            <span>Ready</span>
          </div>
          <div className="hidden sm:block">© 2024 MusiContext Intelligence</div>
          <div className="flex gap-4">
            <span className="opacity-50">Latency:</span>
            <span>{state === 'searching' ? 'Calculating...' : '420ms'}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
