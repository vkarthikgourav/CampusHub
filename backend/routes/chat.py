from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from core.dependencies import get_current_user
from models.result import Result
from models.user import User
from models.student_enrollment import StudentEnrollment
from models.academic_class import AcademicClass
from models.timetable import Timetable
from models.event import Event
from models.complaint import Complaint

router = APIRouter(prefix="/chat", tags=["ai-bot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# Knowledge base about the campus
CAMPUS_INFO = {
    "about": "AU Campus Hub is the official campus management system of Andhra University. It helps students and administrators manage academics, hostel, fees, timetables, results, events, and complaints.",
    "features": "AU Campus Hub offers: 📅 Timetable Management, 📄 Results (PDF download), 💰 Fee Management, 🏨 Hostel Allocation, 📞 Contact Directory, 📢 Campus Events, 💬 Complaints System, and 👥 Student Management.",
    "timetable": "Your timetable is automatically generated based on which classes you are enrolled in. Go to the Timetable section in the sidebar to see your weekly schedule. Admins can add/edit timetable entries per class.",
    "results": "Your examination results are available in the Results section. Your admin uploads PDFs which you can download anytime. Results are stored permanently.",
    "fees": "Check the Fees section to view your fee details. Admins manage fee records for all students.",
    "hostel": "Hostel allocation details are available in the Hostel section. Contact the admin if you need a room assignment or change.",
    "complaints": "You can submit complaints through the Complaints section. Admins review and update the status of each complaint.",
    "events": "Check the Events section to see what's happening on campus! Events are categorized into General, Academic, Cultural, and Sports.",
    "contact": "Use the Contact Directory to find phone numbers and emails of faculty and staff.",
    "classes": "Your enrolled classes determine your timetable. Admins can enroll you in classes based on your department.",
}

KEYWORD_MAP = {
    "timetable": ["timetable", "schedule", "class time", "lecture", "period", "when is"],
    "results": ["result", "exam", "marks", "grade", "score", "semester result", "download result"],
    "fees": ["fee", "payment", "tuition", "pay", "dues", "money"],
    "hostel": ["hostel", "room", "accommodation", "dorm", "stay"],
    "complaints": ["complaint", "issue", "problem", "report", "grievance"],
    "events": ["event", "happening", "festival", "program", "cultural", "sports event", "seminar"],
    "contact": ["contact", "phone", "email", "faculty", "professor", "teacher", "staff"],
    "classes": ["class", "enroll", "course", "subject", "department"],
    "about": ["about", "what is", "campus hub", "au campus", "this website", "this app"],
    "features": ["feature", "what can", "help", "do for me", "services", "how to use"],
}

def match_intent(message: str) -> str | None:
    msg = message.lower()
    for intent, keywords in KEYWORD_MAP.items():
        for kw in keywords:
            if kw in msg:
                return intent
    return None

def get_greeting(name: str) -> str:
    return f"Hello {name}! 👋 I'm your AU Campus Hub assistant. How can I help you today?"

@router.post("/", response_model=ChatResponse)
def chat_with_bot(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    msg = request.message.strip().lower()
    user_name = current_user.get("name", "Student")
    user_role = current_user.get("role", "student")
    user_id = current_user.get("user_id")

    # Greetings
    if any(g in msg for g in ["hi", "hello", "hey", "good morning", "good evening", "good afternoon"]):
        return ChatResponse(reply=get_greeting(user_name))

    # Match intent
    intent = match_intent(msg)

    # Dynamic data queries
    if intent == "timetable" and user_role == "student" and user_id:
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            enrollments = db.query(StudentEnrollment).filter(StudentEnrollment.student_id == db_user.id).all()
            class_ids = [e.class_id for e in enrollments]
            if class_ids:
                entries = db.query(Timetable).filter(Timetable.class_id.in_(class_ids)).all()
                if entries:
                    today = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                    import datetime
                    day_name = today[min(datetime.datetime.now().weekday(), 4)]
                    today_classes = [e for e in entries if e.day == day_name]
                    if today_classes:
                        schedule = "\n".join([f"• {e.time_slot}: {e.subject} ({e.teacher_name})" for e in today_classes])
                        return ChatResponse(reply=f"📅 Your classes today ({day_name}):\n{schedule}\n\nYou have {len(entries)} total classes this week. Visit the Timetable page for the full view!")
                    return ChatResponse(reply=f"You have no classes today! But you have {len(entries)} classes this week. Check the Timetable section for details.")
                return ChatResponse(reply="You're enrolled in classes but no timetable entries exist yet. Ask your admin to set up the timetable.")
            return ChatResponse(reply="You're not enrolled in any classes yet. Contact your admin for enrollment.")

    if intent == "results" and user_role == "student" and user_id:
        results = db.query(Result).filter(Result.student_id == user_id).all()
        if results:
            result_list = "\n".join([f"• {r.title} ({r.semester})" for r in results])
            return ChatResponse(reply=f"📄 Your published results:\n{result_list}\n\nGo to the Results section to download the PDFs!")
        return ChatResponse(reply="No results published for you yet. Your results will appear in the Results section once the admin uploads them.")

    if intent == "events":
        events = db.query(Event).order_by(Event.event_date.desc()).limit(5).all()
        if events:
            event_list = "\n".join([f"• {e.title} — {e.event_date} ({e.category})" for e in events])
            return ChatResponse(reply=f"📢 Upcoming campus events:\n{event_list}\n\nVisit the Events page for full details!")
        return ChatResponse(reply="No events posted yet. Keep an eye on the Events section!")

    if intent == "complaints" and user_role == "student":
        complaints = db.query(Complaint).filter(Complaint.student_email == current_user.get("sub")).all()
        if complaints:
            clist = "\n".join([f"• {c.description[:50]}... — Status: {c.status}" for c in complaints])
            return ChatResponse(reply=f"📝 Your complaints:\n{clist}")
        return ChatResponse(reply="You haven't submitted any complaints. Use the Complaints section to file one.")

    # Static knowledge base
    if intent and intent in CAMPUS_INFO:
        return ChatResponse(reply=CAMPUS_INFO[intent])

    # Thank you
    if any(w in msg for w in ["thank", "thanks", "bye", "goodbye"]):
        return ChatResponse(reply=f"You're welcome, {user_name}! 😊 Feel free to ask me anything anytime. Have a great day!")

    # Fallback
    return ChatResponse(
        reply=f"I'm your AU Campus Hub assistant! Here's what I can help with:\n\n"
              f"📅 **Timetable** — Ask about your schedule\n"
              f"📄 **Results** — Check your exam results\n"
              f"💰 **Fees** — Fee information\n"
              f"🏨 **Hostel** — Room allocation\n"
              f"📢 **Events** — Campus happenings\n"
              f"📝 **Complaints** — Your filed complaints\n"
              f"📞 **Contacts** — Faculty directory\n\n"
              f"Try asking: \"What's my timetable today?\" or \"Do I have any results?\""
    )
