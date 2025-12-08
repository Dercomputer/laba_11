import sqlite3


def change(username: str, old_password: str, new_password: str):
    try:
        conn = sqlite3.connect("messages.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE login = ? AND password = ?", (username, old_password))
        user = cursor.fetchone()
        if not user:
            return {"success": False, "message": "Invalid old password or username"}

        cursor.execute("UPDATE users SET password = ? WHERE login = ?", (new_password, username))
        conn.commit()
        return {"success": True, "message": "Password changed"}

    except sqlite3.Error:
        return {"success": False, "message": "Database error"}
    finally:
        conn.close()


def login_user(username: str, password: str):
    try:
        conn = sqlite3.connect("messages.db")
        cursor = conn.cursor()

        cursor.execute("SELECT password FROM users WHERE login = ?", (username,))
        user_record = cursor.fetchone()

        if not user_record:
            return {"success": False, "message": "Login not found"}

        db_password = user_record[0]

        if db_password == password:
            return {"success": True, "message": "Login successful"}
        else:
            return {"success": False, "message": "Invalid password"}

    except sqlite3.Error:
        return {"success": False, "message": "Database error"}
    finally:
        conn.close()


def register_user(username: str, password: str):
    if not username or not password:
        return {"success": False, "message": "Empty fields"}
    try:
        conn = sqlite3.connect("messages.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (login, password) VALUES (?, ?)", (username, password))
        conn.commit()
        return {"success": True, "message": "User registered"}
    except sqlite3.IntegrityError:
        return {"success": False, "message": "User already exists"}
    except sqlite3.Error as e:
        print(e)
        return {"success": False, "message": "Database error"}
    finally:
        conn.close()


def is_admin(username: str, password: str):
    if username == "admin":
        result = login_user(username, password)
        return result.get("success", False)
    return False
