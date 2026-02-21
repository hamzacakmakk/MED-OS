from fastapi import APIRouter, HTTPException
import os
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# IMPORTANT: Ensure GEMINI_API_KEY is set in your .env file
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

from google import genai
try:
    client = genai.Client(api_key=api_key) if api_key else genai.Client()
except Exception as e:
    client = None
    print(f"Failed to initialize Gemini Client: {e}")

class ReportRequest(BaseModel):
    yolo_findings: List[str]
    blood_test_anomalies: List[str]
    patient_info: Optional[str] = "Bilinmiyor"

class ReportResponse(BaseModel):
    report_text: str

@router.post("/generate-report", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    if not client:
         raise HTTPException(status_code=500, detail="Gemini client is not initialized. Check your API key.")

    try:
        findings_text = ", ".join(request.yolo_findings) if request.yolo_findings else "Bulgu yok"
        anomalies_text = ", ".join(request.blood_test_anomalies) if request.blood_test_anomalies else "Anomali yok"

        prompt = f"""
        Sen uzman bir Türk doktorusun. Aşağıdaki bilgileri kullanarak SGK (Sosyal Güvenlik Kurumu) formatına ve 
        resmi tıbbi muayene raporu (Epikriz ve Anamnez) standartlarına uygun, kısa, öz ve profesyonel bir sonuç raporu oluştur.
        
        Hasta Bilgisi: {request.patient_info}
        Röntgen/Görüntüleme Bulguları (YOLO Modelinden): {findings_text}
        Kan Tahlili Anomalileri: {anomalies_text}
        
        Lütfen raporu şu başlıklara göre düzenle:
        - ŞİKAYET VE ANAMNEZ
        - FİZİK VE RADYOLOJİK MUAYENE BULGULARI
        - LABORATUVAR BULGULARI
        - TANI VE KARAR (Epikriz)
        
        Gereksiz uzatmalardan kaçın, hekimin hızlıca okuyup "Onayla" diyebileceği netlikte tıbbi bir dil kullan.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        return ReportResponse(report_text=response.text)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Rapor oluşturulurken bir hata oluştu: {str(e)}")
