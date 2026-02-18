from fastapi import APIRouter, UploadFile, File, HTTPException
from ultralytics import YOLO
from typing import List
import os,shutil,uuid

router = APIRouter()
from app.db import supabase

class YOLOChooser:
    def __init__(self):
        base_path = os.path.dirname(__file__)

        model_path = os.path.join(base_path, "models", "classification.onnx")
        self.chooser_model = YOLO(model_path, task="classify")

     
        self.models = {  # model yollarını hazırlamakm için yapılan  python sözlüğüdür (dict:anahtar veri yapısıdır anahtar str olmalı)
            "spine":YOLO(os.path.join(base_path, "models/spine.pt")),
            "elbow":YOLO(os.path.join(base_path,"models/elbow.pt")),
            "Knee":YOLO(os.path.join(base_path,"models/knee.pt"))
        }

    def predict(self, image_path: str): # model  tahmin yapısıdır
        
        result = self.chooser_model(image_path)[0] # yüklediğimiz image ın pathini modele gönderir ve yolo bize liste yapısı şeklinde dönüt yapar bu listeden dönen ilk result sonucunu seçer içinden result.name ile anahtar kısmını buçuruz
        
         
        
        probs= result.probs.data.tolist() #tüm olasılıklarıu listekler
        names = result.names #class isimleri sözlüğü
     
        class_id=result.probs.top1
        top1_name = names[class_id]

    
        indexed_probs = list(enumerate(probs)) #olasılıkları indexleri ile birlikte listeler
        sorted_probs = sorted(indexed_probs,key=lambda x: x[1],reverse=True) # result.props.top1 ile modelin en yüksek güvenle tahmin ettiği sınıfın id sini alırız bu id yi int e çeviririz çünkü id genellikle int olur
#x bir tuppledır 1,0098 gibi x[0] indexi id yi x[1] ise olasılığı temsil eder sorted fonksiyonu ile bu listeyi olasılığa göre azalan sırada sıralarız
        top5 =sorted_probs[:5]

        top5_results=[
             {
                  "class_id":idx,
                  "class name": names[idx],
                  "confidence": prob
             }
             for idx, prob in top5
        ]
        
        # yolo bir liste döndürür list=result0,result1,result2 gibi
        #result ise bir nesne yapısıdır

        # result {
        # boxes : modelin görselde bulduğu nesneler
        # names :sınıf isimleri dicti tek sonuç değil yönlendirme için sınıf_ıd=anahtar kelimedir, 0:ancle 1:chest gibi
        # orig_img  : orijinal görüntü
        # path : image yolu
        # tojson() : sonuç dict yapısı geri dönüş için uygun yapı 
        #{
        # "name": "fracture",
        # "class": 1,
        # "confidence": 0.92,
        # "box": {
        #   "x1": 120,
        #   "y1": 80,
        #   "x2": 340,
        #   "y2": 260
        # }
        # plot
        #       }

        return {
             "top5_predictions": top5_results,
             "top1":top1_name
               }

                    

chooser = YOLOChooser()

def routing (top1_name,image_path):
     if top1_name == "Knee":
         return knee(image_path)
 
     return "Bu bölge için henüz bir analiz modeli bulunmamaktadır"

def knee(image_path):
     model=chooser.models["Knee"]
     result=model(image_path)[0]

     degree = result.probs.top1
     confidence = result.probs.top1conf

     return {f"%{confidence*100} ile {degree} derece kireçlenme tespi edildi"}

@router.post("/detect/")
async def detect_xray(files: List[UploadFile] = File(...)):

        os.makedirs("temp",exist_ok=True)
        results =[]
    
        for file in files:
             
             #geçici dosya yolu oluştur
             ext=os.path.splitext(file.filename)[1]
             temp_filename = f"{uuid.uuid4()}{ext}"
             temp_path=os.path.join("temp",temp_filename)

             #diske kaydetme
             with open(temp_path,"wb") as buffer :
                  shutil.copyfileobj(file.file,buffer)
             #AI pipeline çalıştır

             result = chooser.predict(temp_path)
             top1_name=result["top1"]   #resulttan döndürülen dict formatından  sadece top1 ı çekmek için oluşturulan liste
             analysis = routing(top1_name,temp_path)



             #dosya adı ile birlikte kaydet
             results.append({
                  "file":file.filename,
                  "result":result,
                  "analysis":analysis
             })
        return {
             "total_files":len(results),
             "results":results
        }
 