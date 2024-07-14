import { model, Schema } from "mongoose";

const CourseSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    image: { type: String, required: false },
    isOpenToEnroll: { type: Boolean, required: true },
    semester: { type: String, required: true },
    lecturedBy: { type: Schema.ObjectId, ref: "User", required: true },
    lecturingDays: { type: Array, required: false },
    studyProgram: { type: Array, required: true },
  },
  { timestamps: true }
);

export const Course = model("Course", CourseSchema);
