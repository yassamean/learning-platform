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

const QuizQuestionSchema = new Schema(
  {
    lectureId: {
      type: Types.ObjectId,
      required: true,
      ref: "Lecture",
    },
    questionText: {
      type: String,
      required: true,
    },
    possibleAnswers: [QuizAnswerSchema],
  },
  { timestamps: true }
);

export const QuizQuestion = model("QuizQuestion", QuizQuestionSchema);
