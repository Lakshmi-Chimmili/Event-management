from datetime import datetime
from app.database import db

class Checklist(db.Model):
    __tablename__ = 'event_checklists'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False, index=True)
    task_name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(60), default='General', nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'task_name': self.task_name,
            'category': self.category,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'is_completed': self.is_completed,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
