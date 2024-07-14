import { Router } from "express";
import {
  getQuestion,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuizList,
  getQuizListForCourse,
  getTeacherQuizOverview,
} from "../controllers/quizController.js";

const router = Router();

router.get("/quizzes", getQuizList);
router.get("/courses/:courseId/quizzes", getQuizListForCourse);

// For students
// router.post("/courses/:courseId/lectures/:lectureId/quiz/answer", addAnswer);

// For teachers
router.get("/questions/:questionId", getQuestion);
router.patch("/questions/:questionId", updateQuestion);
router.post("/courses/:courseId/lectures/:lectureId/questions", addQuestion);
router.post("/questions/:questionId/delete", deleteQuestion);

router.get(
  "/courses/:courseId/lectures/:lectureId/manageQuiz",
  getTeacherQuizOverview
);

export default router;
