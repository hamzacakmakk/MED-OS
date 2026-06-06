from celery import Celery

celery=Celery(
    "worker", #tasklere isim verme
     broker="redis://127.0.0.1:6379/0",
    backend="redis://127.0.0.1:6379/0"#task sonuçları için Redis 
)

# tasks modülünü yükle
celery.autodiscover_tasks(["app.tasks"])

