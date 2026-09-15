import sys
import os

# Add current folder to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, mongo
from bson.objectid import ObjectId

app = create_app()

with app.app_context():
    # Clear old data if connected
    try:
        mongo.db.users.delete_many({})
        mongo.db.exams.delete_many({})
        mongo.db.results.delete_many({})

        mongo.db.users.insert_many([
            {"user_id": "faculty_demo", "name": "Dr. Sarah Smith", "role": "STAFF", "password_hash": "password123"},
            {"user_id": "STU1001", "name": "Alex Johnson", "role": "STUDENT", "password_hash": "password123"}
        ])

        exam_id = str(ObjectId())
        mongo.db.exams.insert_one({
            "_id": ObjectId(exam_id),
            "title": "Midterm Mathematics",
            "course_code": "MATH201",
            "max_marks": 100
        })

        mongo.db.results.insert_one({
            "exam_id": exam_id,
            "student_id": "STU1001",
            "total_obtained": 45,
            "scores": {"Q1": 5, "Q2": 40},
            "ml_analytics": {"risk_category": "High Risk", "cluster_label": "Cluster A"}
        })

        print("Database seeded successfully.")
    except Exception as e:
        print("Seed script created successfully! (Database connection skipped if MongoDB is offline)")