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
      ref: "Student",
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
