from supabase import create_client
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)



def upload_xray_to_db(temp_path, original_filename):

    # Uzantıyı al
    ext = os.path.splitext(original_filename)[1]

    # Güvenli yeni isim oluştur
    safe_name = str(uuid.uuid4()) + ext

    # Storage path (SADECE güvenli isim)
    storage_path = safe_name

    with open(temp_path, "rb") as f:
        content = f.read()

    supabase.storage.from_("xrays").upload(
        path=storage_path,
        file=content,
        file_options={"content_type": "image/png"}
    )

    return storage_path
    
def save_analysis_to_db(file_name:str,file_path:str,analysis:dict):
    data ={
        "file_name":file_name,
        "file_path":file_path,
        "analysis":analysis
    }    

    supabase.table("xray_analysis").insert(data).execute()
