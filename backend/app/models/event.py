from datetime import datetime
from app.database import db

class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('event_categories.id', ondelete='SET NULL'), nullable=True)
    venue_id = db.Column(db.Integer, db.ForeignKey('venues.id', ondelete='SET NULL'), nullable=True)
    
    name = db.Column(db.String(150), nullable=False)
    event_type = db.Column(db.String(60), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    number_of_guests = db.Column(db.Integer, default=0, nullable=False)
    total_budget = db.Column(db.Numeric(12, 2), default=0.00, nullable=False)
    status = db.Column(
        db.Enum('Draft', 'Planning', 'Confirmed', 'Completed', 'Cancelled', name='event_status'),
        default='Planning',
        nullable=False
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    guests = db.relationship('Guest', backref='event_ref', lazy=True, cascade='all, delete-orphan')
    expenses = db.relationship('Expense', backref='event_ref', lazy=True, cascade='all, delete-orphan')
    services = db.relationship('EventService', backref='event_ref', lazy=True, cascade='all, delete-orphan')
    invitation = db.relationship('Invitation', backref='event_ref', uselist=False, cascade='all, delete-orphan')
    checklists = db.relationship('Checklist', backref='event_ref', lazy=True, cascade='all, delete-orphan')
    feedbacks = db.relationship('Feedback', backref='event_ref', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_details=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'organizer_name': self.organizer.name if self.organizer else None,
            'category_id': self.category_id,
            'venue_id': self.venue_id,
            'venue': self.booked_venue.to_dict() if self.booked_venue else None,
            'name': self.name,
            'event_type': self.event_type,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'location': self.location,
            'number_of_guests': self.number_of_guests,
            'total_budget': float(self.total_budget) if self.total_budget is not None else 0.0,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'total_guests_invited': len(self.guests) if self.guests else 0,
        }

        if include_details:
            total_estimated = sum(float(exp.estimated_cost) for exp in self.expenses) if self.expenses else 0.0
            total_actual = sum(float(exp.actual_cost) for exp in self.expenses) if self.expenses else 0.0
            budget = float(self.total_budget) if self.total_budget else 0.0
            remaining = budget - total_actual
            usage_pct = round((total_actual / budget) * 100, 1) if budget > 0 else 0.0

            accepted_guests = sum(g.number_of_guests for g in self.guests if g.rsvp_status == 'Accepted')
            declined_guests = sum(g.number_of_guests for g in self.guests if g.rsvp_status == 'Declined')
            pending_guests = sum(g.number_of_guests for g in self.guests if g.rsvp_status == 'Pending')

            data.update({
                'total_estimated_cost': total_estimated,
                'total_actual_cost': total_actual,
                'remaining_budget': remaining,
                'budget_usage_percentage': usage_pct,
                'rsvp_summary': {
                    'accepted': accepted_guests,
                    'declined': declined_guests,
                    'pending': pending_guests,
                    'total_responses': len(self.guests)
                },
                'services_count': len(self.services) if self.services else 0,
                'tasks_count': len(self.checklists) if self.checklists else 0,
                'tasks_completed': sum(1 for c in self.checklists if c.is_completed) if self.checklists else 0
            })

        return data
