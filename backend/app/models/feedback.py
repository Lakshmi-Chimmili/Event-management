from datetime import datetime
from app.database import db

class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='SET NULL'), nullable=True)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    comment = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default='Platform', nullable=False)  # Platform, Event Planning, Vendor Experience
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.author.name if self.author else 'Anonymous',
            'user_email': self.author.email if self.author else None,
            'event_id': self.event_id,
            'event_name': self.event_ref.name if self.event_ref else None,
            'rating': self.rating,
            'comment': self.comment,
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
