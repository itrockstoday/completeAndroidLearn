import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

type LineType = 'input' | 'output' | 'system' | 'error';

interface TerminalLine {
  text: string;
  type: LineType;
}

function App() {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState<'boot' | 'login' | 'level1' | 'level2' | 'finished'>('boot');
  const [userName, setUserName] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === 'boot') {
      const sequence = async () => {
        addSystemLine("[  BOOT  ] INITIALIZING SS ALPINE CORE...");
        await wait(800);
        addSystemLine("[   OK   ] MEMORY CHUNKS MOUNTED");
        await wait(500);
        addSystemLine("[   OK   ] KERNEL ATTACHED (REACT WEBSHELL)");
        await wait(1000);
        addSystemLine("\n=== SS ALPINE LOGIN ===");
        setStep('login');
        addOutputLine("Identify yourself, Explorer:");
      };
      sequence();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const addLine = (text: string, type: LineType) => {
    setHistory(prev => [...prev, { text, type }]);
  };

  const addInputLine = (text: string) => addLine(text, 'input');
  const addOutputLine = (text: string) => addLine(text, 'output');
  const addSystemLine = (text: string) => addLine(text, 'system');

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue.trim();
    if (!cmd) return;

    addInputLine(cmd);
    setInputValue('');

    if (step === 'login') {
      setUserName(cmd);
      setStep('level1');
      addSystemLine(`\nWelcome, Captain ${cmd}.`);
      addOutputLine("--- LEVEL 1: The Magic Map (Navigation) ---");
      addOutputLine("CONCEPT: The computer is a Giant Tree. Folders are Branches.");
      addOutputLine("EXPLAIN: We use 'ls' to see what is on our branch.");
      addOutputLine("DEMO: Type 'ls' to look around.");
    } else if (step === 'level1') {
      if (cmd.toLowerCase() === 'ls') {
        addOutputLine("Scanning directory...");
        addOutputLine("explorer.txt  logs.db  secrets/  vault/");
        addSystemLine("SUCCESS! Level 1 Complete.");
        setStep('level2');
        addOutputLine("\n--- LEVEL 2: The Toy Box (File Creation) ---");
        addOutputLine("CONCEPT: Creating a file is like putting a toy in a box.");
        addOutputLine("EXPLAIN: The 'touch' command creates a brand new file.");
        addOutputLine("DEMO: Type 'touch badge.txt' to create a token.");
      } else {
        addOutputLine("Try again. You must navigate using 'ls'.");
      }
    } else if (step === 'level2') {
      if (cmd.toLowerCase().startsWith('touch ')) {
        addOutputLine(`File created: ${cmd.split(' ')[1] || 'unnamed'}`);
        addSystemLine("SUCCESS! Level 2 Complete.");
        addSystemLine(`\nMISSION COMPLETE, CAPTAIN ${userName.toUpperCase()}!`);
        addOutputLine("You have mastered basic terminal navigation and creation.");
        setStep('finished');
      } else {
        addOutputLine("Try again. Use 'touch [filename]'.");
      }
    } else if (step === 'finished') {
      addOutputLine("Mission achieved. Terminal in passive mode.");
    }
  };

  const getLineColor = (type: LineType) => {
    switch (type) {
      case 'input': return '#FFFFFF';
      case 'output': return '#00FF00';
      case 'system': return '#FFD700';
      case 'error': return '#FF4444';
      default: return '#00FF00';
    }
  };

  return (
    <div style={{
      backgroundColor: 'black',
      color: '#00FF00',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Fira Code", monospace',
      padding: '20px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Scanline effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 2px, 3px 100%',
        pointerEvents: 'none',
        zIndex: 10
      }} />

      <div 
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '10px',
          paddingRight: '10px'
        }}
      >
        {history.map((line, i) => (
          <div key={i} style={{ 
            color: getLineColor(line.type), 
            marginBottom: '4px',
            whiteSpace: 'pre-wrap',
            textShadow: `0 0 5px ${getLineColor(line.type)}88`
          }}>
            {line.type === 'input' ? '$ ' : ''}{line.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleCommand} style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '8px', color: 'white' }}>$</span>
        <input
          autoFocus
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontFamily: 'inherit',
            fontSize: '16px',
            outline: 'none',
            textShadow: '0 0 5px rgba(255,255,255,0.5)'
          }}
        />
      </form>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
