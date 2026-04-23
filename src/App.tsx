/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, Power, Shield, Cpu, Wifi } from 'lucide-react';
import { ShellSimulator, type TerminalLine } from './lib/shell-simulator';
import { cn } from './lib/utils';

export default function App() {
  const [shell] = useState(() => new ShellSimulator());
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isBooted, setIsBooted] = useState(false);
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooted(true);
      setHistory(shell.getHistory());
    }, 1500);
    return () => clearTimeout(timer);
  }, [shell]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = useCallback((e: FormEvent) => {
    e.preventDefault();
    
    // Pass to shell
    shell.handleInput(inputValue);
    
    // Update local history
    setHistory([...shell.getHistory()]);
    setInputValue('');
  }, [inputValue, shell]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  if (!isPoweredOn) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <button 
          onClick={() => setIsPoweredOn(true)}
          className="group flex flex-col items-center gap-4 transition-all"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-[#0c0c0c] group-hover:border-terminal-green group-hover:bg-[#1a1a1a]">
            <Power className="h-10 w-10 text-zinc-700 group-hover:text-terminal-green" />
          </div>
          <span className="font-retro text-xl tracking-widest text-zinc-700 group-hover:text-terminal-green">BOOT_VM</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen flex-col bg-[#080808] font-mono text-terminal-green overflow-hidden" onClick={focusInput}>
      {/* CRT Effects */}
      <div className="crt-overlay-scanlines" />
      <div className="crt-overlay-vignette" />

      {/* Android-style Status Bar */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-2 bg-black/40 border-b border-terminal-green/20 text-[10px] sm:text-[12px] opacity-80 z-20">
        <div className="flex gap-3 sm:gap-4">
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="tracking-widest hidden xs:inline">SYSTEM_ROOT</span>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            <span className="hidden xs:inline tracking-tighter">LTE+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 border border-terminal-green relative flex items-center p-[1px]">
              <div className="bg-terminal-green h-full w-[85%]" />
            </div>
            <span>85%</span>
          </div>
        </div>
      </div>

      {/* Terminal Header */}
      <div className="px-4 sm:px-8 pt-6 sm:pt-8 flex justify-between items-end z-20">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tighter drop-shadow-[0_0_8px_rgba(0,255,65,0.6)] terminal-glow uppercase">Alpine_Term_v3</h1>
          <p className="text-[10px] sm:text-xs opacity-60 italic whitespace-nowrap">Embedded VM // Py3.12 (Chaquopy Bridge) // Session: 0x8BF290AA</p>
        </div>
        <div className="text-right text-[8px] sm:text-[10px] opacity-40 hidden xs:block">
          <p>KERNEL: 6.1.0-21-ALPINE</p>
          <div className="flex items-center justify-end gap-2 mt-1">
            <Cpu className="h-3 w-3" />
            <span>LOAD: 12%</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Output Area */}
      <div className="relative flex-1 px-4 sm:px-8 py-4 sm:py-6 overflow-hidden flex flex-col z-20">
        <div className="scanline-anim" />
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 custom-scrollbar text-[14px] sm:text-[15px] leading-relaxed"
        >
          <AnimatePresence mode="popLayout">
            {history.map((line, index) => (
              <motion.div
                key={`${index}-${line.text}`}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
                className={cn(
                  "flex gap-3 break-all terminal-glow",
                  line.type === 'system' && "opacity-40 italic",
                  line.type === 'prompt' && "text-terminal-amber terminal-glow-amber",
                  line.type === 'output' && "text-terminal-green",
                  line.type === 'input' && "text-terminal-green",
                  line.type === 'game-header' && "text-terminal-amber font-bold",
                  line.type === 'game-prompt' && "text-terminal-amber"
                )}
              >
                {line.type === 'system' && <span className="opacity-40 shrink-0">[system]</span>}
                <span className={cn(line.type === 'system' ? "" : "w-full")}>
                  {line.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Input Line */}
          {isBooted && (
            <div className="flex items-center gap-3">
              <span className="text-terminal-amber terminal-glow-amber whitespace-nowrap font-bold">
                {shell.getCustomPrompt()}
              </span>
              <form onSubmit={handleCommand} className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full bg-transparent p-0 text-terminal-green outline-none terminal-glow caret-terminal-green border-none"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </form>
            </div>
          )}
        </div>

        {!isBooted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-t-2 border-terminal-green" />
              <span className="animate-pulse font-retro text-xl sm:text-2xl tracking-[0.2em] text-terminal-green uppercase">Mounting /assets...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Interface */}
      <div className="p-4 sm:p-6 bg-black/60 border-t border-terminal-green/30 z-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {['Tab', 'Ctrl', 'Esc', 'Alt'].map(label => (
              <button 
                key={label}
                className="px-3 sm:px-4 py-1 border border-terminal-green/40 text-[10px] sm:text-[11px] hover:bg-terminal-green/10 uppercase transition-colors tracking-widest text-terminal-green/80"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 opacity-50">
              <Shield className="h-3 w-3" />
              <span className="text-[10px] uppercase font-bold">E2E_ENCRYPTED</span>
            </div>
            <button 
              onClick={() => setIsPoweredOn(false)}
              className="px-2 py-1 flex items-center gap-2 text-[#FF4444] opacity-70 hover:opacity-100 transition-opacity"
            >
              <Power className="h-3 w-3" />
              <span className="text-[10px] uppercase">Shutdown</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-terminal-green/20 to-transparent shrink-0" />
    </div>
  );
}
