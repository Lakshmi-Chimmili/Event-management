from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.database import db
from app.models.event import Event
from app.models.checklist import Checklist

checklist_bp = Blueprint('checklist_bp', __name__)

@checklist_bp.route('/events/<int:event_id>/checklist', methods=['GET'])
@jwt_required()
def list_checklist(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    tasks = Checklist.query.filter_by(event_id=event_id).order_by(Checklist.is_completed.asc(), Checklist.due_date.asc()).all()
    completed_count = sum(1 for t in tasks if t.is_completed)
    total_count = len(tasks)

    return jsonify({
        'tasks': [t.to_dict() for t in tasks],
        'total': total_count,
        'completed': completed_count,
        'completion_percentage': round((completed_count / total_count * 100), 1) if total_count > 0 else 0.0
    }), 200

@checklist_bp.route('/events/<int:event_id>/checklist', methods=['POST'])
@jwt_required()
def add_checklist_task(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() or {}
    task_name = data.get('task_name', '').strip()
    category = data.get('category', 'General').strip()
    due_date_str = data.get('due_date')

    if not task_name:
        return jsonify({'error': 'Task name is required'}), 400

    due_date = None
    if due_date_str:
        try:
            due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
        except ValueError:
            pass

    task = Checklist(
        event_id=event_id,
        task_name=task_name,
        category=category,
        due_date=due_date,
        is_completed=False
    )
    db.session.add(task)
    db.session.commit()

    return jsonify({
        'message': 'Task added',
        'task': task.to_dict()
    }), 201

@checklist_bp.route('/checklist/<int:task_id>/toggle', methods=['PUT'])
@jwt_required()
def toggle_task(task_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    task = Checklist.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    if task.event_ref.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    task.is_completed = not task.is_completed
    db.session.commit()
    return jsonify({
        'message': f'Task marked as {"completed" if task.is_completed else "pending"}',
        'task': task.to_dict()
    }), 200

@checklist_bp.route('/checklist/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    task = Checklist.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    if task.event_ref.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully'}), 200
