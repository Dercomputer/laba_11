import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from src.logic.methods import get_all_messages, send, delete
from src.logic.authentication import login_user, register_user, change, is_admin

base_dir = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()


class User(BaseModel):
    username: str = "Guest"
    password: str | None = None


class ChangePasswordModel(BaseModel):
    username: str
    old_password: str
    new_password: str


class Message(BaseModel):
    username: str
    message: str


class DeletionRequest(BaseModel):
    deleter_username: str
    deleter_password: str
    target_message: str


static_dir_path = os.path.join(base_dir, "static")
app.mount("/static", StaticFiles(directory=static_dir_path), name="static")


@app.get("/")
async def root():
    html_path = os.path.join(base_dir, "static", "index.html")
    return FileResponse(html_path)


@app.get("/show")
async def show_message():
    messages = get_all_messages()
    return messages


@app.delete("/delete")
async def delete_message(request: DeletionRequest):
    is_admin_user = is_admin(request.deleter_username, request.deleter_password)
    result = delete(message_content=request.target_message, username=request.deleter_username, is_admin=is_admin_user)
    if result.get("status") == "denied":
        raise HTTPException(status_code=403, detail=result.get("message"))

    if result.get("status") != "deleted":
        raise HTTPException(status_code=400, detail=result.get("message"))

    return result


@app.patch("/change_password")
async def change_password(data: ChangePasswordModel):
    result = change(data.username, data.old_password, data.new_password)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result


@app.post("/register")
async def register(user: User):
    result = register_user(user.username, user.password)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@app.get("/login")
async def login(username: str = Query(..., alias="username"), password: str | None = Query(None, alias="password")):
    result = login_user(username, password)
    if not result.get("success"):
        raise HTTPException(status_code=401, detail=result.get("message"))
    return result

@app.post("/send")
async def send_message(message: Message):
    result = send(username=message.username, message_text=message.message)
    if result.get("status") == "denied":
        raise HTTPException(status_code=403, detail=result.get("message"))
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("message"))
    return {
        "username": message.username,
        "message": message.message,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
