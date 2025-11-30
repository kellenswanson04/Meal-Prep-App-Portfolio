# data_saver.py
import zmq
import json
import os
from datetime import datetime

DATA_FILE = "data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if not content:
                    return []
                return json.loads(content)
        except json.JSONDecodeError:
            return []
    return []

def save_to_file(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def main():
    saved_data = load_data()
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    socket.bind("tcp://*:5556")
    print("Data saver microservice listening on tcp://*:5556")

    while True:
        try:
            raw = socket.recv().decode('utf-8')
            request = json.loads(raw)
            action = request.get("action")

            if action == "save":
                user_id = request.get("user_id")
                item = request.get("data")
                entry = {"user_id": user_id, "data": item, "ts": datetime.utcnow().isoformat()}
                saved_data.append(entry)
                save_to_file(saved_data)
                socket.send_string("OK: saved")

            elif action == "get_all":
                user_id = request.get("user_id")
                user_items = [e["data"] for e in saved_data if e.get("user_id") == user_id]
                socket.send_string(json.dumps(user_items))

            elif action == "delete":
                user_id = request.get("user_id")
                index = request.get("index")
                # collect all indices for this user's items
                indices = [i for i, e in enumerate(saved_data) if e.get("user_id") == user_id]
                if index < 0 or index >= len(indices):
                    socket.send_string("ERROR: invalid index")
                else:
                    # actual position in saved_data
                    pos = indices[index]
                    deleted = saved_data.pop(pos)
                    save_to_file(saved_data)
                    socket.send_string(f"OK: deleted {deleted.get('data')}")

            else:
                socket.send_string("ERROR: unknown action")

        except Exception as e:
            socket.send_string(f"ERROR: {str(e)}")

if __name__ == "__main__":
    main()