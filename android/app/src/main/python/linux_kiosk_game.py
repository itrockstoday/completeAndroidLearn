import os
import time
import requests

def clear_screen():
    os.system('clear')

def type_effect(text, delay=0.01):
    for char in text:
        print(char, end='', flush=True)
        time.sleep(delay)
    print()

def is_clean_name(name):
    try:
        url = f"https://www.purgomalum.com/service/containsprofanity?text={name}"
        response = requests.get(url, timeout=5)
        return response.text == "false"
    except:
        return True # Fallback if offline

def get_valid_name():
    while True:
        print("\n=== SS ALPINE LOGIN ===")
        name = input("Identify yourself, Explorer: ").strip()
        if not name:
            continue
        if is_clean_name(name):
            return name
        print(">>> [SECURITY ALERT] Name rejected. Use polite language.")

def play_game():
    name = get_valid_name()
    unlocked_resume_points = []
    
    levels = [
        {
            "title": "The Magic Map (Navigation)",
            "concept": "Directories",
            "analogy": "The computer is a Giant Tree. Folders are Branches.",
            "explain": "We use 'ls' to see what is on our branch.",
            "demo": "Type 'ls' to look around.",
            "imitate": "ls",
            "resume": "Proficient in Directory Navigation and File System Hierarchy Management."
        },
        {
            "title": "The Toy Box (File Creation)",
            "concept": "Files",
            "analogy": "Creating a file is like putting a toy in a box.",
            "explain": "The 'touch' command creates a brand new file instantly.",
            "demo": "Type 'touch explorer.txt' to create a badge.",
            "imitate": "touch",
            "resume": "Expertise in Data Lifecycle Management and File System Operations."
        },
        {
            "title": "Simon Says (Permissions)",
            "concept": "Sudo",
            "analogy": "The Guard only lets you through if Simon (Sudo) says it is okay.",
            "explain": "'sudo' gives you SuperUser powers for restricted areas.",
            "demo": "Type 'sudo' to show your Master Key.",
            "imitate": "sudo",
            "resume": "Advanced Administrative Privilege Escalation and System Security Protocols."
        }
    ]

    for i, lvl in enumerate(levels, 1):
        clear_screen()
        print(f"--- LEVEL {i}: {lvl['title']} ---")
        print(f"EXPLAIN: {lvl['analogy']}")
        print(f"LESSON: {lvl['explain']}")
        print(f"\nDEMONSTRATE: {lvl['demo']}")
        
        while True:
            action = input(f"\n[IMITATE & PRACTICE] {name}, type the command: ").strip()
            if lvl['imitate'] in action.lower():
                print(f"\nSUCCESS! Level {i} Complete.")
                unlocked_resume_points.append(lvl['resume'])
                time.sleep(1)
                break
            else:
                print("Try again! Follow the demonstration.")

    # END OF GAME SUMMARY
    clear_screen()
    print("========================================")
    print(f"MISSION COMPLETE, CAPTAIN {name.upper()}!")
    print("========================================")
    print("\nYOUR NEW PROFESSIONAL RESUME ENTRIES:")
    for point in unlocked_resume_points:
        print(f"- {point}")
    
    print("\n" + "="*40)
    input("Press Enter to return to the Start Screen...")

if __name__ == "__main__":
    while True:
        try:
            play_game()
        except KeyboardInterrupt:
            # This prevents Ctrl+C from closing the game
            print("\n\n[SYSTEM] Emergency Exit Blocked. Restarting Mission...")
            time.sleep(2)
            continue
