import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "eventease-super-secret-key-2026")
    
    # MySQL Database connection with PyMySQL driver
    # Default to local XAMPP root user with empty password, targeting eventease_db
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "eventease_db")
    
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", 
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "eventease-jwt-secret-key-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Application Config
    CORS_HEADERS = "Content-Type"
