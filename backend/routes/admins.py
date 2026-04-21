from fastapi import APIRouter, Depends
from core.dependencies import require_role

router = APIRouter()

@router.get("/admin-only")
def admin_panel(user = Depends(require_role("admin"))):
    return {"msg": "Welcome Admin"}