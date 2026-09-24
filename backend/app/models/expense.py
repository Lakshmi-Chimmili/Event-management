from datetime import datetime
from app.database import db

EXPENSE_CATEGORIES = [
    'Venue',
    'Food/Catering',
    'Decoration',
    'Photography',
    'Videography',
    'Music/DJ',
    'Invitations',
    'Transportation',
    'Other'
]

class Expense(db.Model):
    __tablename__ = 'expenses'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False, index=True)
    category = db.Column(
        db.Enum(*EXPENSE_CATEGORIES, name='expense_categories'),
        nullable=False,
        default='Other'
    )
    item_name = db.Column(db.String(150), nullable=False)
    estimated_cost = db.Column(db.Numeric(10, 2), default=0.00, nullable=False)
    actual_cost = db.Column(db.Numeric(10, 2), default=0.00, nullable=False)
    paid_status = db.Column(
        db.Enum('Unpaid', 'Partial', 'Paid', name='paid_status_enum'),
        default='Unpaid',
        nullable=False
    )
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        est = float(self.estimated_cost) if self.estimated_cost is not None else 0.0
        act = float(self.actual_cost) if self.actual_cost is not None else 0.0
        return {
            'id': self.id,
            'event_id': self.event_id,
            'category': self.category,
            'item_name': self.item_name,
            'estimated_cost': est,
            'actual_cost': act,
            'variance': est - act,
            'paid_status': self.paid_status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
