from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.database import db
from app.models.venue import Venue
from app.models.event import Event
from app.models.expense import Expense

venue_bp = Blueprint('venue_bp', __name__)

@venue_bp.route('', methods=['GET'])
def list_venues():
    search = request.args.get('search', '').strip()
    min_capacity = request.args.get('min_capacity', type=int)
    max_price = request.args.get('max_price', type=float)
    available_only = request.args.get('available_only', 'false').lower() == 'true'

    query = Venue.query
    if search:
        query = query.filter(
            (Venue.name.ilike(f'%{search}%')) |
            (Venue.location.ilike(f'%{search}%')) |
            (Venue.facilities.ilike(f'%{search}%'))
        )
    if min_capacity:
        query = query.filter(Venue.capacity >= min_capacity)
    if max_price:
        query = query.filter(Venue.price <= max_price)
    if available_only:
        query = query.filter(Venue.is_available == True)

    venues = query.order_by(Venue.name.asc()).all()
    return jsonify({
        'venues': [v.to_dict() for v in venues],
        'total': len(venues)
    }), 200

@venue_bp.route('/<int:venue_id>', methods=['GET'])
def get_venue(venue_id):
    venue = Venue.query.get(venue_id)
    if not venue:
        return jsonify({'error': 'Venue not found'}), 404
    return jsonify({'venue': venue.to_dict()}), 200

@venue_bp.route('/events/<int:event_id>/select-venue', methods=['POST'])
@jwt_required()
def select_venue_for_event(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() or {}
    venue_id = data.get('venue_id')
    venue = Venue.query.get(venue_id)
    if not venue:
        return jsonify({'error': 'Venue not found'}), 404

    # Update event venue and location
    event.venue_id = venue.id
    event.location = f"{venue.name}, {venue.location}"

    # Auto-add venue expense if not already present
    existing_venue_exp = Expense.query.filter_by(event_id=event.id, category='Venue').first()
    if not existing_venue_exp:
        venue_exp = Expense(
            event_id=event.id,
            category='Venue',
            item_name=f"Venue Booking: {venue.name}",
            estimated_cost=venue.price,
            actual_cost=venue.price,
            paid_status='Unpaid',
            notes=f"Auto-generated from venue catalog (Capacity: {venue.capacity})"
        )
        db.session.add(venue_exp)

    db.session.commit()
    return jsonify({
        'message': f'{venue.name} selected for event {event.name}',
        'event': event.to_dict(include_details=True)
    }), 200
