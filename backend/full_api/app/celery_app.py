from celery import Celery
import os

broker_url = os.environ.get("CELERY_BROKER_URL", "redis://127.0.0.1:6379/0")
backend_url = os.environ.get("CELERY_RESULT_BACKEND", "redis://127.0.0.1:6379/0")

celery = Celery(
    "worker",
    broker=broker_url,
    backend=backend_url
)

celery.autodiscover_tasks(["app.tasks"])
