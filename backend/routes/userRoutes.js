import { Router } from "express";
import {
	getUsers,
	updateUserRole,
	getStudentsByTeacherId,
} from "../controllers/userController.js";
import { verifyAdmin, verifyTeacher } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/users", verifyAdmin, getUsers);
router.patch("/users/:username/role", verifyAdmin, updateUserRole);
router.get("/:teacherId/students", verifyTeacher, getStudentsByTeacherId);

export default router;
