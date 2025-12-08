import sqlite3

def get_all_messages():
    try:
        conn = sqlite3.connect("messages.db")
        cursor = conn.cursor()
        result = cursor.execute("SELECT username, message from messages")
        dicts_result = [{"name": value[1], "message": value[2]} for value in result]
        return dicts_result
    except sqlite3.Error:
        return []
    finally:
        conn.close()

def send(username: str):
    ...

def delete(username: str):
    if username == "Guest":
        return