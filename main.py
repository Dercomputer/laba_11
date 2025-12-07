import sqlite3

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    name: str = "Guest"
    password: str = None



@app.get("/")
async def root():
    return {1: 2}


@app.get("/show")
async def show_message():
    ...


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
