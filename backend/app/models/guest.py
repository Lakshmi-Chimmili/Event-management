from datetime import datetime
from app.database import db

class Guest(db.Model):
    __tablename__ = 'guests'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(25), nullable=True)
    relationship = db.Column(db.String(50), nullable=True)  # Family, Friend, Colleague, VIP, Relative, Other
    rsvp_status = db.Column(
        db.Enum('Pending', 'Accepted', 'Declined', name='guest_rsvp_status'),
        default='Pending',
        nullable=False
    )
    number_of_guests = db.Column(db.Integer, default=1, nullable=False)
    dietary_notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'relationship': self.relationship or 'Friend',
            'rsvp_status': self.rsvp_status,
            'number_of_guests': self.number_of_guests,
            'dietary_notes': self.dietary_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
