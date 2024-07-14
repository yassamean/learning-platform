import {
  Course,
  Lecture,
  QuizQuestion,
  User,
  UserData,
} from "../models/index.js";

export async function getQuizListForCourse(req, res) {
  const courseId = req.params.courseId;
  const userId = req.query.userId;

  try {
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    const lectures = await Lecture.find({ courseId }).populate("questionCount");

    let visibleLectures = lectures;
    if (user.role === "student") {
      const userData = await UserData.findOne({ userId: userId });

      const watchedLectureIds = userData.lectureData.map((lecture) =>
        lecture.lectureId.toString()
      );

      visibleLectures = lectures.filter(
        (lecture) =>
          watchedLectureIds.includes(lecture._id.toString()) &&
          lecture.questionCount > 0
      );
    }

    res.status(200).json({
      courseId,
      courseName: course.name,
      lectureInfo: visibleLectures.map((lecture) => ({
        id: lecture._id,
        title: lecture.title,
        numQuestions: lecture.questionCount,
      })),
    });
  } catch (error) {
    console.error(`Error getting quiz list for course ${courseId}`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTeacherQuizOverview(req, res) {
  try {
    const lectureId = req.params.lectureId;

    const lecture = await Lecture.findById(lectureId);

    const questions = await QuizQuestion.find({
      lectureId: lectureId,
    }).populate("possibleAnswers");
    const questionsData = questions.reduce(
      (result, question) => [
        ...result,
        {
          id: question._id,
          questionText: question.questionText,
          numAnswers: question.possibleAnswers.length,
          correctAnswer: question.possibleAnswers.find(
            (answer) => answer.isCorrect
          ),
        },
      ],
      []
    );

    res.status(200).json({ lectureTitle: lecture.title, questionsData });
  } catch (error) {
    console.error("Error creating quiz question", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getQuestion(req, res) {
  try {
    const question = await QuizQuestion.findById(
      req.params.questionId
    ).populate({
      path: "lectureId",
      select: "title",
    });

    res.status(200).json(question);
  } catch (error) {
    console.error("Error creating quiz question", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function addQuestion(req, res) {
  try {
    const possibleAnswers = req.body.possibleAnswers;

    const question = await QuizQuestion.create({
      lectureId: req.params.lectureId,
      questionText: req.body.questionText,
      possibleAnswers: possibleAnswers,
    });

    res.status(200).json(question);
  } catch (error) {
    console.error("Error creating quiz question", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateQuestion(req, res) {
  try {
    const questionRecord = await QuizQuestion.findById(req.params.questionId);

    await questionRecord.updateOne({
      questionText: req.body.questionText,
      possibleAnswers: req.body.possibleAnswers,
    });

    res.status(200).json(questionRecord);
  } catch (error) {
    console.error("Error creating quiz question", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteQuestion(req, res) {
  try {
    const questionId = req.params.questionId;

    const question = await QuizQuestion.findOne({ _id: questionId });
    await question.deleteOne();

    res.status(200).json({});
  } catch (error) {
    console.error("Error deleting quiz question", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
