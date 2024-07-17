import { Lecture } from "../models/lecture.js";
import { QuizQuestion } from "../models/quizQuestion.js";
import { UserData } from "../models/userData.js";
import { Comment } from "../models/comment.js";
import { Course } from "../models/course.js";
import { del } from "@vercel/blob";

export async function getLecturesByCourse(req, res) {
  try {
    const lectures = await Lecture.find({ courseId: req.params.courseId }).sort(
      {
        updatedAt: -1,
      }
    );
    res.status(200).json(lectures);
  } catch (error) {
    console.error("Error fetching lectures:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getLectureById(req, res) {
  const lectureId = req.params.lectureId;
  try {
    const lecture = await Lecture.findById(lectureId);
    const quizQuestions = await QuizQuestion.find({ lectureId });
    res.status(200).json({
      ...lecture.toJSON(),
      hasQuiz: quizQuestions.length > 0,
    });
  } catch (error) {
    console.error("Error fetching lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function setLecture(req, res) {
  try {
    const lecture = await Lecture.create({
      courseId: req.params.courseId,
      title: req.body.title,
      description: req.body.description,
      videoUrl: req.body.videoUrl,
      thumbnailUrl: req.body.thumbnailUrl,
      pdfUrl: req.body.pdfUrl,
    });
    res.status(200).json(lecture);

    // set updatedat value of course to new date when lecture gets created
    const course = await Course.findById(lecture.courseId);
    course.updatedAt = new Date();
    await course.save();
  } catch (error) {
    console.error("Error setting lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateLecture(req, res) {
  try {
    const lecture = await Lecture.findById(req.params.lectureId);
    (lecture.title = req.body.title),
      (lecture.description = req.body.description),
      (lecture.videoUrl = req.body.videoUrl),
      (lecture.thumbnailUrl = req.body.thumbnailUrl),
      (lecture.pdfUrl = req.body.pdfUrl),
      lecture.save();
    res.status(200).json(lecture);
    // set updatedat value of course to new date when lecture gets created
    const course = await Course.findById(lecture.courseId);
    course.updatedAt = new Date();
    await course.save();
  } catch (error) {
    console.error("Error updating lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteLecture(req, res) {
  const id = req.params.lectureId;
  try {
    const lecture = await Lecture.findByIdAndDelete(id);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }
    await UserData.updateMany(
      {},
      { $pull: { lectureData: { lectureId: id } } }
    );
    await Comment.deleteMany({ lectureId: id });
    if (lecture.videoUrl.includes("public.blob.vercel-storage.com")) {
      await del(lecture.videoUrl);
    }
    if (lecture.pdfUrl.includes("public.blob.vercel-storage.com")) {
      await del(lecture.pdfUrl);
    }

    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

export async function increaseViewCount(req, res) {
  try {
    const lecture = await Lecture.findById(req.params.lectureId);
    lecture.views += 1;
    lecture.save({ timestamps: false });
    res.status(200).json(lecture);
  } catch (error) {
    console.error("Error increasing view count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
