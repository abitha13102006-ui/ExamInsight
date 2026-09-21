import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans

class MLPipeline:
    def __init__(self):
        # Baseline model training for Risk Prediction
        # [Score %, Attendance %] -> Pass (1) / At-Risk (0)
        X_train = np.array([[30, 50], [40, 60], [85, 90], [90, 95], [20, 40], [70, 80]])
        y_train = np.array([0, 0, 1, 1, 0, 1])
        
        self.risk_model = LogisticRegression()
        self.risk_model.fit(X_train, y_train)

        # K-Means Clustering for Student Performance Groups
        self.kmeans = KMeans(n_clusters=3, random_state=42)
        self.kmeans.fit(X_train)

    def analyze_student(self, score_pct, attendance=75, topic_scores=None, question_responses=None):
        # 1. Logistic Regression: Risk Prediction
        prob_pass = self.risk_model.predict_proba([[score_pct, attendance]])[0][1]
        if prob_pass < 0.4:
            risk = "High Risk"
        elif prob_pass < 0.7:
            risk = "Medium Risk"
        else:
            risk = "Low Risk"

        # 2. K-Means: Performance Grouping
        cluster_id = int(self.kmeans.predict([[score_pct, attendance]])[0])
        cluster_map = {0: "Needs Attention", 1: "Steady Performer", 2: "Fast Learner"}

        # 3. Topic-wise Analysis & Weak Area Identification
        weak_topics = []
        if topic_scores:
            for topic, acc in topic_scores.items():
                if float(acc) < 50.0:
                    weak_topics.append(topic)

        # 4. Error Pattern Classification (Question Level)
        error_patterns = []
        if question_responses:
            for q in question_responses:
                # Conceptual error: low topic score + incorrect on hard/medium question
                if not q.get('is_correct', True):
                    if q.get('difficulty') in ['Hard', 'Medium']:
                        error_patterns.append(f"Conceptual Error in Q{q.get('q_num')} ({q.get('topic')})")
                    else:
                        error_patterns.append(f"Careless Error in Q{q.get('q_num')} ({q.get('topic')})")

        return {
            "risk_category": risk,
            "pass_probability": round(float(prob_pass) * 100, 2),
            "cluster": cluster_map.get(cluster_id, "Steady Performer"),
            "weak_topics": weak_topics,
            "error_patterns": error_patterns,
            "improvement_suggestions": [f"Focus revision on: {', '.join(weak_topics)}" if weak_topics else "Maintain current performance."]
        }

# Backwards compatibility alias
RiskClassifier = MLPipeline