import { Router } from "express";
import {
  getUserData,
  getUserDataEnrollments,
  updateUserDataEnrollments,
  getUserDataIsEnrolled,
  deleteUserDataEnrollment,
  updateUserDataLectureData,
  getUserDataLectureData,
} from "../controllers/userDataController.js";

const router = Router();

router.get("/userData/:id", getUserData);
router.get("/userData/:id/enrollments", getUserDataEnrollments);
router.get("/userData/:id/isEnrolled", getUserDataIsEnrolled);
router.patch("/userData/:id/addEnrollment", updateUserDataEnrollments);
router.delete("/userData/:id/deleteEnrollment", deleteUserDataEnrollment);
router.patch("/userData/:id/updateLectureData", updateUserDataLectureData);
router.get("/userData/:userId/lectureData/:lectureId", getUserDataLectureData);

export default router;
