import zmq
import sqlite3
import bcrypt
import json
from datetime import datetime
import os

DB_FILE = "users.db"

def initialize_db():
    connection = sqlite3.connect(DB_FILE)
    cursor = connection.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash BLOB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    connection.commit()
    connection.close()

def register(payload):
    username = payload.get('username')
    password = payload.get('password')
    if not username or not password:
        return {'success': False, 'error': 'Username and password required'}

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    try:
        cursor.execute(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            (username, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return {'success': True, 'message': 'User registered', 'user_id': user_id}
    except sqlite3.IntegrityError:
        conn.close()
        return {'success': False, 'error': 'Username already exists'}
    except Exception as e:
        conn.close()
        return {'success': False, 'error': str(e)}

def login(payload):
    username = payload.get('username')
    password = payload.get('password')
    if not username or not password:
        return {'success': False, 'error': 'Username and password required'}

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        'SELECT id, username, password_hash FROM users WHERE username = ?',
        (username,)
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {'success': False, 'error': 'Invalid username or password'}

    user_id, username, password_hash = row
    # password_hash is bytes; bcrypt.checkpw expects bytes
    if bcrypt.checkpw(password.encode('utf-8'), password_hash):
        return {'success': True, 'message': 'Logged in', 'user_id': user_id, 'username': username}
    else:
        return {'success': False, 'error': 'Invalid username or password'}

def main():
    initialize_db()
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    socket.bind("tcp://*:5555")
    print("Auth microservice listening on tcp://*:5555")
    while True:
        try:
            message = socket.recv_multipart()
            action = message[0].decode('utf-8')
            payload = json.loads(message[1].decode('utf-8'))
            if action == 'register':
                response = register(payload)
            elif action == 'login':
                response = login(payload)
            else:
                response = {'success': False, 'error': 'Unknown action'}
            socket.send_json(response)
        except Exception as e:
            socket.send_json({'success': False, 'error': str(e)})

if __name__ == "__main__":
    main()
