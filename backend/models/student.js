import { model, Schema, Types } from "mongoose";

const StudentSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  lecturesViewed: [{ type: Types.ObjectId, ref: "Lecture", defualt: [] }],
});

export const Student = model("Student", StudentSchema);
