import {
  Course,
  Lecture,
  Student,
  QuizQuestion,
  QuizStudentAnswer,
  User,
} from "../models/index.js";

export async function getQuizListForCourse(req, res) {
  const courseId = req.params.courseId;
  const userId = req.query.userId;

  try {
    const user = await User.findById(userId);

    const response =
      user.role === "student"
        ? await getStudentQuizListForCourse({ courseId })
        : await getTeacherQuizListForCourse({ courseId });

    res.status(200).json(response);
  } catch (error) {
    console.error(`Error getting quiz list for course ${courseId}`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getStudentQuizListForCourse({ courseId }) {
  const course = await Course.findById(courseId);
  const lectures = await Lecture.find({ courseId }).populate("questionCount");

  // TODO
  return {};
}

async function getTeacherQuizListForCourse({ courseId }) {
  const course = await Course.findById(courseId);
  const lectures = await Lecture.find({ courseId }).populate("questionCount");

  return {
    courseId,
    courseName: course.name,
    lectureInfo: lectures.map((lecture) => ({
      id: lecture._id,
      title: lecture.title,
      numQuestions: lecture.questionCount,
    })),
  };
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

export async function getStudentQuizzesOverview(req, res) {
  try {
    const userId = req.params.userId;

    const courses = await Course.find({});
    const quizOverviewData = await Promise.all(
      courses.map(async (course) =>
        getQuizInfoForCourse({ userId, courseId: course._id })
      )
    );

    res.status(200).json(quizOverviewData);
  } catch (error) {
    console.error("Error fetching quiz overview data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// -------------------------------
// ----------- HELPERS -----------
// -------------------------------

async function getQuizInfoForCourse({ courseId, userId }) {
  const course = await Course.findById(courseId);
  const student = await Student.findOne({ userId });

  return {
    courseId: courseId,
    courseName: course.name,
    lectureQuizzes: getQuizInfoForVisibleLectures({
      student,
    }),
  };
}

async function getQuizInfoForVisibleLectures({ student }) {
  const lectures = await Lecture.find({
    _id: { $in: student.lecturesViewed },
  }).sort({
    title: 1,
  });

  lectures.reduce((res, lecture) => {
    res[lecture._id] = {
      lectureTitle: lecture.title,
      ...getStudentQuizInfoForLecture({
        student,
        lecture,
      }),
    };
  }, {});
}

async function getStudentQuizInfoForLecture({ student, lecture }) {
  const questions = await QuizQuestion.find({ lectureId: lecture._id });
  const answers = await QuizStudentAnswer.find({
    studentId: student._id,
    lectureId: lecture._id,
  });

  const numQuestions = questions.length;

  // TODO: When we do Spaced Repetition Algorithm,
  // there will be more than one correct Answer per question
  const numAnsweredCorrectly = answers.reduce(
    (res, answer) => (answer.answeredCorrectly ? res + 1 : res),
    0
  );

  // TODO: Actually implement this
  // const nextQuestion = nextUnansweredQuestion({ questions, answers });

  return {
    lectureId: lecture._id,
    lectureName: lecture.title,
    numQuestions,
    numAnsweredCorrectly,
    // nextQuestion:
    //   includeNextQuestion && nextQuestion
    //     ? {
    //         questionText: nextQuestion.questionText,
    //         possibleAnswers: nextQuestion.possibleAnswers,
    //       }
    //     : null,
  };
}

export async function getQuizInfoForLecture(req, res) {
  try {
    const userId = req.params.userId;
    const lectureId = req.params.lectureId;

    const user = await User.findById({ user });
    const lecture = await Lecture.findById(lectureId);

    let quizData = null;
    if (user.role === "teacher") {
      const QuizQuestions = await QuizQuestion.find({
        lectureId: lecture._id,
      });

      quizData = {
        lectureId: lecture._id,
        lectureName: lecture.title,
        QuizQuestions,
      };
    } else {
      const student = await Student.find({ userId });
      quizData = await getStudentQuizInfoForLecture({
        student,
        lecture,
        includeNextQuestion: true,
      });
    }

    res.status(200).json(quizData);
  } catch (error) {
    console.error("Error fetching quiz data for lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createQuiz(req, res) {
  try {
  } catch (error) {}
}

export async function updateQuiz(req, res) {
  try {
  } catch (error) {}
}

// function nextUnansweredQuestion({ questions, answers }) {
//   questions.forEach((question) => {
//     const correctAnswers = answers.select(
//       (answer) =>
//         answer.QuizQuestionId === question._id &&
//         answer.answeredCorrectly === true
//     );

//     if (correctAnswers.length === 0) {
//       return question;
//     }
//   });

//   return null;
// }
