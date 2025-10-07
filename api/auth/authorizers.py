from fastapi import HTTPException


def require_authentication(request, *args, **kwargs):
    if not request.is_authenticated:
        raise HTTPException(401, 'User is not authenticated')


def require_superuser(request, *args, **kwargs):
    if not getattr(request.user, 'is_superuser'):
        raise HTTPException(403, 'Action is not allowed')
