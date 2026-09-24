from app.routes.auth_routes import auth_bp
from app.routes.event_routes import event_bp
from app.routes.guest_routes import guest_bp
from app.routes.expense_routes import expense_bp
from app.routes.venue_routes import venue_bp
from app.routes.vendor_routes import vendor_bp
from app.routes.invite_routes import invite_bp
from app.routes.checklist_routes import checklist_bp
from app.routes.feedback_routes import feedback_bp
from app.routes.admin_routes import admin_bp

def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(event_bp, url_prefix='/api/events')
    app.register_blueprint(guest_bp, url_prefix='/api')
    app.register_blueprint(expense_bp, url_prefix='/api')
    app.register_blueprint(venue_bp, url_prefix='/api/venues')
    app.register_blueprint(vendor_bp, url_prefix='/api/vendors')
    app.register_blueprint(invite_bp, url_prefix='/api/invitations')
    app.register_blueprint(checklist_bp, url_prefix='/api')
    app.register_blueprint(feedback_bp, url_prefix='/api/feedback')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
