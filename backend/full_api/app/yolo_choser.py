from fastapi import APIRouter, UploadFile, File, HTTPException
from ultralytics import YOLO
import os,shutil,uuid

router = APIRouter()
from app.db import supabase

class YOLOChooser:
    def __init__(self):
        base_path = os.path.dirname(__file__)

        self.chooser_model = YOLO(os.path.join(base_path, "models/chooser.pt"))

     
        self.models = {
            "ankle": YOLO(os.path.join(base_path, "models/ankle.pt")),
            "chest": YOLO(os.path.join(base_path, "models/chest.pt")),
            "hand": YOLO(os.path.join(base_path, "models/hand.pt")),
        }

    def predict(self, image_path: str):
        
        result = self.chooser_model(image_path)[0]
        class_id = int(result.boxes.cls[0])
        class_name = ultres.names[class_id]

     
        model = self.models.get(class_name)
        if model is None:
            raise HTTPException(status_code=400, detail=f"Bu tür için model yok: {class_name}")

       
        detection_result = model(image_path)

        return {
            "type": class_name,
            "detections": detection_result[0].tojson()
        }
    

                        

chooser = YOLOChooser()

@router.post("/detect/")
async def detect_xray(file: UploadFile = File(...)):

        ext = os.path.splitext(file.filename)[1]
        
        temp_filename=f"{uuid.uuid4()}{ext}"(file.file)
        temp_path = os.path.join("temp",temp_filename)

        os.makedirs("temp",exist_ok=True)

        with open (temp_path,"wb") as buffer :
            shutil.copyfileobj(file.file,buffer)


        result =chooser.predict(temp_path)
        os.remove(temp_path)
        return result 