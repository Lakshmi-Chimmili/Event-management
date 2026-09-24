from app.database import db

class EventCategory(db.Model):
    __tablename__ = 'event_categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    slug = db.Column(db.String(80), unique=True, nullable=False)
    icon = db.Column(db.String(50), default='Calendar')
    description = db.Column(db.String(255), nullable=True)

    events = db.relationship('Event', backref='category_rel', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'icon': self.icon,
            'description': self.description
        }
