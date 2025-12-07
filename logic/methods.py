import sqlite3

def get_all_messages():
    conn = sqlite3.connect("messages.db")
    cursor = conn.cursor()
    result = cursor.execute("SELECT message from messages")
    conn.close()

