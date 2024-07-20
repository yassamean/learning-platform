import { model, Schema } from "mongoose";

const LectureSchema = new Schema(
  {
    courseId: { type: Schema.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    videoUrl: {
      type: String,
      required: false,
    },
    pdfUrl: {
      type: String,
      required: false,
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LectureSchema.virtual("questionCount", {
  ref: "QuizQuestion",
  localField: "_id",
  foreignField: "lectureId",
  count: true,
});

LectureSchema.set("toJSON", { virtuals: true });
LectureSchema.set("toObject", { virtuals: true });

export const Lecture = model("Lecture", LectureSchema);
