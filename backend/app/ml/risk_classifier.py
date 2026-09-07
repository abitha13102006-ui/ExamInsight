import numpy as np
from sklearn.linear_model import LogisticRegression

class RiskClassifier:
    def __init__(self):
        self.model = LogisticRegression()
        # Synthetic initialization fit for pre-training boundary margins
        X_init = np.array([[20, 15], [50, 45], [85, 80]])
        y_init = np.array(['High Risk', 'Moderate Risk', 'Low Risk'])
        self.model.fit(X_init, y_init)

    def predict_risk(self, percentage, topic_accuracy):
        features = np.array([[percentage, topic_accuracy]])
        prediction = self.model.predict(features)
        return prediction[0]