import { model, Schema, Types } from "mongoose";

const QuizAnswerSchema = new Schema({
  answerText: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export const QuizAnswer = model("QuizAnswer", QuizAnswerSchema);
