import { Lecture } from "../models/lecture.js";

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
    res.status(200).json(lecture);
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
  } catch (error) {
    console.error("Error updating lecture:", error);
    res.status(500).json({ message: "Internal server error" });
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
