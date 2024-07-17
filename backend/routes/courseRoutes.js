import { Router } from "express";
import {
  getCourses,
  getCourseById,
  setCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

const router = Router();

router.get("/courses", getCourses);
router.post("/courses", setCourse);
router.get("/courses/:courseId", getCourseById);
router.patch("/courses/:courseId", updateCourse);
router.delete("/courses/:courseId", deleteCourse);

export default router;
