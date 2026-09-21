from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app import mongo
from app.ml.risk_classifier import MLPipeline
from app.ml.performance_cluster import PerformanceClustering
from bson.objectid import ObjectId


ml_bp = Blueprint('ml', __name__)
classifier = MLPipeline()
cluster_model = PerformanceClustering(n_clusters=3)

@ml_bp.route('/exam/<exam_id>/run-pipeline', methods=['POST'])
@jwt_required()
def run_ml_pipeline(exam_id):
    results = list(mongo.db.results.find({"exam_id": exam_id}))
    exam = mongo.db.exams.find_one({"_id": ObjectId(exam_id)})
    
    if not results or not exam:
        return jsonify({"success": False, "message": "Exam or results records not found"}), 404

    features = []
    for r in results:
        perc = (r['total_obtained'] / exam['max_marks']) * 100
        features.append([perc, perc * 0.9])

    clusters = cluster_model.fit_predict_clusters(features)

    for idx, r in enumerate(results):
        perc = features[idx][0]
        risk = risk_model.predict_risk(perc, features[idx][1])
        
        mongo.db.results.update_one(
            {"_id": r["_id"]},
            {"$set": {
                "ml_analytics.risk_category": risk,
                "ml_analytics.cluster_label": clusters[idx],
                "processed": True
            }}
        )

    return jsonify({"success": True, "message": f"ML pipeline executed for {len(results)} records"}), 200