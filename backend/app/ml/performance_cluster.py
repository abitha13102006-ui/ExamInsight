import numpy as np
from sklearn.cluster import KMeans

class PerformanceClustering:
    def __init__(self, n_clusters=3):
        self.n_clusters = n_clusters
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)

    def fit_predict_clusters(self, feature_matrix):
        if len(feature_matrix) < self.n_clusters:
            return ["Standard Cluster"] * len(feature_matrix)
        
        clusters = self.kmeans.fit_predict(feature_matrix)
        labels = []
        for c in clusters:
            if c == 0:
                labels.append("Cluster A: Need Focus")
            elif c == 1:
                labels.append("Cluster B: Steady Performers")
            else:
                labels.append("Cluster C: High Achievers")
        return labels