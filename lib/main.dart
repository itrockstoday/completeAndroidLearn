import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:async';

void main() {
  runApp(const RetroTerminalApp());
}

class RetroTerminalApp extends StatelessWidget {
  const RetroTerminalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Retro Terminal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black,
        textTheme: GoogleFonts.firaCodeTextTheme(
          ThemeData.dark().textTheme,
        ),
      ),
      home: const TerminalScreen(),
    );
  }
}

class TerminalLine {
  final String text;
  final LineType type;
  final DateTime timestamp;

  TerminalLine(this.text, this.type) : timestamp = DateTime.now();
}

enum LineType { input, output, system, error }

class TerminalScreen extends StatefulWidget {
  const TerminalScreen({super.key});

  @override
  State<TerminalScreen> createState() => _TerminalScreenState();
}

class _TerminalScreenState extends State<TerminalScreen> {
  final List<TerminalLine> _history = [];
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();
  
  String _currentStep = 'init';
  String _userName = '';
  
  @override
  void initState() {
    super.initState();
    _bootSequence();
  }

  void _bootSequence() async {
    _addSystemLine("[  BOOT  ] INITIALIZING SS ALPINE CORE...");
    await Future.delayed(const Duration(milliseconds: 800));
    _addSystemLine("[   OK   ] MEMORY CHUNKS MOUNTED");
    await Future.delayed(const Duration(milliseconds: 500));
    _addSystemLine("[   OK   ] KERNEL ATTACHED (DART 3.5)");
    await Future.delayed(const Duration(milliseconds: 1000));
    _addSystemLine("\n=== SS ALPINE LOGIN ===");
    setState(() => _currentStep = 'login');
    _addOutputLine("Identify yourself, Explorer:");
  }

  void _addInputLine(String text) {
    setState(() => _history.add(TerminalLine(text, LineType.input)));
    _scrollToBottom();
  }

  void _addOutputLine(String text) {
    setState(() => _history.add(TerminalLine(text, LineType.output)));
    _scrollToBottom();
  }

  void _addSystemLine(String text) {
    setState(() => _history.add(TerminalLine(text, LineType.system)));
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _handleCommand(String rawValue) {
    String value = rawValue.trim();
    if (value.isEmpty) return;
    
    _addInputLine(value);
    _controller.clear();

    if (_currentStep == 'login') {
      _userName = value;
      _currentStep = 'level1';
      _addSystemLine("\nWelcome, Captain $_userName.");
      _addOutputLine("--- LEVEL 1: The Magic Map (Navigation) ---");
      _addOutputLine("CONCEPT: The computer is a Giant Tree. Folders are Branches.");
      _addOutputLine("EXPLAIN: We use 'ls' to see what is on our branch.");
      _addOutputLine("DEMO: Type 'ls' to look around.");
    } else if (_currentStep == 'level1') {
      if (value.toLowerCase() == 'ls') {
        _addOutputLine("Scanning directory...");
        _addOutputLine("explorer.txt  logs.db  secrets/  vault/");
        _addSystemLine("SUCCESS! Level 1 Complete.");
        _currentStep = 'level2';
        _addOutputLine("\n--- LEVEL 2: The Toy Box (File Creation) ---");
        _addOutputLine("CONCEPT: Creating a file is like putting a toy in a box.");
        _addOutputLine("EXPLAIN: The 'touch' command creates a brand new file.");
        _addOutputLine("DEMO: Type 'touch badge.txt' to create a token.");
      } else {
        _addOutputLine("Try again. You must navigate using 'ls'.");
      }
    } else if (_currentStep == 'level2') {
      if (value.startsWith('touch ')) {
        _addOutputLine("File created: ${value.split(' ')[1]}");
        _addSystemLine("SUCCESS! Level 2 Complete.");
        _addSystemLine("\nMISSION COMPLETE, CAPTAIN ${_userName.toUpperCase()}!");
        _addOutputLine("You have mastered basic terminal navigation and creation.");
        _currentStep = 'finished';
      } else {
        _addOutputLine("Try again. Use 'touch [filename]'.");
      }
    } else {
      _addOutputLine("Command unknown: $value");
    }
    
    _focusNode.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: Colors.black,
          border: Border.all(color: const Color(0xFF00FF00).withOpacity(0.1), width: 10),
        ),
        child: Stack(
          children: [
            // Scan lines effect
            Positioned.fill(
              child: Opacity(
                opacity: 0.05,
                child: Column(
                  children: List.generate(100, (i) => Container(
                    height: 2,
                    color: i % 2 == 0 ? Colors.green : Colors.transparent,
                  )),
                ),
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  child: ListView.builder(
                    controller: _scrollController,
                    itemCount: _history.length,
                    itemBuilder: (context, index) {
                      final line = _history[index];
                      Color textColor;
                      String prefix = "";
                      
                      switch (line.type) {
                        case LineType.input:
                          textColor = Colors.white;
                          prefix = "\$ ";
                          break;
                        case LineType.output:
                          textColor = const Color(0xFF00FF00);
                          break;
                        case LineType.system:
                          textColor = Colors.amber;
                          break;
                        case LineType.error:
                          textColor = Colors.redAccent;
                          break;
                      }

                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2),
                        child: Text(
                          "$prefix${line.text}",
                          style: TextStyle(
                            color: textColor,
                            fontSize: 14,
                            shadows: [
                              Shadow(color: textColor.withOpacity(0.5), blurRadius: 8)
                            ],
                          ),
                        ),
                      ).animate().fadeIn(duration: 200.ms);
                    },
                  ),
                ),
                Row(
                  children: [
                    const Text("\$ ", style: TextStyle(color: Colors.white, fontSize: 16)),
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        focusNode: _focusNode,
                        autofocus: true,
                        onSubmitted: _handleCommand,
                        style: const TextStyle(color: Colors.white, fontSize: 16),
                        cursorColor: Colors.white,
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(vertical: 8),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
