import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userDataRoutes from "./routes/userDataRoutes.js";
import { connectToDatabase } from "./utils/db.js";

const app = express();

connectToDatabase();

app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(userRoutes);
app.use(courseRoutes);
app.use(lectureRoutes);
app.use(commentRoutes);
app.use(userDataRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
