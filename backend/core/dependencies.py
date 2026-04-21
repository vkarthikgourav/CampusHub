from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from core.security import SECRET_KEY, ALGORITHM

security = HTTPBearer()

def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        print("TOKEN PAYLOAD: ",payload)
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_role(role: str):
    def role_checker(user = Depends(get_current_user)):
        print("Decoded User:",user)
        if user.get("role") != role:
            raise HTTPException(status_code=403, detail="Access denied")
        return user
    return role_checker


def require_roles(roles: list[str]):
    def role_checker(user = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Access denied")
        return user
    return role_checker