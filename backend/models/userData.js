import { model, Schema } from "mongoose";

const UserDataSchema = new Schema(
  {
    userId: { type: Schema.ObjectId, ref: "User", required: true },
    enrollments: [{ type: Schema.ObjectId, ref: "Course", required: false }],
    lectureData: [
      {
        lectureId: { type: Schema.ObjectId, ref: "Lecture", required: true },
        watchTime: { type: Number },
        notes: { type: String },
        highlightedText: { type: Object },
        comments: [{ type: Schema.ObjectId, ref: "Comment" }],
      },
    ],
  },
  { collection: "userdata" }
);

export const UserData = model("UserData", UserDataSchema);
