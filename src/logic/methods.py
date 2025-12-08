import sqlite3


def get_all_messages():
    try:
        conn = sqlite3.connect("messages.db")
        cursor = conn.cursor()
        result = cursor.execute("SELECT username, message from messages")
        dicts_result = [{"name": value[0], "message": value[1]} for value in result]
        return dicts_result
    except sqlite3.Error:
        return []
    finally:
        conn.close()


def send(username: str, message_text: str):
    if username == "Guest":
        return {"status": "denied", "message": "Гости не могут писать сообщения"}

    try:
        conn = sqlite3.connect("messages.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO messages (username, message) VALUES (?, ?)", (username, message_text))
        conn.commit()
        return {"status": "ok", "message": "Message sent"}
    except sqlite3.Error:
        return {"status": "error", "message": "Database error"}
    finally:
        conn.close()


def delete(message_content: str, username: str, is_admin: bool):
    if username == "Guest":
        return {"status": "denied", "message": "Гости не могут удалять сообщения"}

    try:
        conn = sqlite3.connect("messages.db")
        cursor = conn.cursor()
        if is_admin:
            cursor.execute("DELETE FROM messages WHERE message = ?", (message_content,))
        else:
            cursor.execute("DELETE FROM messages WHERE username = ? AND message = ?", (username, message_content))
        conn.commit()
        return {"status": "deleted", "count": cursor.rowcount}
    except sqlite3.Error:
        return {"status": "error", "message": "Database error during deletion"}
    finally:
        conn.close()
