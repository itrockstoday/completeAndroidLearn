import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

type LineType = 'input' | 'output' | 'system' | 'error';

interface TerminalLine {
  text: string;
  type: LineType;
}

const TERMINAL_THEME = {
  bg: '#0a0a0a',
  text: '#33ff33',
  input: '#ffffff',
  system: '#fbbf24',
  error: '#ef4444',
  cursor: '#33ff33',
};

function App() {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  const [step, setStep] = useState<'login' | 'tutorial' | 'play' | 'finished'>('login');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const bootSequence = async () => {
      const messages = [
        "ROM OK",
        "RAM TEST 640K OK",
        "DRIVE A: READY",
        "MOUNTING /DEV/SDA1...",
        "RETRO OS V1.0.4 STARTING...",
        "--------------------------",
        "SYSTEM CORE: ONLINE",
        "UI MODULE: LOADED",
        "TERMINAL HANDLER: READY",
      ];

      for (const msg of messages) {
        addSystemLine(msg);
        await new Promise(r => setTimeout(r, Math.random() * 200 + 50));
      }
      setIsBooting(false);
      addOutputLine("\nWelcome to RETRO TERMINAL CORE.");
      addOutputLine("Identify yourself to begin the session.");
    };
    bootSequence();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const addLine = (text: string, type: LineType) => {
    setHistory(prev => [...prev, { text, type }]);
  };

  const addInputLine = (text: string) => addLine(text, 'input');
  const addOutputLine = (text: string) => addLine(text, 'output');
  const addSystemLine = (text: string) => addLine(text, 'system');

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBooting) return;
    
    const cmd = inputValue.trim();
    if (!cmd) return;

    addInputLine(cmd);
    setInputValue('');

    const lowerCmd = cmd.toLowerCase();

    if (step === 'login') {
      addSystemLine(`\nUser authorized: ${cmd.toUpperCase()}`);
      addOutputLine("Initializing Kiosk Mode...");
      addOutputLine("Type 'help' for available commands.");
      setStep('play');
    } else if (lowerCmd === 'help') {
      addOutputLine("Available Commands:");
      addOutputLine("  ls      - List files in current directory");
      addOutputLine("  cat     - Read a file content");
      addOutputLine("  whoami  - Show current user");
      addOutputLine("  status  - Show system status");
      addOutputLine("  clear   - Clear the terminal");
    } else if (lowerCmd === 'ls') {
      addOutputLine("drwx------  admin  staff  4096 Apr 29 02:25 .");
      addOutputLine("drwxr-xr-x  root   root   4096 Apr 29 02:20 ..");
      addOutputLine("-rw-r--r--  user   staff    42 Apr 29 02:25 welcome.txt");
      addOutputLine("-rwxr-xr-x  user   staff  8192 Apr 29 02:30 secret_project");
    } else if (lowerCmd === 'clear') {
      setHistory([]);
    } else if (lowerCmd === 'whoami') {
      addOutputLine("User: Explorer");
      addOutputLine("Role: Terminal Operator");
    } else if (lowerCmd === 'status') {
      addSystemLine("SYSTEM HEALTH: 100%");
      addSystemLine("MEMORY USAGE: 12%");
      addSystemLine("UPTIME: 00:04:22");
    } else if (lowerCmd.startsWith('cat ')) {
      const file = lowerCmd.split(' ')[1];
      if (file === 'welcome.txt') {
        addOutputLine("Welcome to the Retro Terminal Interface.");
        addOutputLine("This is your kiosk for project RETRO_SHELL.");
      } else {
        addOutputLine(`Error: ${file} not found or access denied.`);
      }
    } else {
      addOutputLine(`Command not found: ${cmd}`);
    }
  };

  const focusInput = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div 
      onClick={focusInput}
      style={{
        backgroundColor: TERMINAL_THEME.bg,
        color: TERMINAL_THEME.text,
        height: '100vh',
        width: '100vw',
        padding: '20px',
        fontFamily: '"JetBrains Mono", "Courier New", monospace',
        fontSize: '15px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* CRT Scanline Effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
        backgroundSize: '100% 3px, 4px 100%',
        pointerEvents: 'none',
        zIndex: 10
      }} />
      
      {/* CRT Flicker/Static Effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(51, 255, 51, 0.02)',
        pointerEvents: 'none',
        animation: 'flicker 0.15s infinite',
        zIndex: 9
      }} />

      <style>{`
        @keyframes flicker {
          0% { opacity: 0.9; }
          100% { opacity: 1.0; }
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #33ff3344; border-radius: 10px; }
      `}</style>

      <div 
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '20px',
        }}
      >
        <div style={{ opacity: 0.8, fontSize: '12px', marginBottom: '10px' }}>
          RETRO TERMINAL KIOSK INTERFACE V1.0.5
          <br />
          BUILD: 2026.04.29.DEPLOY_FIX
          <hr style={{ border: 'none', borderTop: '1px solid #33ff3322' }} />
        </div>

        {history.map((line, i) => (
          <div key={i} style={{ marginBottom: '4px', wordBreak: 'break-all' }}>
            {line.type === 'input' && <span style={{ marginRight: '8px' }}>$</span>}
            <span style={{ 
              color: line.type === 'system' ? TERMINAL_THEME.system : 
                     line.type === 'error' ? TERMINAL_THEME.error : 
                     line.type === 'input' ? TERMINAL_THEME.input : TERMINAL_THEME.text,
              textShadow: line.type === 'output' ? '0 0 8px rgba(51, 255, 51, 0.5)' : 'none'
            }}>
              {line.text}
            </span>
          </div>
        ))}
        
        {!isBooting && (
          <form onSubmit={handleCommand} style={{ display: 'flex', marginTop: '4px' }}>
            <span style={{ marginRight: '8px', color: TERMINAL_THEME.input }}>$</span>
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: TERMINAL_THEME.input,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                outline: 'none',
                flex: 1,
                padding: 0,
              }}
            />
          </form>
        )}
      </div>

      <div style={{ 
        marginTop: '10px', 
        fontSize: '11px', 
        opacity: 0.5, 
        display: 'flex', 
        justifyContent: 'space-between' 
      }}>
        <span>STATUS: {isBooting ? 'BOOTING...' : 'ONLINE'}</span>
        <span>LATENCY: 42ms</span>
        <span>APK_BUILD: artifacts/RetroTerminal.apk</span>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
