import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'exam_insight_super_secret_key_2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt_exam_insight_secret_key_2026')
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/exam_insight_db')