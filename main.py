import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from src.logic.methods import get_all_messages, send, delete

base_dir = os.path.dirname(os.path.abspath(__file__))


app = FastAPI()


class User(BaseModel):
    name: str = "Guest"
    password: str | None = None


class MessageOut(BaseModel):
    username: str
    message: str

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
async def delete_message(user: User):
    result = delete(user.name)
    return result


@app.patch("/change_password")
async def change_password():
    ...


@app.post("/register")
async def register():
    ...


@app.get("/login")
async def login():
    ...


@app.post("/send")
async def send_message(user: User):
    result = send(username=user.name)
    return result

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
