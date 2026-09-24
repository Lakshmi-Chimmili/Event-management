from datetime import datetime
from app.database import db

class Venue(db.Model):
    __tablename__ = 'venues'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    facilities = db.Column(db.Text, nullable=True)  # Comma-separated or JSON list
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    is_available = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    events = db.relationship('Event', backref='booked_venue', lazy=True)

    def to_dict(self):
        facilities_list = [f.strip() for f in self.facilities.split(',')] if self.facilities else []
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'capacity': self.capacity,
            'price': float(self.price) if self.price is not None else 0.0,
            'facilities': facilities_list,
            'facilities_raw': self.facilities,
            'description': self.description,
            'image_url': self.image_url,
            'is_available': self.is_available,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
