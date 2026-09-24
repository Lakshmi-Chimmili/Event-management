from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity
from app.models.user import User

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') != 'ADMIN':
                return jsonify({'error': 'Admin privilege required', 'code': 'FORBIDDEN'}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def get_current_user():
    """Retrieve current authenticated User model instance from DB"""
    user_id = get_jwt_identity()
    if not user_id:
        return None
    return User.query.get(int(user_id))
