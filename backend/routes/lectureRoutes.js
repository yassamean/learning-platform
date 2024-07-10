import { Router } from "express";
import {
  getLecturesByCourse,
  getLectureById,
  setLecture,
  updateLecture,
  increaseViewCount,
} from "../controllers/lectureController.js";

const router = Router();

router.get("/courses/:courseId/lectures", getLecturesByCourse);
router.post("/courses/:courseId/lectures", setLecture);
router.get("/courses/:courseId/lectures/:lectureId", getLectureById);
router.patch("/courses/:courseId/lectures/:lectureId", updateLecture);
router.patch("/:lectureId/increaseViewCount", increaseViewCount);

export default router;
