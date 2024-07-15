import { Course, User } from "../models/index.js";

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
      isOpenToEnroll: true,
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
