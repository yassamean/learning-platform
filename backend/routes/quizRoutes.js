import { Router } from "express";
import {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getStudentQuizzesOverview,
  getTeacherQuizOverview,
} from "../controllers/quizController.js";

const router = Router();

// For students
router.get("/quizzes/:userId", getStudentQuizzesOverview);
// router.post("/courses/:courseId/lectures/:lectureId/quiz/answer", addAnswer);

// For teachers
router.post("/courses/:courseId/lectures/:lectureId/question", addQuestion);
router.patch("/question/:questionId", updateQuestion);
router.post("/question/:questionId/delete", deleteQuestion);

router.get(
  "/courses/:courseId/lectures/:lectureId/manageQuiz",
  getTeacherQuizOverview
);

export default router;
