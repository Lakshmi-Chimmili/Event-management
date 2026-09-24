from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.database import db
from app.models.event import Event
from app.models.guest import Guest

guest_bp = Blueprint('guest_bp', __name__)

@guest_bp.route('/events/<int:event_id>/guests', methods=['GET'])
@jwt_required()
def list_guests(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    rsvp_filter = request.args.get('rsvp')
    search = request.args.get('search', '').strip()

    query = Guest.query.filter_by(event_id=event_id)
    if rsvp_filter:
        query = query.filter_by(rsvp_status=rsvp_filter)
    if search:
        query = query.filter(
            (Guest.name.ilike(f'%{search}%')) |
            (Guest.email.ilike(f'%{search}%')) |
            (Guest.phone.ilike(f'%{search}%'))
        )

    guests = query.order_by(Guest.name.asc()).all()

    accepted = sum(g.number_of_guests for g in event.guests if g.rsvp_status == 'Accepted')
    declined = sum(g.number_of_guests for g in event.guests if g.rsvp_status == 'Declined')
    pending = sum(g.number_of_guests for g in event.guests if g.rsvp_status == 'Pending')

    return jsonify({
        'guests': [g.to_dict() for g in guests],
        'total_count': len(guests),
        'summary': {
            'accepted': accepted,
            'declined': declined,
            'pending': pending,
            'total_headcount': accepted + declined + pending
        }
    }), 200

@guest_bp.route('/events/<int:event_id>/guests', methods=['POST'])
@jwt_required()
def add_guest(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Guest name is required'}), 400

    guest = Guest(
        event_id=event_id,
        name=name,
        email=data.get('email', '').strip() or None,
        phone=data.get('phone', '').strip() or None,
        relationship=data.get('relationship', 'Friend').strip(),
        rsvp_status=data.get('rsvp_status', 'Pending'),
        number_of_guests=int(data.get('number_of_guests', 1)),
        dietary_notes=data.get('dietary_notes', '').strip() or None
    )
    db.session.add(guest)
    db.session.commit()

    return jsonify({
        'message': 'Guest added successfully',
        'guest': guest.to_dict()
    }), 201

@guest_bp.route('/guests/<int:guest_id>', methods=['PUT'])
@jwt_required()
def update_guest(guest_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    guest = Guest.query.get(guest_id)
    if not guest:
        return jsonify({'error': 'Guest not found'}), 404

    if guest.event_ref.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() or {}
    if 'name' in data and data['name'].strip():
        guest.name = data['name'].strip()
    if 'email' in data:
        guest.email = data['email'].strip() or None
    if 'phone' in data:
        guest.phone = data['phone'].strip() or None
    if 'relationship' in data:
        guest.relationship = data['relationship'].strip()
    if 'rsvp_status' in data and data['rsvp_status'] in ['Pending', 'Accepted', 'Declined']:
        guest.rsvp_status = data['rsvp_status']
    if 'number_of_guests' in data:
        guest.number_of_guests = max(1, int(data['number_of_guests']))
    if 'dietary_notes' in data:
        guest.dietary_notes = data['dietary_notes'].strip() or None

    db.session.commit()
    return jsonify({
        'message': 'Guest updated successfully',
        'guest': guest.to_dict()
    }), 200

@guest_bp.route('/guests/<int:guest_id>', methods=['DELETE'])
@jwt_required()
def delete_guest(guest_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    guest = Guest.query.get(guest_id)
    if not guest:
        return jsonify({'error': 'Guest not found'}), 404

    if guest.event_ref.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(guest)
    db.session.commit()
    return jsonify({'message': 'Guest removed successfully'}), 200
