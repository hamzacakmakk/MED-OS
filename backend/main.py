import os
import shutil
import random
import time
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Teknofestsel Backendsel Denemesel", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "yuklenen_rontgenler"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class AnalizSonucu(BaseModel):
    dosya_adi: str
    skolyoz_derecesi: float
    durum: str     
    mesaj: str
    islem_suresi: float 


def yapay_zeka_taklidi_yap(dosya_yolu: str):
    time.sleep(2) 
    
    
    analiz_derecesi = round(random.uniform(0.0, 25.0), 2) 
    msu_siniri = 10.0 
    
    if analiz_derecesi <= msu_siniri:
        return {
            "derece": analiz_derecesi,
            "durum": "GEÇER",
            "mesaj": f"Sorun yok. Derece ({analiz_derecesi}°) TSK standartlarına uygundur."
        }
    else:
        return {
            "derece": analiz_derecesi,
            "durum": "KALIR",
            "mesaj": f"Riskli! Derece ({analiz_derecesi}°) belirlenen sınırın ({msu_siniri}°) üzerindedir."
        }


@app.get("/")
def root():
    return {"Durum": "Sistem Aktif", "Versiyon": "1.0"}

@app.post("/analiz-et", response_model=AnalizSonucu)
async def dosya_yukle_ve_analiz_et(file: UploadFile = File(...)):
    baslangic_zamani = time.time()
    
    dosya_yolu = os.path.join(UPLOAD_DIR, file.filename)
    with open(dosya_yolu, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    ai_sonucu = yapay_zeka_taklidi_yap(dosya_yolu)
    
    bitis_zamani = time.time()
    
    
    return AnalizSonucu(
        dosya_adi=file.filename,
        skolyoz_derecesi=ai_sonucu["derece"],
        durum=ai_sonucu["durum"],
        mesaj=ai_sonucu["mesaj"],
        islem_suresi=round(bitis_zamani - baslangic_zamani, 2)
    )