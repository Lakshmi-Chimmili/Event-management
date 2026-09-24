import uuid
from datetime import datetime
from app.database import db

class Invitation(db.Model):
    __tablename__ = 'invitations'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), unique=True, nullable=False)
    invitation_code = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    template_style = db.Column(db.String(50), default='Royal Gold', nullable=False)
    custom_message = db.Column(db.Text, nullable=True)
    host_contact = db.Column(db.String(100), nullable=True)
    dress_code = db.Column(db.String(100), nullable=True)
    rsvp_deadline = db.Column(db.Date, nullable=True)
    views_count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'invitation_code': self.invitation_code,
            'template_style': self.template_style,
            'custom_message': self.custom_message,
            'host_contact': self.host_contact,
            'dress_code': self.dress_code,
            'rsvp_deadline': self.rsvp_deadline.isoformat() if self.rsvp_deadline else None,
            'views_count': self.views_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
