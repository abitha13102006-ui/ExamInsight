from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import mongo
from app.models.exam import ExamModel

exam_bp = Blueprint('exam', __name__)

@exam_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_exam():
    identity = get_jwt_identity()
    if identity.get('role') != 'STAFF':
        return jsonify({"success": False, "message": "Unauthorized action"}), 403

    data = request.get_json()
    doc = ExamModel.create_exam_document(
        data['title'], data['course_code'], identity['user_id'],
        data['max_marks'], data['questions']
    )
    res = mongo.db.exams.insert_one(doc)
    return jsonify({"success": True, "exam_id": str(res.inserted_id)}), 201


@exam_bp.route('/analytics/staff/dashboard', methods=['GET'])
def get_staff_dashboard():
    total_students = mongo.db.results.count_documents({})
    high_risk_count = mongo.db.results.count_documents({"ml_analytics.risk_category": "High Risk"})
    
    pipeline = [{"$group": {"_id": None, "avg_score": {"$avg": "$total_obtained"}}}]
    avg_res = list(mongo.db.results.aggregate(pipeline))
    avg_score = round(avg_res[0]["avg_score"], 2) if avg_res else 0

    return jsonify({
        "success": True,
        "data": {
            "total_students": total_students,
            "avg_score": avg_score,
            "high_risk_count": high_risk_count
        }
    }), 200