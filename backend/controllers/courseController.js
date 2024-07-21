import { Course, User } from "../models/index.js";
import { Lecture } from "../models/index.js";
import { UserData } from "../models/index.js";
import { Comment } from "../models/index.js";
import { del } from "@vercel/blob";

export async function getCourses(req, res) {
  try {
    const userId = req.query.userId;
    const user = await User.findById(userId);

    const courses =
      user.role === "teacher"
        ? await Course.find({ lecturedBy: user._id })
        : await Course.find({});

    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getCourseById(req, res) {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findById(courseId).populate({
      path: "lecturedBy",
      select: "username email",
    });
    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function setCourse(req, res) {
  try {
    const course = await Course.create({
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      semester: req.body.semester,
      lecturedBy: req.body.lecturedBy,
      lecturingDays: req.body.lecturingDays,
      studyProgram: req.body.studyProgram,
      isOpenToEnroll: req.body.isOpenToEnroll,
    });
    res.status(200).json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateCourse(req, res) {
  try {
    const course = await Course.findById(req.params.courseId);
    (course.name = req.body.name),
      (course.description = req.body.description),
      (course.image = req.body.image),
      (course.semester = req.body.semester),
      (course.lecturedBy = req.body.lecturedBy),
      (course.lecturingDays = req.body.lecturingDays),
      (course.studyProgram = req.body.studyProgram),
      (course.isOpenToEnroll = req.body.isOpenToEnroll),
      course.save();

    res.status(200).json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteCourse(req, res) {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findByIdAndDelete(courseId);
    const lectures = await Lecture.find({ courseId: course._id });
    for (let lecture of lectures) {
      const lect = await Lecture.findByIdAndDelete(lecture._id);

      if (!lect) {
        return res.status(404).json({ message: "Lecture not found" });
      }
      await UserData.updateMany(
        {},
        { $pull: { lectureData: { lectureId: lect._id } } }
      );
      await Comment.deleteMany({ lectureId: lect._id });

      if (lect.videoUrl.includes("public.blob.vercel-storage.com")) {
        await del(lect.videoUrl);
      }
      if (lect.pdfUrl.includes("public.blob.vercel-storage.com")) {
        await del(lect.pdfUrl);
      }
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
}
