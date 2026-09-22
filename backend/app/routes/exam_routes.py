import io
import pandas as pd
from flask import Blueprint, request, jsonify
from app import mongo
from app.ml.risk_classifier import MLPipeline

exam_bp = Blueprint('exam', __name__)
ml_engine = MLPipeline()

# --- LOGIN ENDPOINT ---
@exam_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    role = data.get('role')  # 'staff' or 'student'
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', '')).strip()

    if not role or not username or not password:
        return jsonify({"success": False, "message": "Missing credentials or role selection"}), 400

    # Demo Staff Authentication
    if role == 'staff':
        if username == "admin" and password == "admin123":
            return jsonify({
                "success": True,
                "role": "staff",
                "user": {"name": "Faculty Administrator", "username": username}
            }), 200
        else:
            return jsonify({"success": False, "message": "Invalid staff credentials"}), 401

    # Student Authentication (validated against student_id in MongoDB)
    elif role == 'student':
        student = mongo.db.results.find_one({"student_id": username}, {'_id': 0})
        if student and password == f"student123":  # Standard default student password
            return jsonify({
                "success": True,
                "role": "student",
                "student_id": username,
                "data": student
            }), 200
        elif not student:
            return jsonify({"success": False, "message": f"Student ID '{username}' not found in database. Ask staff to upload marks."}), 404
        else:
            return jsonify({"success": False, "message": "Invalid password"}), 401

    return jsonify({"success": False, "message": "Invalid role specified"}), 400


@exam_bp.route('/upload-csv', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file uploaded"}), 400

    file = request.files['file']
    filename = file.filename.lower()

    try:
        if filename.endswith('.xlsx') or filename.endswith('.xls'):
            df = pd.read_excel(file)
        elif filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            return jsonify({"success": False, "message": "Unsupported file format. Upload .csv or .xlsx"}), 400

        df.columns = [str(col).strip().lower() for col in df.columns]

        if 'student_id' not in df.columns or 'score' not in df.columns:
            return jsonify({"success": False, "message": "File must contain 'student_id' and 'score' columns."}), 400

        inserted_records = []
        for _, row in df.iterrows():
            student_id = str(row['student_id']).strip()
            score = float(row['score'])
            attendance = float(row.get('attendance', 75))

            topic_scores = {}
            for col in df.columns:
                if col.startswith('topic_'):
                    topic_scores[col.replace('topic_', '')] = float(row[col])

            if not topic_scores:
                topic_scores = {"Algebra": score, "Calculus": max(0, score - 15), "Physics": min(100, score + 10)}

            ml_results = ml_engine.analyze_student(score, attendance, topic_scores=topic_scores)

            doc = {
                "student_id": student_id,
                "student_name": str(row.get('student_name', f"Student {student_id}")),
                "total_obtained": score,
                "attendance": attendance,
                "topic_scores": topic_scores,
                "ml_analytics": ml_results
            }

            mongo.db.results.update_one({"student_id": student_id}, {"$set": doc}, upsert=True)
            inserted_records.append(doc)

        return jsonify({
            "success": True, 
            "message": f"Successfully processed {len(inserted_records)} student records."
        }), 201

    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing file: {str(e)}"}), 500


@exam_bp.route('/analytics/staff/dashboard', methods=['GET'])
def staff_dashboard():
    try:
        students = list(mongo.db.results.find({}, {'_id': 0}))
        total_students = len(students)
        avg_score = round(sum(s.get('total_obtained', 0) for s in students) / total_students, 2) if total_students > 0 else 0
        high_risk_count = sum(1 for s in students if s.get('ml_analytics', {}).get('risk_category') == 'High Risk')

        return jsonify({
            "success": True,
            "data": {
                "total_students": total_students,
                "avg_score": avg_score,
                "high_risk_count": high_risk_count,
                "students": students
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@exam_bp.route('/analytics/student/<student_id>', methods=['GET'])
def student_analytics(student_id):
    try:
        student = mongo.db.results.find_one({"student_id": str(student_id).strip()}, {'_id': 0})
        if not student:
            return jsonify({"success": False, "message": "Student record not found"}), 404
        return jsonify({"success": True, "data": student}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500