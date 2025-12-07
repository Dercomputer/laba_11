from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from logic.methods import get_all_messages

app = FastAPI()


class User(BaseModel):
    name: str = "Guest"
    password: str | None = None


app.mount("/static", StaticFiles(directory="static"), name="static")
@app.get("/")
async def root():
    user = User()

    return FileResponse("static/index.html")


@app.get("/show")
async def show_message():
    get_all_messages()


@app.delete("/delete")
async def delete_message():
    ...


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
async def send_message():
    ...



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
