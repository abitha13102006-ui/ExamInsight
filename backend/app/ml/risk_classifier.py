import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans

class MLPipeline:
    def __init__(self):
        # Baseline model training: [Score Percentage, Attendance] -> Pass (1) / Fail (0)
        X_train = np.array([[30, 50], [40, 60], [85, 90], [90, 95], [20, 40], [70, 80]])
        y_train = np.array([0, 0, 1, 1, 0, 1])
        
        self.clf = LogisticRegression()
        self.clf.fit(X_train, y_train)

        self.kmeans = KMeans(n_clusters=3, random_state=42)
        self.kmeans.fit(X_train)

    def analyze_student(self, score_pct, attendance=75):
        # Calculate pass probability
        prob_pass = self.clf.predict_proba([[score_pct, attendance]])[0][1]
        
        if prob_pass < 0.4:
            risk = "High Risk"
        elif prob_pass < 0.7:
            risk = "Medium Risk"
        else:
            risk = "Low Risk"

        # Categorize into learning speed profiles
        cluster_id = int(self.kmeans.predict([[score_pct, attendance]])[0])
        cluster_map = {0: "Needs Attention", 1: "Steady Performer", 2: "Fast Learner"}

        return {
            "risk_category": risk,
            "pass_probability": round(float(prob_pass) * 100, 2),
            "cluster": cluster_map.get(cluster_id, "Steady Performer")
        }
        # Alias for backwards compatibility with ml_routes.py
RiskClassifier = MLPipeline