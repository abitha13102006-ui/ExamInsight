import io
import pandas as pd
from flask import Blueprint, request, jsonify
from app import mongo
from app.ml.risk_classifier import MLPipeline

exam_bp = Blueprint('exam', __name__)
ml_engine = MLPipeline()

REQUIRED_COLUMNS = {'student_id', 'score'}

@exam_bp.route('/upload-dataset', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file included in request."}), 400

    file = request.files['file']
    filename = file.filename.lower()

    if not filename.endswith(('.xlsx', '.xls', '.csv')):
        return jsonify({
            "success": False, 
            "message": "Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file."
        }), 400

    try:
        # Read Excel or CSV into Pandas DataFrame
        if filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        else:
            df = pd.read_csv(file)

        # Normalize column headers (lowercase, trim spaces)
        df.columns = df.columns.astype(str).str.strip().str.lower()

        # Validate required schema columns
        missing_cols = REQUIRED_COLUMNS - set(df.columns)
        if missing_cols:
            return jsonify({
                "success": False, 
                "message": f"Dataset missing required columns: {', '.join(missing_cols)}"
            }), 422

        # Data Preprocessing: Clean nulls and type cast
        df['student_id'] = df['student_id'].astype(str).str.strip()
        df['score'] = pd.to_numeric(df['score'], errors='coerce').fillna(0.0)
        df['attendance'] = pd.to_numeric(df.get('attendance', 75), errors='coerce').fillna(75.0)

        inserted_records = []
        bulk_operations = []

        for _, row in df.iterrows():
            student_id = row['student_id']
            score = float(row['score'])
            attendance = float(row['attendance'])
            student_name = str(row.get('student_name', f"Student {student_id}")).strip()

            # Dynamic Extraction of Topic Columns (e.g., topic_algebra or algebra)
            topic_scores = {}
            for col in df.columns:
                if col.startswith('topic_'):
                    topic_name = col.replace('topic_', '').capitalize()
                    topic_scores[topic_name] = round(float(pd.to_numeric(row[col], errors='coerce') or 0.0), 2)

            # Fallback topics if no topic columns exist in the Excel sheet
            if not topic_scores:
                topic_scores = {
                    "Algebra": round(score, 2),
                    "Calculus": round(max(0.0, score - 10.0), 2),
                    "Physics": round(min(100.0, score + 5.0), 2)
                }

            # Machine Learning Inference Pipeline
            ml_results = ml_engine.analyze_student(
                score_pct=score, 
                attendance=attendance, 
                topic_scores=topic_scores
            )

            record = {
                "student_id": student_id,
                "student_name": student_name,
                "total_obtained": score,
                "attendance": attendance,
                "topic_scores": topic_scores,
                "ml_analytics": ml_results
            }

            # Prepare update statement for MongoDB
            mongo.db.results.update_one(
                {"student_id": student_id}, 
                {"$set": record}, 
                upsert=True
            )
            inserted_records.append(record)

        return jsonify({
            "success": True, 
            "message": f"Successfully ingested and analyzed {len(inserted_records)} records from {file.filename}.",
            "count": len(inserted_records)
        }), 201

    except Exception as e:
        return jsonify({
            "success": False, 
            "message": f"Error processing file: {str(e)}"
        }), 500


@exam_bp.route('/analytics/staff/dashboard', methods=['GET'])
def get_staff_dashboard():
    total_students = mongo.db.results.count_documents({})
    high_risk_count = mongo.db.results.count_documents({"ml_analytics.risk_category": "High Risk"})
    
    pipeline = [{"$group": {"_id": None, "avg_score": {"$avg": "$total_obtained"}}}]
    avg_res = list(mongo.db.results.aggregate(pipeline))
    avg_score = round(avg_res[0]["avg_score"], 2) if avg_res else 0.0

    students = list(mongo.db.results.find({}, {"_id": 0}))

    return jsonify({
        "success": True,
        "data": {
            "total_students": total_students,
            "avg_score": avg_score,
            "high_risk_count": high_risk_count,
            "students": students
        }
    }), 200


@exam_bp.route('/analytics/student/<student_id>', methods=['GET'])
def get_student_dashboard(student_id):
    student = mongo.db.results.find_one({"student_id": str(student_id).strip()}, {"_id": 0})
    if not student:
        return jsonify({"success": False, "message": "Student record not found."}), 404

    return jsonify({"success": True, "data": student}), 200