from datetime import datetime
from app.database import db

class Vendor(db.Model):
    __tablename__ = 'vendors'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # Catering, Decoration, Photography, Videography, DJ/Music, Makeup, Invitation, Transportation, Security
    contact_name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(20), nullable=False)
    price_range = db.Column(db.String(50), nullable=True)  # e.g. "$500 - $1,200"
    base_price = db.Column(db.Numeric(10, 2), default=0.0, nullable=False)
    rating = db.Column(db.Numeric(3, 2), default=4.8)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    booked_services = db.relationship('EventService', backref='vendor_profile', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'contact_name': self.contact_name,
            'email': self.email,
            'phone': self.phone,
            'price_range': self.price_range,
            'base_price': float(self.base_price) if self.base_price is not None else 0.0,
            'rating': float(self.rating) if self.rating is not None else 5.0,
            'description': self.description,
            'image_url': self.image_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
