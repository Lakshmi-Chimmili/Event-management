from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, jwt_required
from app.database import db
from app.models.feedback import Feedback

feedback_bp = Blueprint('feedback_bp', __name__)

@feedback_bp.route('', methods=['GET'])
def list_feedback():
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).limit(20).all()
    avg_rating = 0.0
    if feedbacks:
        avg_rating = round(sum(f.rating for f in feedbacks) / len(feedbacks), 1)

    return jsonify({
        'feedbacks': [f.to_dict() for f in feedbacks],
        'total': len(feedbacks),
        'average_rating': avg_rating
    }), 200

@feedback_bp.route('', methods=['POST'])
@jwt_required()
def submit_feedback():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    rating = int(data.get('rating', 5))
    comment = data.get('comment', '').strip()
    category = data.get('category', 'Platform').strip()
    event_id = data.get('event_id')

    if not comment:
        return jsonify({'error': 'Comment is required'}), 400

    if rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5 stars'}), 400

    feedback = Feedback(
        user_id=user_id,
        event_id=event_id if event_id else None,
        rating=rating,
        comment=comment,
        category=category
    )
    db.session.add(feedback)
    db.session.commit()

    return jsonify({
        'message': 'Thank you for your valuable feedback!',
        'feedback': feedback.to_dict()
    }), 201
