from celery_app import celery
from yolo_choser import YOLOChooser, routing ,temp_path
import os

chooser =YOLOChooser()

@celery.task 
def full_task(image_path):
    try:

     result = chooser.predict(image_path)
     top1_name = result["top1"]
     analysis = routing(top1_name, temp_path)

     return {
        "total_files": len(results),
        "results": results
    }

    finally:
       #geçici dosyayı sil
       if os.path.exists(temp_path):
                print("9 - dosya siliniyor")
                os.remove(temp_path)
                print("10 - silindi")