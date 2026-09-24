from datetime import datetime
from app.database import db

class EventService(db.Model):
    __tablename__ = 'event_services'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False, index=True)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id', ondelete='CASCADE'), nullable=False, index=True)
    service_name = db.Column(db.String(100), nullable=True)
    agreed_price = db.Column(db.Numeric(10, 2), default=0.00, nullable=False)
    status = db.Column(
        db.Enum('Pending', 'Confirmed', 'Completed', 'Cancelled', name='service_status'),
        default='Pending',
        nullable=False
    )
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'vendor_id': self.vendor_id,
            'service_name': self.service_name or (self.vendor_profile.category if self.vendor_profile else 'Service'),
            'vendor': self.vendor_profile.to_dict() if self.vendor_profile else None,
            'agreed_price': float(self.agreed_price) if self.agreed_price is not None else 0.0,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
