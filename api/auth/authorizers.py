from fastapi import HTTPException


def require_authentication(request, *args, **kwargs):
    if not request.is_authenticated:
        raise HTTPException(401, 'User is not authenticated')