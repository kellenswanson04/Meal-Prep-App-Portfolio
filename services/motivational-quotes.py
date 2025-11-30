import zmq
import random

context = zmq.Context()
socket = context.socket(zmq.REP)
socket.bind("tcp://*:5557")  # <-- UPDATED PORT

with open("Music.txt", 'r') as f: musicQuotes = f.readlines()
with open("Pets.txt", 'r') as f: petsQuotes = f.readlines()
with open("School.txt", 'r') as f: schoolQuotes = f.readlines()
with open("Sports.txt", 'r') as f: sportsQuotes = f.readlines()
with open("Games.txt", 'r') as f: gamesQuotes = f.readlines()

def Get_Quote(category):
    category = category.lower() if category else ""
    if category in ("music", "0"):
        quotes = musicQuotes
    elif category in ("pets", "1"):
        quotes = petsQuotes
    elif category in ("school", "2"):
        quotes = schoolQuotes
    elif category in ("sports", "3"):
        quotes = sportsQuotes
    elif category in ("video games", "4", "games"):
        quotes = gamesQuotes
    else:
        # random category
        quotes = random.choice([musicQuotes, petsQuotes, schoolQuotes, sportsQuotes, gamesQuotes])
    return random.choice(quotes).strip()

def Get_Quotes(quantity, category):
    return [Get_Quote(category) for _ in range(int(quantity))]

print("Quotes microservice running on tcp://*:5557")

while True:
    try:
        message = socket.recv()
        text = message.decode().strip()
        print(f"Received message: {text}")
        
        # Split by space, but handle "video games" as a special case
        parts = text.split()
        if len(parts) == 0:
            quantity = 1
            category = ""
        elif len(parts) == 1:
            quantity = parts[0]
            category = ""
        else:
            quantity = parts[0]
            # Check if it's "video games" (parts[1] and parts[2] together)
            if len(parts) >= 3 and parts[1].lower() == "video" and parts[2].lower() == "games":
                category = "video games"
            else:
                category = parts[1]

        quotes = Get_Quotes(quantity, category)
        print(f"Generated {len(quotes)} quotes for category '{category}': {quotes}")
        socket.send_json(quotes)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        socket.send_json({"error": str(e)})
