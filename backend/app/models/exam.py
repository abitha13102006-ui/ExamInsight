from datetime import datetime

class ExamModel:
    @staticmethod
    def create_exam_document(title, course_code, faculty_id, max_marks, questions):
        return {
            "title": title,
            "course_code": course_code,
            "faculty_id": faculty_id,
            "max_marks": max_marks,
            "questions": questions,  # List of dicts: [{"q_id": "Q1", "topic": "Algebra", "max_score": 10}]
            "created_at": datetime.utcnow()
        }

    @staticmethod
    def create_result_document(exam_id, student_id, scores):
        total_obtained = sum(scores.values())
        return {
            "exam_id": exam_id,
            "student_id": student_id,
            "scores": scores,  # Dict: {"Q1": 8, "Q2": 5}
            "total_obtained": total_obtained,
            "processed": False,
            "ml_analytics": {},
            "updated_at": datetime.utcnow()
        }