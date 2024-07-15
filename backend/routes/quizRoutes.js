import { Router } from "express";
import {
  getQuestion,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuizList,
  getQuizListForCourse,
  getTeacherQuizOverview,
  submitStudentAnswer,
  nextQuizQuestion,
} from "../controllers/quizController.js";

const router = Router();

router.get("/quizzes", getQuizList);
router.get("/courses/:courseId/quizzes", getQuizListForCourse);

// For students
router.post("/questions/:questionId/answer", submitStudentAnswer);
router.get(
  "/courses/:courseId/lectures/:lectureId/nextQuestion",
  nextQuizQuestion
);
// For teachers
router.get(
  "/courses/:courseId/lectures/:lectureId/manageQuiz",
  getTeacherQuizOverview
);
router.post("/courses/:courseId/lectures/:lectureId/questions", addQuestion);
router.get("/questions/:questionId", getQuestion);
router.patch("/questions/:questionId", updateQuestion);
router.post("/questions/:questionId/delete", deleteQuestion);

export default router;
