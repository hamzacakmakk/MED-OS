from fastapi import FastAPI
from app.auth import router as auth_router
from app.yolo_choser import router as yolo_choser_router

app=FastAPI()
from app.db import supabase

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(yolo_choser_router, prefix="/yolo", tags=["Yolo choser"])

@app.get("/")
def read_root():
    return {"message":"Welcome the main function"}