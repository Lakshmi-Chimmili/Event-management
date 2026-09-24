from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.database import db
from app.models.vendor import Vendor
from app.models.event import Event
from app.models.event_service import EventService
from app.models.expense import Expense

vendor_bp = Blueprint('vendor_bp', __name__)

VENDOR_TO_EXPENSE_CAT_MAP = {
    'Catering': 'Food/Catering',
    'Decoration': 'Decoration',
    'Photography': 'Photography',
    'Videography': 'Videography',
    'DJ/Music': 'Music/DJ',
    'Makeup': 'Other',
    'Invitation': 'Invitations',
    'Transportation': 'Transportation',
    'Security': 'Other'
}

@vendor_bp.route('', methods=['GET'])
def list_vendors():
    category = request.args.get('category', '').strip()
    search = request.args.get('search', '').strip()

    query = Vendor.query.filter_by(is_active=True)
    if category:
        query = query.filter_by(category=category)
    if search:
        query = query.filter(
            (Vendor.name.ilike(f'%{search}%')) |
            (Vendor.description.ilike(f'%{search}%')) |
            (Vendor.category.ilike(f'%{search}%'))
        )

    vendors = query.order_by(Vendor.rating.desc(), Vendor.name.asc()).all()
    return jsonify({
        'vendors': [v.to_dict() for v in vendors],
        'total': len(vendors)
    }), 200

@vendor_bp.route('/<int:vendor_id>', methods=['GET'])
def get_vendor(vendor_id):
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404
    return jsonify({'vendor': vendor.to_dict()}), 200

@vendor_bp.route('/events/<int:event_id>/services', methods=['GET'])
@jwt_required()
def list_event_services(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    services = EventService.query.filter_by(event_id=event_id).all()
    return jsonify({'services': [s.to_dict() for s in services]}), 200

@vendor_bp.route('/events/<int:event_id>/services', methods=['POST'])
@jwt_required()
def book_vendor_service(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() or {}
    vendor_id = data.get('vendor_id')
    agreed_price = float(data.get('agreed_price', 0.0))
    notes = data.get('notes', '').strip()

    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404

    # Default price if 0
    if agreed_price <= 0 and vendor.base_price:
        agreed_price = float(vendor.base_price)

    service = EventService(
        event_id=event_id,
        vendor_id=vendor_id,
        service_name=vendor.category,
        agreed_price=agreed_price,
        status='Confirmed',
        notes=notes
    )
    db.session.add(service)

    # Automatically add corresponding expense item for transparency
    exp_cat = VENDOR_TO_EXPENSE_CAT_MAP.get(vendor.category, 'Other')
    expense = Expense(
        event_id=event_id,
        category=exp_cat,
        item_name=f"{vendor.category}: {vendor.name}",
        estimated_cost=agreed_price,
        actual_cost=agreed_price,
        paid_status='Unpaid',
        notes=f"Service booking via {vendor.name} ({vendor.phone})"
    )
    db.session.add(expense)
    db.session.commit()

    return jsonify({
        'message': f'{vendor.name} successfully booked for {event.name}',
        'service': service.to_dict()
    }), 201

@vendor_bp.route('/events/services/<int:service_id>', methods=['DELETE'])
@jwt_required()
def remove_event_service(service_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    service = EventService.query.get(service_id)
    if not service:
        return jsonify({'error': 'Service booking not found'}), 404

    if service.event_ref.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(service)
    db.session.commit()
    return jsonify({'message': 'Service removed from event'}), 200
