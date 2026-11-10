from fastapi import APIRouter, UploadFile, File, HTTPException
from ultralytics import YOLO
from typing import List
import os,shutil,uuid
import math



from app.celery_app import celery
from celery.result import AsyncResult



router = APIRouter()
from app.db import supabase
from app.spine_metrics import analyze_spine

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

     degree = int(result.probs.top1)
     confidence = float(result.probs.top1conf)
     label = str(result.names.get(degree, degree))

     return {
        "analysis": f"%{confidence*100:.1f} güvenle {label} derece kireçlenme tespit edildi",
        "kl_grade": degree,
        "grade_label": label,
        "confidence": confidence
    }


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
     # each vertebra: ([x1, y1, x2, y2], confidence); the Cobb math lives in spine_metrics
     detections=[(box.xyxy[0].tolist(), float(box.conf[0].item())) for box in result.boxes]
     return analyze_spine(detections)


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
        "status":task.status,
        "ststus":task.status,  # kept for older clients
        "result":task.result
    }            
           


           