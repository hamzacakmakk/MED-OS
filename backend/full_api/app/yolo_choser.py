from fastapi import APIRouter, UploadFile, File, HTTPException
from ultralytics import YOLO
from typing import List
import os,shutil,uuid
import math



from app.celery_app import celery
from celery.result import AsyncResult



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
            "Knee":YOLO(os.path.join(base_path,"models/knee.pt")),
            "chest":YOLO(os.path.join(base_path,"models/chest.pt")),
            "skull":YOLO(os.path.join(base_path,"models/skull.pt"))
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
     if top1_name=="Chest":
         return chest(image_path)
     if top1_name=="Spine":
         return spine(image_path)
     if top1_name=="Skull":
         return skull(image_path)
 
     return {"analysis": "Bu bölge için henüz bir analiz modeli bulunmamaktadır"}

def knee(image_path):
     model=chooser.models["Knee"]
     result=model(image_path)[0]

     degree = result.probs.top1
     confidence = result.probs.top1conf

     return {"analysis": f"%{confidence*100} ile {degree} derece kireçlenme tespi edildi"}


def skull(image_path):
    model=chooser.models["skull"]
    result=model(image_path)[0]

    detected_disases=[]

    for box in result.boxes:
        class_id=int(box.cls[0].item())
        confidence=box.conf[0].item()
        disase_name=result.names[class_id]
        cordinates=box.xyxy[0].tolist()

        class_names=result.names
        
        detected_disases.append({
            "disase_name": disase_name,
            "confidence": confidence,
            "cordinates": cordinates
     })   
    if len(detected_disases)==0:
     return {"analysis":"kafatası grafisinde herhangi bir hastalık bulunamadı"}  

    return{"analysis":f"toplam{len(detected_disases)}hastalık tespit edildi",
           "detected_disases":detected_disases,
           "class_names":class_names         
             }
          
        
def chest(image_path):
    model=chooser.models["chest"]
    result=model(image_path)[0]

    detected_disase=[]
 
    for box in result.boxes:
        class_id=int(box.cls[0].item()) #boxun  cls ile sınıfı id sini al ve o tek sayılı araydan normal sayı oılarak çekmek için[0] yaz ardından .item fonksiyonunile pythondaki bir sayıya çevir
        confidence=box.conf[0].item() #güven aralığını alıyoruz   
        disase_name=result.names[class_id] #sınıf adını sözlükten alıyoruz
        cordinates=box.xyxy[0].tolist() #boxun kordinatlarını alma (bulunann hastalık kordinatları frobntenddde kulanılacaksa)   
        detected_disase.append({
            "disase_name": disase_name,
            "confidence":confidence ,
            "cordinates": cordinates
           })
    if len(detected_disase)==0:
     return {"analysis":"göğüs grafisinde herhangi bir hastalık bulunamadı"}
        
    return {"analysis": f"toplam {len(detected_disase)} hastalık tespit edildi",
          "detected_disase":detected_disase}

def spine(image_path):
     model=chooser.models["spine"]
     result=model(image_path)[0]
     
     if len(result.boxes) == 0:
        return {"analysis_result": "Omurga yapısı tespit edilemedi.", "findings": []}

     centers = []

    # 1. Tüm kutuların merkez noktalarını (X ve Y) bul
     for box in result.boxes:
        # xyxy formatı: [x_min, y_min, x_max, y_max]
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        
        center_x = (x1 + x2) / 2
        center_y = (y1 + y2) / 2
        
        confidence = float(box.conf[0].item())
        
        centers.append({
            "cx": center_x,
            "cy": center_y,
            "conf": confidence,
            "box": [x1, y1, x2, y2]
        })

    # Skolyoz ölçümü için en az 3 omur tespit edilmiş olmalı
     if len(centers) < 3:
          return {"analysis_result": "Cobb açısı hesaplamak için yeterli omur tespit edilemedi (En az 3 omur gerekli).", "findings": centers}     
     # 2. Omurları Y eksenine (yukarıdan aşağıya) göre sırala
     centers = sorted(centers, key=lambda p: p["cy"])     
     # 3. Eğriliği Hesaplama (En basit yaklaşımla: Üst, Orta(Apex) ve Alt noktalar)
     # En üstteki omur
     top_vertebra = centers[0]
     # En alttaki omur
     bottom_vertebra = centers[-1]
     
     # Eğriliğin en tepe noktasını (Apex - merkezden en çok sapan omur) bulma
     # Basitçe ortadaki omuru apex olarak kabul edebiliriz
     mid_index = len(centers) // 2
     apex_vertebra = centers[mid_index]     
     # Üst omur ile Apex arasındaki doğrunun açısı
     dx1 = apex_vertebra["cx"] - top_vertebra["cx"]
     dy1 = apex_vertebra["cy"] - top_vertebra["cy"]
     angle1 = math.degrees(math.atan2(dy1, dx1))     
     # Apex ile Alt omur arasındaki doğrunun açısı
     dx2 = bottom_vertebra["cx"] - apex_vertebra["cx"]
     dy2 = bottom_vertebra["cy"] - apex_vertebra["cy"]
     angle2 = math.degrees(math.atan2(dy2, dx2))     
     # Cobb Açısı Yaklaşımı: İki doğrunun açıları arasındaki fark
     # Mutlak değer alıp, dar açıyı buluyoruz.
     cobb_angle = abs(angle1 - angle2)
     if cobb_angle > 180:
        cobb_angle = 360 - cobb_angle
    
    # Eğer açı 90'dan büyükse tamamlayıcısını al (Cobb açısı dar açıdır)
     if cobb_angle > 90:
        cobb_angle = 180 - cobb_angle

     cobb_angle = round(cobb_angle, 2)

    # 4. Tıbbi Karar Mekanizması (Skolyoz Derecelendirmesi)
     decision = ""
     if cobb_angle < 10:
        decision = "Normal omurga hizalanması (Skolyoz bulgusu yok veya sadece postüral asimetri)."
     elif 10 <= cobb_angle < 20:
         decision = "Hafif derece skolyoz. Genellikle sadece gözlem ve düzenli kontrol önerilir."
     elif 20 <= cobb_angle < 40:
         decision = "Orta derece skolyoz. Korse tedavisi veya fizik tedavi değerlendirilebilir."
     else:
         decision = "İleri derece skolyoz. Cerrahi müdahale açısından ortopedi uzmanı değerlendirmesi gereklidir."
     
     return {
        "analysis": f"Cobb Açısı: {cobb_angle}° - {decision}",
        "cobb_angle_degree": cobb_angle,
        "details": {
            "top_point": {"x": top_vertebra["cx"], "y": top_vertebra["cy"]},
            "apex_point": {"x": apex_vertebra["cx"], "y": apex_vertebra["cy"]},
            "bottom_point": {"x": bottom_vertebra["cx"], "y": bottom_vertebra["cy"]}
        },
        "detected_vertebrae_count": len(centers)
    }
     




@router.post("/detect/")
async def detect_xray(files: List[UploadFile] = File(...)):
    from app.tasks import full_task

    os.makedirs("temp", exist_ok=True)

    tasks = []

    for file in files:

        ext = os.path.splitext(file.filename)[1]
        temp_filename = f"{uuid.uuid4()}{ext}"
        temp_path = os.path.join("temp", temp_filename)

    
        with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

        #celery task başlama kısmı
        task=full_task.delay(temp_path,file.filename)

        tasks.append({
                "file":file.filename,
                "task_id":task.id
            })
        
    return {
        "message":"analysis started",
            "tasks":tasks 
                  }

@router.get("/task/{task_id}")
def get_task_status(task_id:str):
    
    task = AsyncResult(task_id,app=celery)

    return{
        "task_id":task_id,
        "ststus":task.status,
        "result":task.result
    }            
           


           