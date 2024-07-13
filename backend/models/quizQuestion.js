import { model, Schema, Types } from "mongoose";

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
    possibleAnswers: [{ type: Types.ObjectId, ref: "QuizAnswer" }],
  },
  { timestamps: true }
);

QuizQuestionSchema.virtual("possibleAnswerIds").get(function () {
  return this.possibleAnswers.map((answer) => (answer._id ? answer._id : null));
});

QuizQuestionSchema.set("toJSON", { virtuals: true });
QuizQuestionSchema.set("toObject", { virtuals: true });

export const QuizQuestion = model("QuizQuestion", QuizQuestionSchema);
