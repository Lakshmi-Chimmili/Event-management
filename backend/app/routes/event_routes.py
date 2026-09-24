from datetime import datetime, date, time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.database import db
from app.models.event import Event
from app.models.category import EventCategory
from app.models.venue import Venue
from app.models.invitation import Invitation
from app.models.checklist import Checklist
from app.utils.helpers import calculate_event_budget, calculate_guest_summary

event_bp = Blueprint('event_bp', __name__)

@event_bp.route('', methods=['GET'])
@jwt_required()
def list_events():
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    # Filter parameters
    search = request.args.get('search', '').strip()
    status_filter = request.args.get('status', '').strip()
    category_filter = request.args.get('category', '').strip()
    all_events = request.args.get('all', 'false').lower() == 'true'

    query = Event.query
    if not (is_admin and all_events):
        query = query.filter_by(user_id=user_id)

    if search:
        query = query.filter(
            (Event.name.ilike(f'%{search}%')) | 
            (Event.location.ilike(f'%{search}%')) |
            (Event.event_type.ilike(f'%{search}%'))
        )
    if status_filter:
        query = query.filter(Event.status == status_filter)
    if category_filter:
        query = query.filter(Event.event_type == category_filter)

    events = query.order_by(Event.date.asc(), Event.start_time.asc()).all()
    return jsonify({
        'events': [e.to_dict(include_details=True) for e in events],
        'total': len(events)
    }), 200

@event_bp.route('/<int:event_id>', methods=['GET'])
@jwt_required()
def get_event(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized to view this event'}), 403

    event_data = event.to_dict(include_details=True)
    event_data['budget_breakdown'] = calculate_event_budget(event)
    event_data['guest_breakdown'] = calculate_guest_summary(event)
    event_data['invitation'] = event.invitation.to_dict() if event.invitation else None
    event_data['services'] = [s.to_dict() for s in event.services]
    event_data['checklists'] = [c.to_dict() for c in event.checklists]

    return jsonify({'event': event_data}), 200

@event_bp.route('', methods=['POST'])
@jwt_required()
def create_event():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    name = data.get('name', '').strip()
    event_type = data.get('event_type', '').strip()
    date_str = data.get('date', '').strip()
    start_time_str = data.get('start_time', '').strip()
    end_time_str = data.get('end_time', '').strip()
    location = data.get('location', '').strip()
    guests_count = int(data.get('number_of_guests', 0))
    budget = float(data.get('total_budget', 0.0))
    venue_id = data.get('venue_id')
    category_id = data.get('category_id')
    description = data.get('description', '').strip()

    if not name or not event_type or not date_str or not start_time_str or not end_time_str or not location:
        return jsonify({'error': 'Event name, type, date, start time, end time, and location are required'}), 400

    try:
        event_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Expected YYYY-MM-DD'}), 400

    try:
        start_time_obj = datetime.strptime(start_time_str, '%H:%M').time()
        end_time_obj = datetime.strptime(end_time_str, '%H:%M').time()
    except ValueError:
        return jsonify({'error': 'Invalid time format. Expected HH:MM'}), 400

    # Auto find category if not provided
    if not category_id:
        category = EventCategory.query.filter_by(name=event_type).first()
        if category:
            category_id = category.id

    event = Event(
        user_id=user_id,
        category_id=category_id,
        venue_id=venue_id if venue_id else None,
        name=name,
        event_type=event_type,
        description=description,
        date=event_date,
        start_time=start_time_obj,
        end_time=end_time_obj,
        location=location,
        number_of_guests=guests_count,
        total_budget=budget,
        status='Planning'
    )
    db.session.add(event)
    db.session.flush()

    # Automatically generate digital invitation record
    invitation = Invitation(
        event_id=event.id,
        template_style="Royal Gold",
        custom_message=f"You are warmly invited to celebrate {event.name} with us!",
        dress_code="Formal / Celebratory",
        rsvp_deadline=event.date
    )
    db.session.add(invitation)

    # Automatically initialize default planning checklists
    default_tasks = [
        ("Finalize guest invitation list", "Planning"),
        ("Select and confirm venue / services", "Venues"),
        ("Coordinate food & catering menu", "Catering"),
        ("Send digital invitations & collect RSVPs", "Invitations"),
        ("Review budget & final expenses", "Budget")
    ]
    for task_name, cat in default_tasks:
        ch = Checklist(
            event_id=event.id,
            task_name=task_name,
            category=cat,
            due_date=event.date
        )
        db.session.add(ch)

    db.session.commit()

    return jsonify({
        'message': 'Event created successfully',
        'event': event.to_dict(include_details=True)
    }), 201

@event_bp.route('/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized to edit this event'}), 403

    data = request.get_json() or {}

    if 'name' in data and data['name'].strip():
        event.name = data['name'].strip()
    if 'event_type' in data and data['event_type'].strip():
        event.event_type = data['event_type'].strip()
    if 'description' in data:
        event.description = data['description'].strip()
    if 'location' in data and data['location'].strip():
        event.location = data['location'].strip()
    if 'number_of_guests' in data:
        event.number_of_guests = int(data['number_of_guests'])
    if 'total_budget' in data:
        event.total_budget = float(data['total_budget'])
    if 'venue_id' in data:
        event.venue_id = data['venue_id'] if data['venue_id'] else None
    if 'category_id' in data:
        event.category_id = data['category_id'] if data['category_id'] else None
    if 'status' in data and data['status'] in ['Draft', 'Planning', 'Confirmed', 'Completed', 'Cancelled']:
        event.status = data['status']

    if 'date' in data and data['date']:
        try:
            event.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            pass

    if 'start_time' in data and data['start_time']:
        try:
            event.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        except ValueError:
            pass

    if 'end_time' in data and data['end_time']:
        try:
            event.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        except ValueError:
            pass

    db.session.commit()
    return jsonify({
        'message': 'Event updated successfully',
        'event': event.to_dict(include_details=True)
    }), 200

@event_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.user_id != user_id and not is_admin:
        return jsonify({'error': 'Unauthorized to delete this event'}), 403

    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted successfully'}), 200

@event_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
def dashboard_stats():
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get('role') == 'ADMIN'

    query = Event.query
    if not is_admin:
        query = query.filter_by(user_id=user_id)

    events = query.all()
    today = date.today()

    total_events = len(events)
    upcoming_events = sum(1 for e in events if e.date >= today and e.status != 'Cancelled')
    completed_events = sum(1 for e in events if e.status == 'Completed' or (e.date < today and e.status != 'Cancelled'))
    
    total_budget = sum(float(e.total_budget) for e in events)
    total_expenses = sum(
        sum(float(exp.actual_cost) for exp in e.expenses) for e in events
    )
    remaining_budget = total_budget - total_expenses
    total_guests = sum(
        sum(g.number_of_guests for g in e.guests if g.rsvp_status == 'Accepted') for e in events
    )

    # Categories distribution
    category_counts = {}
    for e in events:
        category_counts[e.event_type] = category_counts.get(e.event_type, 0) + 1

    events_by_category = [{'category': k, 'count': v} for k, v in category_counts.items()]

    # Global expense category distribution
    expense_categories = {}
    for e in events:
        for exp in e.expenses:
            cat = exp.category
            expense_categories[cat] = expense_categories.get(cat, 0.0) + float(exp.actual_cost)

    expense_by_category = [{'category': k, 'amount': round(v, 2)} for k, v in expense_categories.items()]

    # RSVP status distribution
    rsvp_status_counts = {'Accepted': 0, 'Pending': 0, 'Declined': 0}
    for e in events:
        for g in e.guests:
            if g.rsvp_status in rsvp_status_counts:
                rsvp_status_counts[g.rsvp_status] += g.number_of_guests

    return jsonify({
        'total_events': total_events,
        'upcoming_events': upcoming_events,
        'completed_events': completed_events,
        'total_guests': total_guests,
        'total_budget': round(total_budget, 2),
        'total_expenses': round(total_expenses, 2),
        'remaining_budget': round(remaining_budget, 2),
        'budget_usage_percentage': round((total_expenses / total_budget * 100), 1) if total_budget > 0 else 0.0,
        'events_by_category': events_by_category,
        'expense_by_category': expense_by_category,
        'rsvp_summary': rsvp_status_counts
    }), 200
