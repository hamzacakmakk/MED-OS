from fastapi import FastAPI
from app.auth import router as auth_router
from app.yolo_choser import router as yolo_choser_router

app=FastAPI()
from app.db import supabase
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(yolo_choser_router, prefix="/yolo", tags=["Yolo choser"])

@app.get("/")
def read_root():
    return {"message":"Welcome the main function"}