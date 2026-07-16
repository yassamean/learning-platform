import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userDataRoutes from "./routes/userDataRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { connectToDatabase } from "./utils/db.js";

const app = express();

connectToDatabase();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());

app.use(authRoutes);
app.use(commentRoutes);
app.use(courseRoutes);
app.use(lectureRoutes);
app.use(quizRoutes);
app.use(userRoutes);
app.use(userDataRoutes);
app.use(uploadRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
