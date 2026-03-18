from fastapi import APIRouter, HTTPException
import os
from pydantic import BaseModel
from typing import List, Optional
from google import genai

router = APIRouter()

from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

import google.generativeai as genai
try:
    if api_key:
        genai.configure(api_key=api_key)
        client = True
    else:
        client = False
except Exception as e:
    client = False
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
        
        DİKKAT EDİLECEK KURALLAR (Anti-Hallucination & Format):
        1. KESİNLİKLE HAYALİ BİLGİ UYDURMA. Hastanın şikayeti, yaşı, cinsiyeti veya travma öyküsü sana iletilmediyse uydurma.
        2. Sana verilmeyen tüm durumlar için "Bilinmiyor", "Sağlanmadı" veya "Bulgu yok" ifadelerini kullan.
        3. Eğer 'Kan Tahlili Anomalileri' kısmında veri yoksa, "Laboratuvar bulgusu yüklenmedi" veya "Anomali yok" yaz.
        4. HİÇBİR ŞEKİLDE markdown formatı KULLANMA. Metin içindeki kalınlaştırmalar için yıldız (*) sembollerini kullanma, tamamen düz metin olsun.
        5. YOLO bulgularında gelen etiketler (labels), sınıflar (classes) ve olasılık yüzdelerini o hastalığın tıbbi terminolojisine (Örn: kırık, dejenerasyon, tümör, osteoartrit vb.) uygun olarak yorumla. Sadece elindeki etiketlerin ne anlama geldiğini kendi tıbbi bilginle klinik bir bulguya çevir; başka hastalık uydurma.

        GELEN VERİLER:
        - Hasta Bilgisi: {request.patient_info}
        - Röntgen/Görüntüleme Bulguları (YOLO Modelinden): {findings_text}
        - Kan Tahlili Anomalileri: {anomalies_text}
        
        Lütfen raporu şu başlıklara göre düzenle (başlıkları BÜYÜK HARFLE ve markdown kullanmadan düz metin olarak yaz):
        ŞİKAYET VE ANAMNEZ
        FİZİK VE RADYOLOJİK MUAYENE BULGULARI
        LABORATUVAR BULGULARI
        TANI VE KARAR (Epikriz)
        
        Gereksiz uzatmalardan kaçın, hekimin hızlıca okuyup "Onayla" diyebileceği netlikte düz metin (plain text) bir dil kullan.
        """

        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        return ReportResponse(report_text=response.text)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Rapor oluşturulurken bir hata oluştu: {str(e)}")
