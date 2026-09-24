import sys
import os

# Ensure backend directory is in sys.path for direct script execution
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config
from app.database import db
from app.routes import register_routes
from app.utils.seed_data import seed_database

jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # Configure CORS to allow frontend requests
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # JWT Error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({'error': 'Missing or invalid authentication token', 'code': 'UNAUTHORIZED'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Authentication token has expired. Please log in again.', 'code': 'TOKEN_EXPIRED'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({'error': 'Invalid authentication token signature', 'code': 'INVALID_TOKEN'}), 401

    # Root route
    @app.route('/', methods=['GET'])
    def root_info():
        return jsonify({
            'message': 'EventEase Backend API is running',
            'frontend_url': 'http://localhost:5173',
            'health_check': 'http://127.0.0.1:5000/api/health',
            'status': 'online'
        }), 200

    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'EventEase API',
            'version': '1.0.0'
        }), 200

    # Register all blueprints
    register_routes(app)

    # Initialize Database Tables & Seed Initial Data
    with app.app_context():
        try:
            db.create_all()
            seed_database()
            print(">>> [Database] MySQL connection established and initial seed verified.")
        except Exception as e:
            print(f">>> [Database Warning] Error during db.create_all() or seed: {e}")

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5000, debug=True)
