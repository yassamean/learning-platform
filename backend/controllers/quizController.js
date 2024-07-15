import {
  Course,
  Lecture,
  QuizQuestion,
  QuizStudentAnswer,
  User,
  UserData,
} from "../models/index.js";

export async function getQuizList(req, res) {
  try {
    const userId = req.query.userId;
    const user = await User.findById(userId);

    let courses = [];
    if (user.role === "teacher") {
      courses = await Course.find({ lecturedBy: userId });
    } else {
      const userData = await UserData.findOne({ userId }).populate(
        "enrollments"
      );
      courses = userData.enrollments || [];
    }

    const data = await courses.reduce(async (resultPromise, course) => {
      const result = await resultPromise;
      const quizList = await getQuizListForCourseData({ user, course });
      result[course.name] = quizList;
      return result;
    }, Promise.resolve({}));

    res.status(200).json(data);
  } catch (error) {
    console.error(`Error getting quiz list user ${req.query.userId}`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getQuizListForCourse(req, res) {
  const userId = req.query.userId;
  const courseId = req.params.courseId;

  const user = await User.findById(userId);
  const course = await Course.findById(courseId);

  try {
    const data = await getQuizListForCourseData({ user, course });
    res.status(200).json(data);
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

export async function submitStudentAnswer(req, res) {
  try {
    const questionId = req.params.questionId;
    const studentId = req.query.userId;
    const studentAnswer = req.body.answer;

    const question = await QuizQuestion.findById(questionId);
    if (!question) {
      throw new Error(`Question with ID ${questionId} not found`);
    }

    const correctAnswer = question.possibleAnswers.find(
      (answer) => answer.isCorrect
    );

    const answeredCorrectly = correctAnswer.answerText === studentAnswer;

    await QuizStudentAnswer.create({
      lectureId: question.lectureId,
      questionId,
      studentId,
      answeredCorrectly,
    });

    res.status(200).json({ answeredCorrectly });
  } catch (error) {
    console.error("Error submitting answer for student", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function nextQuizQuestion(req, res) {
  try {
    const lectureId = req.params.lectureId;
    const studentId = req.query.userId;

    const nextQuestion = await getNextQuizQuestion({ lectureId, studentId });

    // We don't want to send the correct answer info along
    // in case the student knows how to read network calls :)
    res.status(200).json({
      ...nextQuestion,
      possibleAnswers: nextQuestion.possibleAnswers.map(
        (answer) => answer.answerText
      ),
    });
  } catch (error) {
    console.error(
      `Error getting next question for lecture ${lectureId} for student ${studentId}`,
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

// --------------------
// ----- HELPERS ------
// --------------------
async function getQuizListForCourseData({ user, course }) {
  const lectures = await Lecture.find({ courseId: course._id }).populate(
    "questionCount"
  );

  let visibleLectures = lectures;
  if (user.role === "student") {
    const userData = await UserData.findOne({ userId: user._id });
    const watchedLectureIds = userData.lectureData.map((lecture) =>
      lecture.lectureId.toString()
    );

    visibleLectures = lectures.filter(
      (lecture) =>
        watchedLectureIds.includes(lecture._id.toString()) &&
        lecture.questionCount > 0
    );
  }

  return {
    courseId: course._id,
    courseName: course.name,
    lectureInfo: visibleLectures.map((lecture) => ({
      id: lecture._id,
      title: lecture.title,
      numQuestions: lecture.questionCount,
    })),
  };
}

async function getNextQuizQuestion({ lectureId, studentId }) {
  const allQuestions = await QuizQuestion.find({ lectureId });
  const allStudentAnswers = await QuizStudentAnswer.find({
    lectureId,
    studentId,
  });

  // { questionId: [Timestamp || null] }
  // If there is a timestamp, the question has been answered correctly before and
  // the time represents the most recent correct answer.
  // If there is no timestamp, it means the question has been answered before
  // but it was answered incorrectly.
  const mostRecentCorrectAnswers = allStudentAnswers.reduce(
    (result, studentAnswer) => {
      const questionId = studentAnswer.questionId.toString();
      const previousCorrectAnswerTime = result[questionId];

      if (studentAnswer.answeredCorrectly && previousCorrectAnswerTime) {
        result[questionId] =
          studentAnswer.createdAt > previousCorrectAnswerTime
            ? studentAnswer.createdAt
            : previousCorrectAnswerTime;
      } else if (answeredCorrectly) {
        result[questionId] = studentAnswer.createdAt;
      } else result[questionId] = null;
    },
    {}
  );

  // --------------------------------------------
  // Our basic "Spaced Repetition" algorithm
  // --------------------------------------------

  // 1. Get all questions that the student has NOT answered.
  // If there are any, return the earliest-created question.
  const unansweredQuestions = allQuestions
    .filter((question) => {
      const answeredQuestionIds = Object.keys(mostRecentCorrectAnswers);
      return !answeredQuestionIds.includes(question._id.toString());
    })
    .toSorted(sortQuestionByCreatedAt);

  console.log(`${unansweredQuestions.length} unanswered questions:`);
  console.log(unansweredQuestions);

  if (unansweredQuestions.length > 0) {
    return unansweredQuestions[0];
  }

  // 2. If all questions have been answered,
  // return a question that the student has answered but never gotten right.
  const questionNeverAnsweredCorrectly = Object.entries(
    mostRecentCorrectAnswers
  ).find((_, timestamp) => timestamp === null);
  console.log("Question never answered correctly:");
  console.log(questionNeverAnsweredCorrectly);
  if (questionNeverAnsweredCorrectly) {
    return allQuestions.find(
      (question) => question._id.toString() === questionNeverAnsweredCorrectly
    );
  }

  // 3. If user has answered all questions right,
  // return the question that was answered correctly the longest time ago.
  const questionsAnsweredCorrectly = Object.entries(mostRecentCorrectAnswers)
    .filter(([_, timestamp]) => timestamp)
    .toSorted(sortByTimestamp);

  console.log("Question answered correctly:");
  console.log(questionsAnsweredCorrectly);
  if (questionsAnsweredCorrectly) {
    return allQuestions.find(
      (question) => question._id.toString() === questionsAnsweredCorrectly[0][0]
    );
  }

  // 4. If we still haven't found anything, something has gone terribly wrong
  // but we'll just return the first question that exists
  return allQuestions[0];
}

function sortQuestionByCreatedAt(questionA, questionB) {
  if (questionA.createdAt < questionB.createdAt) {
    return -1;
  } else if (questionB.createdAt < questionA.createdAt) {
    return 1;
  }

  return 0;
}

function sortByTimestamp([_, timestampA], [_, timestampB]) {
  if (timestampA < timestampB) {
    return -1;
  } else if (timestampB < timestampA) {
    return 1;
  }

  return 0;
}
