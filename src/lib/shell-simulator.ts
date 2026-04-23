/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'system' | 'prompt' | 'game-header' | 'game-prompt';
}

interface GameLevel {
  title: string;
  concept: string;
  analogy: string;
  explain: string;
  demo: string;
  imitate: string;
  resume: string;
}

export class ShellSimulator {
  private history: TerminalLine[] = [];
  private currentPath = "~";
  private user = "user";
  private hostname = "alpine";
  private isExited = false;
  private gameActive = false;
  private gameStep: 'intro' | 'name' | 'level' | 'summary' = 'intro';
  private gameLevelIndex = 0;
  private playerName = "";
  private unlockedResumePoints: string[] = [];
  private scriptContent: string | null = null;
  private pythonLoaded = false;
  private autoStarted = false;

  private levels: GameLevel[] = [
    {
      title: "The Magic Map (Navigation)",
      concept: "Directories",
      analogy: "The computer is a Giant Tree. Folders are Branches.",
      explain: "We use 'ls' to see what is on our branch.",
      demo: "Type 'ls' to look around.",
      imitate: "ls",
      resume: "Proficient in Directory Navigation and File System Hierarchy Management."
    },
    {
      title: "The Toy Box (File Creation)",
      concept: "Files",
      analogy: "Creating a file is like putting a toy in a box.",
      explain: "The 'touch' command creates a brand new file instantly.",
      demo: "Type 'touch explorer.txt' to create a badge.",
      imitate: "touch",
      resume: "Expertise in Data Lifecycle Management and File System Operations."
    },
    {
      title: "Simon Says (Permissions)",
      concept: "Sudo",
      analogy: "The Guard only lets you through if Simon (Sudo) says it is okay.",
      explain: "'sudo' gives you SuperUser powers for restricted areas.",
      demo: "Type 'sudo' to show your Master Key.",
      imitate: "sudo",
      resume: "Advanced Administrative Privilege Escalation and System Security Protocols."
    }
  ];

  constructor() {
    this.addSystemLine("Welcome to Alpine Terminal v3.18");
    this.addSystemLine("CHAQUOPY V17.0 (PY3.12) BRIDGE - INITIALIZING...");
    this.addOutputLine("");
    this.addOutputLine("Type 'help' to see available commands.");
    this.addOutputLine("");
    this.loadAssets();
  }

  private async loadAssets() {
    try {
      const response = await fetch('/assets/game.sh');
      if (response.ok) {
        this.scriptContent = await response.text();
      }

      // Simulate the Python runtime loading (mirroring Chaquopy's behavior)
      setTimeout(() => {
        this.pythonLoaded = true;
        this.addSystemLine("[ OK ] CHAQUOPY RUNTIME ATTACHED (PYTHON 3.12)");
        this.autoExecute();
      }, 2000);
    } catch (e) {
      console.error("Failed to load game assets", e);
    }
  }

  private autoExecute() {
    if (this.autoStarted) return;
    this.autoStarted = true;
    this.handleInput("./game.sh");
  }

  private addSystemLine(text: string) {
    this.history.push({ text, type: 'system' });
  }

  private addOutputLine(text: string) {
    this.history.push({ text, type: 'output' });
  }

  public getHistory() {
    return this.history;
  }

  public isGameActive() {
    return this.gameActive;
  }

  public getCustomPrompt() {
    if (!this.gameActive) return `${this.user}@${this.hostname}:${this.currentPath}$ `;
    if (this.gameStep === 'name') return "Identify yourself, Explorer: ";
    if (this.gameStep === 'level') return `[IMITATE & PRACTICE] ${this.playerName}, type the command: `;
    if (this.gameStep === 'summary') return "Press Enter to return to the Start Screen...";
    return "> ";
  }

  private startLevel(index: number) {
    const lvl = this.levels[index];
    this.history = []; // Simplified "clear screen"
    this.history.push({ text: `--- LEVEL ${index + 1}: ${lvl.title} ---`, type: 'game-header' });
    this.addOutputLine(`EXPLAIN: ${lvl.analogy}`);
    this.addOutputLine(`LESSON: ${lvl.explain}`);
    this.addOutputLine("");
    this.addOutputLine(`DEMONSTRATE: ${lvl.demo}`);
  }

  private showSummary() {
    this.history = []; // Clear screen
    this.history.push({ text: "========================================", type: 'game-header' });
    this.history.push({ text: `MISSION COMPLETE, CAPTAIN ${this.playerName.toUpperCase()}!`, type: 'game-header' });
    this.history.push({ text: "========================================", type: 'game-header' });
    this.addOutputLine("");
    this.addOutputLine("YOUR NEW PROFESSIONAL RESUME ENTRIES:");
    this.unlockedResumePoints.forEach(point => {
      this.addOutputLine(`- ${point}`);
    });
    this.addOutputLine("");
    this.addOutputLine("=".repeat(40));
  }

  public handleInput(input: string): TerminalLine[] {
    if (this.isExited) return [{ text: "System halted. Refresh to restart.", type: 'system' }];

    const trimmedInput = input.trim();
    const newLines: TerminalLine[] = [];

    if (this.gameActive) {
      // Add input to history with custom prompt
      this.history.push({ 
        text: `${this.getCustomPrompt()}${input}`, 
        type: 'input' 
      });

      if (this.gameStep === 'name') {
        if (trimmedInput) {
          this.playerName = trimmedInput;
          this.gameStep = 'level';
          this.gameLevelIndex = 0;
          this.unlockedResumePoints = [];
          this.startLevel(0);
        }
      } else if (this.gameStep === 'level') {
        const currentLvl = this.levels[this.gameLevelIndex];
        if (trimmedInput.toLowerCase().includes(currentLvl.imitate)) {
          this.unlockedResumePoints.push(currentLvl.resume);
          this.addOutputLine("");
          this.addOutputLine(`SUCCESS! Level ${this.gameLevelIndex + 1} Complete.`);
          
          if (this.gameLevelIndex < this.levels.length - 1) {
            this.gameLevelIndex++;
            this.startLevel(this.gameLevelIndex);
          } else {
            this.gameStep = 'summary';
            this.showSummary();
          }
        } else {
          this.addOutputLine("Try again! Follow the demonstration.");
        }
      } else if (this.gameStep === 'summary') {
        this.gameActive = false;
        this.history.push({ text: "Returning to terminal...", type: 'system' });
      }
      
      return this.history;
    }

    // Standard shell handling
    this.history.push({ 
      text: `${this.user}@${this.hostname}:${this.currentPath}$ ${input}`, 
      type: 'prompt' 
    });

    switch (trimmedInput.toLowerCase()) {
      case 'help':
        this.addOutputLine("Available commands:");
        this.addOutputLine("  help     - Show this help message");
        this.addOutputLine("  clear    - Clear the terminal screen");
        this.addOutputLine("  ls       - List files in current directory");
        this.addOutputLine("  whoami   - Display current user");
        this.addOutputLine("  date     - Display current system date");
        this.addOutputLine("  exit     - Shutdown terminal");
        this.addOutputLine("  ./game.sh - Run the game script");
        break;
      case 'ls':
        this.addOutputLine("drwxr-xr-x  2 user user  4096 Apr 22 21:19 documents");
        this.addOutputLine("-rwxr-xr-x  1 user user   842 Apr 22 21:19 game.sh");
        this.addOutputLine("-rw-r--r--  1 user user    12 Apr 22 21:19 README.txt");
        break;
      case 'whoami':
        this.addOutputLine(this.user);
        break;
      case 'date':
        this.addOutputLine(new Date().toString());
        break;
      case 'clear':
        this.history = [];
        return [];
      case './game.sh':
        if (this.scriptContent) {
           this.history.push({ text: "Reading /assets/game.sh...", type: 'system' });
           // Stream the "cat << EOF" command sequence visually
           const lines = this.scriptContent.split('\n');
           lines.slice(0, 10).forEach(line => this.addOutputLine(line)); // Stream start as preview
           this.addOutputLine("...");
        }
        this.gameActive = true;
        this.gameStep = 'name';
        this.history.push({ text: "Executing game.sh...", type: 'system' });
        this.addOutputLine("");
        this.addOutputLine("=== SS ALPINE LOGIN ===");
        break;
      case 'exit':
        this.isExited = true;
        this.addOutputLine("Logging out...");
        this.addOutputLine("System halted.");
        break;
      default:
        this.addOutputLine(`/bin/sh: ${trimmedInput}: not found`);
    }

    return this.history;
  }
}
