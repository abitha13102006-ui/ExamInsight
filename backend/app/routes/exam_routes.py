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