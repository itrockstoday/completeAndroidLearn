import os
import time
import re
import json

# Correct 2026 path for Android Internal Storage
# This ensures your save game persists even if the app is closed
SAVE_FILE = os.path.join(os.environ.get("HOME", "."), ".alpine_player_profile.json")

# Offline Mock Profanity Filter (Requirement 5)
LOCAL_MOCK_FILTER = ["damn", "hell", "stupid", "idiot"] # Simplified for demo

def save_game(data):
    try:
        with open(SAVE_FILE, 'w') as f:
            json.dump(data, f)
    except Exception as e:
        print(f">>> [SYSTEM ERROR] Persistence failed: {e}")

def load_game():
    if os.path.exists(SAVE_FILE):
        try:
            with open(SAVE_FILE, 'r') as f:
                return json.load(f)
        except:
            return None
    return None

def clear_screen():
    print("\033[H\033[J", end="")

def is_clean_name(name):
    # Try the real API first
    try:
        import requests
        url = f"https://www.purgomalum.com/service/containsprofanity?text={name}"
        response = requests.get(url, timeout=2)
        return response.text == "false"
    except:
        # Fallback to local mock filter for offline support
        pattern = re.compile("|".join(LOCAL_MOCK_FILTER), re.IGNORECASE)
        return not bool(pattern.search(name))

def get_valid_name():
    while True:
        print("\n=== SS ALPINE LOGIN ===")
        print("SYSTEM_STATUS: CHAQUOPY_BRIDGE_V17_LOADED")
        name = input("Identify yourself, Explorer: ").strip()
        if not name:
            continue
        if is_clean_name(name):
            return name
        print(">>> [SECURITY ALERT] Name rejected. Local filters detected restricted language.")

def play_game():
    profile = load_game()
    
    if profile:
        print(f"\n>>> [ENCRYPTED STORAGE DETECTED]")
        print(f">>> WELCOME BACK, {profile['name'].upper()}")
        use_save = input("Restore session? (y/n): ").lower().strip()
        if use_save == 'y':
            name = profile['name']
            unlocked_resume_points = profile.get('resume_points', [])
            print("Session restored. Resuming mission...")
            time.sleep(1)
        else:
            name = get_valid_name()
            unlocked_resume_points = []
    else:
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

    # SUMMARY
    clear_screen()
    print("========================================")
    print(f"MISSION COMPLETE, CAPTAIN {name.upper()}!")
    print("========================================")
    print("\nRESUME CACHE UPDATED.")
    for point in unlocked_resume_points:
        print(f"- {point}")
    
    # Persist the mission results
    save_game({
        "name": name,
        "resume_points": unlocked_resume_points,
        "last_played": time.time()
    })
    
    print("\n" + "="*40)
    input("Press Enter to return to the system...")

if __name__ == "__main__":
    play_game()
