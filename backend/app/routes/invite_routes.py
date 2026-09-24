from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.database import db
from app.models.event import Event
from app.models.invitation import Invitation
from app.models.guest import Guest

invite_bp = Blueprint('invite_bp', __name__)

@invite_bp.route('/events/<int:event_id>/invitation', methods=['GET'])
@jwt_required()
def get_event_invitation(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    invitation = event.invitation
    if not invitation:
        invitation = Invitation(
            event_id=event.id,
            template_style='Royal Gold',
            custom_message=f'Welcome to {event.name}!'
        )
        db.session.add(invitation)
        db.session.commit()

    return jsonify({
        'invitation': invitation.to_dict(),
        'event': {
            'id': event.id,
            'name': event.name,
            'event_type': event.event_type,
            'date': event.date.isoformat(),
            'start_time': event.start_time.strftime('%H:%M'),
            'end_time': event.end_time.strftime('%H:%M'),
            'location': event.location
        }
    }), 200

@invite_bp.route('/events/<int:event_id>/invitation', methods=['PUT'])
@jwt_required()
def update_event_invitation(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    invitation = event.invitation
    if not invitation:
        invitation = Invitation(event_id=event.id)
        db.session.add(invitation)

    data = request.get_json() or {}
    if 'template_style' in data:
        invitation.template_style = data['template_style'].strip()
    if 'custom_message' in data:
        invitation.custom_message = data['custom_message'].strip()
    if 'host_contact' in data:
        invitation.host_contact = data['host_contact'].strip()
    if 'dress_code' in data:
        invitation.dress_code = data['dress_code'].strip()
    if 'rsvp_deadline' in data and data['rsvp_deadline']:
        try:
            invitation.rsvp_deadline = datetime.strptime(data['rsvp_deadline'], '%Y-%m-%d').date()
        except ValueError:
            pass

    db.session.commit()
    return jsonify({
        'message': 'Invitation settings updated successfully',
        'invitation': invitation.to_dict()
    }), 200

# PUBLIC ENDPOINTS (No login required for guests receiving the link)
@invite_bp.route('/public/<string:code>', methods=['GET'])
def get_public_invitation(code):
    invitation = Invitation.query.filter_by(invitation_code=code).first()
    if not invitation:
        return jsonify({'error': 'Invitation link is invalid or expired'}), 404

    # Increment view counter
    invitation.views_count += 1
    db.session.commit()

    event = invitation.event_ref
    return jsonify({
        'invitation': invitation.to_dict(),
        'event': {
            'id': event.id,
            'name': event.name,
            'event_type': event.event_type,
            'description': event.description,
            'date': event.date.isoformat(),
            'start_time': event.start_time.strftime('%H:%M'),
            'end_time': event.end_time.strftime('%H:%M'),
            'location': event.location,
            'organizer_name': event.organizer.name if event.organizer else 'The Host'
        }
    }), 200

@invite_bp.route('/public/<string:code>/rsvp', methods=['POST'])
def submit_public_rsvp(code):
    invitation = Invitation.query.filter_by(invitation_code=code).first()
    if not invitation:
        return jsonify({'error': 'Invitation link is invalid or expired'}), 404

    event = invitation.event_ref
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    rsvp_status = data.get('rsvp_status', 'Accepted')
    number_of_guests = max(1, int(data.get('number_of_guests', 1)))
    dietary_notes = data.get('dietary_notes', '').strip()

    if not name:
        return jsonify({'error': 'Name is required to submit RSVP'}), 400

    if rsvp_status not in ['Accepted', 'Declined', 'Pending']:
        rsvp_status = 'Accepted'

    # Check if guest already registered by email or phone
    guest = None
    if email:
        guest = Guest.query.filter_by(event_id=event.id, email=email).first()
    if not guest and phone:
        guest = Guest.query.filter_by(event_id=event.id, phone=phone).first()

    if guest:
        guest.name = name
        guest.rsvp_status = rsvp_status
        guest.number_of_guests = number_of_guests
        guest.dietary_notes = dietary_notes
    else:
        guest = Guest(
            event_id=event.id,
            name=name,
            email=email or None,
            phone=phone or None,
            relationship='Guest',
            rsvp_status=rsvp_status,
            number_of_guests=number_of_guests,
            dietary_notes=dietary_notes
        )
        db.session.add(guest)

    db.session.commit()

    return jsonify({
        'message': f'Thank you {name}! Your RSVP has been confirmed as "{rsvp_status}".',
        'rsvp_status': rsvp_status,
        'guest': guest.to_dict()
    }), 200
