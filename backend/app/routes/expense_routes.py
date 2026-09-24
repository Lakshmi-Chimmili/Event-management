from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.database import db
from app.models.event import Event
from app.models.expense import Expense, EXPENSE_CATEGORIES
from app.utils.helpers import calculate_event_budget

expense_bp = Blueprint('expense_bp', __name__)

@expense_bp.route('/events/<int:event_id>/expenses', methods=['GET'])
@jwt_required()
def list_expenses(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    category_filter = request.args.get('category')
    query = Expense.query.filter_by(event_id=event_id)
    if category_filter:
        query = query.filter_by(category=category_filter)

    expenses = query.order_by(Expense.created_at.desc()).all()
    budget_stats = calculate_event_budget(event)

    return jsonify({
        'expenses': [exp.to_dict() for exp in expenses],
        'categories': EXPENSE_CATEGORIES,
        'summary': budget_stats
    }), 200

@expense_bp.route('/events/<int:event_id>/expenses', methods=['POST'])
@jwt_required()
def add_expense(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() or {}
    item_name = data.get('item_name', '').strip()
    category = data.get('category', 'Other')
    estimated_cost = float(data.get('estimated_cost', 0.0))
    actual_cost = float(data.get('actual_cost', 0.0))
    paid_status = data.get('paid_status', 'Unpaid')
    notes = data.get('notes', '').strip()

    if not item_name:
        return jsonify({'error': 'Item name is required'}), 400

    if category not in EXPENSE_CATEGORIES:
        category = 'Other'

    expense = Expense(
        event_id=event_id,
        category=category,
        item_name=item_name,
        estimated_cost=estimated_cost,
        actual_cost=actual_cost,
        paid_status=paid_status,
        notes=notes
    )
    db.session.add(expense)
    db.session.commit()

    return jsonify({
        'message': 'Expense recorded successfully',
        'expense': expense.to_dict(),
        'updated_budget': calculate_event_budget(event)
    }), 201

@expense_bp.route('/expenses/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    expense = Expense.query.get(expense_id)
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404

    if expense.event_ref.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() or {}
    if 'item_name' in data and data['item_name'].strip():
        expense.item_name = data['item_name'].strip()
    if 'category' in data and data['category'] in EXPENSE_CATEGORIES:
        expense.category = data['category']
    if 'estimated_cost' in data:
        expense.estimated_cost = float(data['estimated_cost'])
    if 'actual_cost' in data:
        expense.actual_cost = float(data['actual_cost'])
    if 'paid_status' in data and data['paid_status'] in ['Unpaid', 'Partial', 'Paid']:
        expense.paid_status = data['paid_status']
    if 'notes' in data:
        expense.notes = data['notes'].strip()

    db.session.commit()

    return jsonify({
        'message': 'Expense updated successfully',
        'expense': expense.to_dict(),
        'updated_budget': calculate_event_budget(expense.event_ref)
    }), 200

@expense_bp.route('/expenses/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    expense = Expense.query.get(expense_id)
    if not expense:
        return jsonify({'error': 'Expense not found'}), 404

    event = expense.event_ref
    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(expense)
    db.session.commit()

    return jsonify({
        'message': 'Expense deleted successfully',
        'updated_budget': calculate_event_budget(event)
    }), 200

@expense_bp.route('/events/<int:event_id>/budget-summary', methods=['GET'])
@jwt_required()
def get_budget_summary(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify({'budget_summary': calculate_event_budget(event)}), 200
