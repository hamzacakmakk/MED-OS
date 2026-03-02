from celery import Celery 

celery=Celery(
    "worker", #tasklere isim verme
    broker="redis://redis:6379/0", #kuyruk için Redis
    backend="redis://redis:6379/0" #task sonuçları için Redis 
)

