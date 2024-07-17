import { Router } from "express";
import { uploadFile, deleteFile } from "../controllers/uploadController.js";
const router = Router();

router.post("/upload", uploadFile);
router.delete("/delete", deleteFile);

export default router;
