from fastapi import APIRouter,Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from datetime import datetime,timedelta
from jose import JWTError,jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

from app.db import supabase

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

router=APIRouter()

class Token(BaseModel):
    acces_token :str
    token_type :str                                           

class TokenData(BaseModel):
    username:str 

class User(BaseModel):
     username: str 
     email:EmailStr or None = None
     full_name:str or None = None                                                              
class UserInDB(User):
    hashed_password:str      
        

pwd_contex = CryptContext(schemes=["bcrypt"],deprecated="auto")
oauth_2_sheme = OAuth2PasswordBearer(tokenUrl="token") 

def verify_password(plain_password,hashed_password):
    return pwd_contex.verify(plain_password,hashed_password)
 

def get_password_hash(password): 
    return pwd_contex.hash(password)

def get_user(db,username:str):
    if username in db:
        user_data =db[username]
        return UserInDB(**user_data)

