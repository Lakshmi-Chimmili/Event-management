from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.database import db
from app.models.user import User
from app.models.event import Event
from app.models.venue import Venue
from app.models.vendor import Vendor
from app.models.category import EventCategory
from app.models.feedback import Feedback
from app.models.expense import Expense
from app.models.guest import Guest
from app.utils.decorators import admin_required

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/stats', methods=['GET'])
@admin_required()
def get_admin_stats():
    total_users = User.query.count()
    total_events = Event.query.count()
    total_venues = Venue.query.count()
    total_vendors = Vendor.query.count()
    total_feedbacks = Feedback.query.count()
    
    # Financial metrics
    all_expenses = Expense.query.all()
    total_platform_spend = sum(float(e.actual_cost) for e in all_expenses)
    
    all_events = Event.query.all()
    total_budget_volume = sum(float(e.total_budget) for e in all_events)
    total_guests_managed = Guest.query.count()

    # Event status breakdown
    status_counts = {'Planning': 0, 'Confirmed': 0, 'Completed': 0, 'Cancelled': 0, 'Draft': 0}
    for e in all_events:
        status_counts[e.status] = status_counts.get(e.status, 0) + 1

    # Events by category
    category_counts = {}
    for e in all_events:
        category_counts[e.event_type] = category_counts.get(e.event_type, 0) + 1

    events_by_category = [{'category': k, 'count': v} for k, v in category_counts.items()]

    # Recent 5 events
    recent_events = Event.query.order_by(Event.created_at.desc()).limit(5).all()

    return jsonify({
        'total_users': total_users,
        'total_events': total_events,
        'total_venues': total_venues,
        'total_vendors': total_vendors,
        'total_feedbacks': total_feedbacks,
        'total_platform_spend': round(total_platform_spend, 2),
        'total_budget_volume': round(total_budget_volume, 2),
        'total_guests_managed': total_guests_managed,
        'event_status_distribution': status_counts,
        'events_by_category': events_by_category,
        'recent_events': [e.to_dict(include_details=True) for e in recent_events]
    }), 200

# USER MANAGEMENT
@admin_bp.route('/users', methods=['GET'])
@admin_required()
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200

@admin_bp.route('/users/<int:user_id>/toggle', methods=['PUT'])
@admin_required()
def toggle_user_active(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.role == 'ADMIN':
        return jsonify({'error': 'Cannot deactivate an administrator'}), 400

    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({
        'message': f"User account {'activated' if user.is_active else 'deactivated'}",
        'user': user.to_dict()
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.role == 'ADMIN':
        return jsonify({'error': 'Cannot delete an administrator'}), 400

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200

# EVENT MANAGEMENT
@admin_bp.route('/events', methods=['GET'])
@admin_required()
def list_all_events():
    events = Event.query.order_by(Event.created_at.desc()).all()
    return jsonify({'events': [e.to_dict(include_details=True) for e in events]}), 200

@admin_bp.route('/events/<int:event_id>/status', methods=['PUT'])
@admin_required()
def update_event_status(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ['Draft', 'Planning', 'Confirmed', 'Completed', 'Cancelled']:
        return jsonify({'error': 'Invalid status'}), 400

    event.status = new_status
    db.session.commit()
    return jsonify({
        'message': f'Event status changed to {new_status}',
        'event': event.to_dict(include_details=True)
    }), 200

# VENUE MANAGEMENT
@admin_bp.route('/venues', methods=['POST'])
@admin_required()
def create_venue():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    location = data.get('location', '').strip()
    capacity = int(data.get('capacity', 0))
    price = float(data.get('price', 0.0))
    facilities = data.get('facilities', '')
    description = data.get('description', '').strip()
    image_url = data.get('image_url', '').strip()
    is_available = bool(data.get('is_available', True))

    if not name or not location or capacity <= 0 or price < 0:
        return jsonify({'error': 'Name, location, capacity > 0, and price >= 0 are required'}), 400

    venue = Venue(
        name=name,
        location=location,
        capacity=capacity,
        price=price,
        facilities=facilities,
        description=description,
        image_url=image_url or "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
        is_available=is_available
    )
    db.session.add(venue)
    db.session.commit()
    return jsonify({'message': 'Venue added successfully', 'venue': venue.to_dict()}), 201

@admin_bp.route('/venues/<int:venue_id>', methods=['PUT'])
@admin_required()
def update_venue(venue_id):
    venue = Venue.query.get(venue_id)
    if not venue:
        return jsonify({'error': 'Venue not found'}), 404

    data = request.get_json() or {}
    if 'name' in data and data['name'].strip():
        venue.name = data['name'].strip()
    if 'location' in data and data['location'].strip():
        venue.location = data['location'].strip()
    if 'capacity' in data:
        venue.capacity = int(data['capacity'])
    if 'price' in data:
        venue.price = float(data['price'])
    if 'facilities' in data:
        venue.facilities = data['facilities']
    if 'description' in data:
        venue.description = data['description'].strip()
    if 'image_url' in data:
        venue.image_url = data['image_url'].strip()
    if 'is_available' in data:
        venue.is_available = bool(data['is_available'])

    db.session.commit()
    return jsonify({'message': 'Venue updated', 'venue': venue.to_dict()}), 200

@admin_bp.route('/venues/<int:venue_id>', methods=['DELETE'])
@admin_required()
def delete_venue(venue_id):
    venue = Venue.query.get(venue_id)
    if not venue:
        return jsonify({'error': 'Venue not found'}), 404

    db.session.delete(venue)
    db.session.commit()
    return jsonify({'message': 'Venue deleted successfully'}), 200

# VENDOR MANAGEMENT
@admin_bp.route('/vendors', methods=['POST'])
@admin_required()
def create_vendor():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    category = data.get('category', '').strip()
    contact_name = data.get('contact_name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    price_range = data.get('price_range', '').strip()
    base_price = float(data.get('base_price', 0.0))
    rating = float(data.get('rating', 4.8))
    description = data.get('description', '').strip()
    image_url = data.get('image_url', '').strip()
    is_active = bool(data.get('is_active', True))

    if not name or not category or not phone:
        return jsonify({'error': 'Name, category, and phone are required'}), 400

    vendor = Vendor(
        name=name,
        category=category,
        contact_name=contact_name,
        email=email or None,
        phone=phone,
        price_range=price_range,
        base_price=base_price,
        rating=rating,
        description=description,
        image_url=image_url or "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
        is_active=is_active
    )
    db.session.add(vendor)
    db.session.commit()
    return jsonify({'message': 'Vendor created successfully', 'vendor': vendor.to_dict()}), 201

@admin_bp.route('/vendors/<int:vendor_id>', methods=['PUT'])
@admin_required()
def update_vendor(vendor_id):
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404

    data = request.get_json() or {}
    if 'name' in data and data['name'].strip():
        vendor.name = data['name'].strip()
    if 'category' in data and data['category'].strip():
        vendor.category = data['category'].strip()
    if 'contact_name' in data:
        vendor.contact_name = data['contact_name'].strip()
    if 'email' in data:
        vendor.email = data['email'].strip() or None
    if 'phone' in data and data['phone'].strip():
        vendor.phone = data['phone'].strip()
    if 'price_range' in data:
        vendor.price_range = data['price_range'].strip()
    if 'base_price' in data:
        vendor.base_price = float(data['base_price'])
    if 'rating' in data:
        vendor.rating = float(data['rating'])
    if 'description' in data:
        vendor.description = data['description'].strip()
    if 'image_url' in data:
        vendor.image_url = data['image_url'].strip()
    if 'is_active' in data:
        vendor.is_active = bool(data['is_active'])

    db.session.commit()
    return jsonify({'message': 'Vendor updated', 'vendor': vendor.to_dict()}), 200

@admin_bp.route('/vendors/<int:vendor_id>', methods=['DELETE'])
@admin_required()
def delete_vendor(vendor_id):
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({'error': 'Vendor not found'}), 404

    db.session.delete(vendor)
    db.session.commit()
    return jsonify({'message': 'Vendor deleted successfully'}), 200

# CATEGORIES MANAGEMENT
@admin_bp.route('/categories', methods=['GET'])
def list_categories():
    categories = EventCategory.query.order_by(EventCategory.name.asc()).all()
    return jsonify({'categories': [c.to_dict() for c in categories]}), 200

@admin_bp.route('/categories', methods=['POST'])
@admin_required()
def create_category():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    slug = data.get('slug', '').strip().lower() or name.lower().replace(' ', '-')
    icon = data.get('icon', 'Calendar')
    description = data.get('description', '').strip()

    if not name:
        return jsonify({'error': 'Category name is required'}), 400

    if EventCategory.query.filter((EventCategory.name == name) | (EventCategory.slug == slug)).first():
        return jsonify({'error': 'Category with this name or slug already exists'}), 409

    cat = EventCategory(name=name, slug=slug, icon=icon, description=description)
    db.session.add(cat)
    db.session.commit()
    return jsonify({'message': 'Category added', 'category': cat.to_dict()}), 201

# FEEDBACK MODERATION
@admin_bp.route('/feedback', methods=['GET'])
@admin_required()
def admin_feedbacks():
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return jsonify({'feedbacks': [f.to_dict() for f in feedbacks]}), 200

@admin_bp.route('/feedback/<int:feedback_id>', methods=['DELETE'])
@admin_required()
def delete_feedback(feedback_id):
    fb = Feedback.query.get(feedback_id)
    if not fb:
        return jsonify({'error': 'Feedback not found'}), 404
    db.session.delete(fb)
    db.session.commit()
    return jsonify({'message': 'Feedback removed'}), 200
