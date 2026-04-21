from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes.user import router as user_router
from routes.auth import router as auth_router
from routes.admins import router as admin_router
from routes.complaint import router as complaint_router
from routes.hostel import router as hostel_router
from routes.academic_class import router as class_router
from routes.timetable import router as timetable_router
from routes.fee import router as fee_router
from routes.contact import router as contact_router
from routes.enrollment import router as enrollment_router
from routes.result import router as result_router
from routes.chat import router as chat_router
from routes.event import router as event_router
from fastapi.staticfiles import StaticFiles
import os


app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(complaint_router)
app.include_router(hostel_router)
app.include_router(class_router)
app.include_router(timetable_router)
app.include_router(fee_router)
app.include_router(contact_router)
app.include_router(enrollment_router)
app.include_router(result_router)
app.include_router(chat_router)
app.include_router(event_router)

if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"msg":"Campus Backend Running"}