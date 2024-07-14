import { model, Schema, Types } from "mongoose";

const QuizStudentAnswerSchema = new Schema(
  {
    lectureId: {
      type: Types.ObjectId,
      required: true,
      ref: "Lecture",
    },
    questionId: {
      type: Types.ObjectId,
      required: true,
      ref: "QuizQuestion",
    },
    studentId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    answeredCorrectly: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export const QuizStudentAnswer = model(
  "QuizStudentAnswer",
  QuizStudentAnswerSchema
);
