from app.celery_app import celery
from app.yolo_choser import YOLOChooser, routing 
from app.db import upload_xray_to_db, save_analysis_to_db
import os

chooser =YOLOChooser()

@celery.task 
def full_task(temp_path,filename):
    try:
        storage_path = upload_xray_to_db(temp_path,filename)#supabase dosya upload etme
        
        result = chooser.predict(temp_path)#endpoint içinde olan predict başlatma fonksiyonu

        top1_name = result["top1"] #classificationdan çıkan sonucu routinge parametre olarak verme
        analysis = routing(top1_name,temp_path)#routing fonksiyonu çalılştırma

        save_analysis_to_db(   #veritabanına dosyayı kaydetme
                file_name=filename,
                file_path=storage_path,
                analysis={
                  "chooser_result": result,
                  "analysis": analysis
                }                  
            )
        
        return {
            "file": filename,
            "result": result,
            "analysis": analysis
        }


    

    finally:
        if os.path.exists(temp_path):
                os.remove(temp_path)
               
