import { model, Schema } from "mongoose";
import { Course } from "./course.js";

const LectureSchema = new Schema(
  {
    courseId: { type: Schema.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    videoUrl: { type: String, required: false },
    thumbnailUrl: { type: String, required: false },
    pdfUrl: { type: String, required: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// set updatedat value of course to new date when lecture gets saved
LectureSchema.pre("save", async function (next) {
  const lecture = this;
  // Check if the course already exists
  const course = await Course.findById(lecture.courseId);
  course.updatedAt = new Date();
  await course.save();

  next();
});

LectureSchema.virtual("questionCount", {
  ref: "QuizQuestion",
  localField: "_id",
  foreignField: "lectureId",
  count: true,
});

LectureSchema.set("toJSON", { virtuals: true });
LectureSchema.set("toObject", { virtuals: true });

export const Lecture = model("Lecture", LectureSchema);
