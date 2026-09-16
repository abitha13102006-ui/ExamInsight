from flask import Flask
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

mongo = PyMongo()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    mongo.init_app(app)
    jwt.init_app(app)
    CORS(app)

    # Register blueprints
    from app.routes.exam_routes import exam_bp
    from app.routes.ml_routes import ml_bp
    
    app.register_blueprint(exam_bp, url_prefix='/api/exam')
    app.register_blueprint(ml_bp, url_prefix='/api/ml')

    return app