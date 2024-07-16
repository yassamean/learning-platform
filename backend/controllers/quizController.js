import {
  Course,
  Lecture,
  QuizQuestion,
  QuizStudentAnswer,
  User,
  UserData,
} from "../models/index.js";

const NEW_QUESTION = "NEW QUESTION";
const REVIEW_QUESTION = "REVIEW";
const REPEAT_QUESTION = "REPEAT";

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
          correctAnswers: question.possibleAnswers.filter(
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

    const correctAnswers = question.possibleAnswers.filter(
      (answer) => answer.isCorrect
    );

    const answeredCorrectly = correctAnswers
      .map((answer) => answer.answerText)
      .includes(studentAnswer);

    await QuizStudentAnswer.create({
      lectureId: question.lectureId,
      questionId,
      studentId,
      answeredCorrectly,
    });

    res
      .status(200)
      .json({
        answeredCorrectly,
        correctAnswers: correctAnswers.map((answer) => answer.answerText),
      });
  } catch (error) {
    console.error("Error submitting answer for student", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function nextQuizQuestion(req, res) {
  const lectureId = req.params.lectureId;
  const studentId = req.query.userId;

  try {
    const studentAnswerSummary = await getQuizStudentAnswerSummary({
      lectureId,
      studentId,
    });

    const [questionType, nextQuestion, lastShown] = await getNextQuizQuestion({
      lectureId,
      studentAnswerSummary,
    });

    const {
      totalQuestionsInQuiz,
      totalAnswered,
      totalUniqueAnswered,
      gradedAnsweredCorrectly,
      performancePercentage,
    } = await getCurrentPerformance({ lectureId, studentAnswerSummary });

    // We don't want to send the correct answer info along
    // in case the student knows how to read network calls :)
    res.status(200).json({
      ...nextQuestion.toJSON(),
      questionType,
      lastShown,
      performanceData: {
        unansweredQuestions: totalQuestionsInQuiz - totalUniqueAnswered,
        totalAnswered,
        totalQuestionsInQuiz,
        gradedAnsweredCorrectly,
        performancePercentage,
      },
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

async function getNextQuizQuestion({ lectureId, studentAnswerSummary }) {
  const allQuestions = await QuizQuestion.find({ lectureId }).populate(
    "lectureId"
  );

  // --------------------------------------------
  // Our basic "Spaced Repetition" algorithm
  // --------------------------------------------

  // 1. Get all questions that the student has NOT answered.
  // If there are any, return the earliest-created question.
  const unansweredQuestions = allQuestions
    .filter((question) => {
      const answeredQuestionIds = Object.keys(studentAnswerSummary.questions);
      return !answeredQuestionIds.includes(question._id.toString());
    })
    .toSorted(sortQuestionByCreatedAt);

  if (unansweredQuestions.length > 0) {
    return [NEW_QUESTION, unansweredQuestions[0], null];
  }

  // 2. If all questions have been answered,
  // return a question that the student has answered but never gotten right.'
  const questionsNeverAnsweredCorrectly = Object.entries(
    studentAnswerSummary.questions
  ).filter(([_, { correct }]) => correct.length === 0);

  if (questionsNeverAnsweredCorrectly.length !== 0) {
    const { earliestQuestion, lastShown } =
      questionsNeverAnsweredCorrectly.reduce(
        (result, [questionId, { incorrect }]) => {
          const sortedIncorrectTimes = incorrect.toSorted();
          if (
            !result.earliestQuestion ||
            sortedIncorrectTimes[incorrect.length - 1] < result.lastShown
          ) {
            result.earliestQuestion = questionId;
            result.lastShown = sortedIncorrectTimes[incorrect.length - 1];
          }

          return result;
        },
        {}
      );

    return [
      REVIEW_QUESTION,
      allQuestions.find(
        (question) => question._id.toString() === earliestQuestion
      ),
      lastShown,
    ];
  }

  // 3. If user has answered all questions right,
  // return the question that was answered correctly the longest time ago.
  const questionsAnsweredCorrectly = Object.entries(
    studentAnswerSummary.questions
  ).filter(([_, { correct }]) => correct.length !== 0);

  if (questionsAnsweredCorrectly.length !== 0) {
    const { earliestQuestion, lastShown } = questionsAnsweredCorrectly.reduce(
      (result, [questionId, { correct }]) => {
        const sortedCorrectTimes = correct.toSorted();
        if (
          !result.earliestQuestion ||
          sortedCorrectTimes[correct.length - 1] < result.lastShown
        ) {
          result.earliestQuestion = questionId;
          result.lastShown = sortedCorrectTimes[correct.length - 1];
        }

        return result;
      },
      {}
    );

    return [
      REPEAT_QUESTION,
      allQuestions.find(
        (question) => question._id.toString() === earliestQuestion
      ),
      lastShown,
    ];
  }

  // 4. If we still haven't found anything, something has gone terribly wrong
  // but we'll just return the first question that exists
  return [NEW_QUESTION, allQuestions[0], null];
}

async function getCurrentPerformance({ lectureId, studentAnswerSummary }) {
  const totalQuestionsInQuiz = (await QuizQuestion.find({ lectureId })).length;

  // Number of unique questions have been answered
  const totalUniqueAnswered = Object.entries(
    studentAnswerSummary.questions
  ).length;

  // Number of times any question has been answered by the student, including repeats
  const totalAnswered =
    studentAnswerSummary.totalCorrect + studentAnswerSummary.totalIncorrect;

  // Number of questions answered correctly the first time
  const gradedAnsweredCorrectly = Object.entries(
    studentAnswerSummary.questions
  ).filter(
    ([_lectureId, { correct, incorrect }]) =>
      incorrect.length === 0 ||
      (correct.length > 0 && correct.toSorted()[0] < incorrect.toSorted()[0])
  ).length;

  // Percentage of correct answers, including repeat asks
  const performancePercentage =
    totalAnswered > 0
      ? ((studentAnswerSummary.totalCorrect / totalAnswered) * 100).toFixed(2)
      : "100";

  return {
    totalQuestionsInQuiz,
    totalAnswered,
    totalUniqueAnswered,
    gradedAnsweredCorrectly,
    performancePercentage,
  };
}

// {
//   totalCorrect: Int,
//   totalIncorrect: Int,
//   questionId: { correct: [Timestamp], incorrect: [Timestamp] },
// }
async function getQuizStudentAnswerSummary({ lectureId, studentId }) {
  const allStudentAnswers = await QuizStudentAnswer.find({
    lectureId,
    studentId,
  });

  const answerSummary = allStudentAnswers.reduce(
    (result, studentAnswer) => {
      const questionId = studentAnswer.questionId.toString();
      const prevAnswerData = result.questions[questionId];

      result.questions[questionId] = prevAnswerData
        ? prevAnswerData
        : { correct: [], incorrect: [] };

      if (studentAnswer.answeredCorrectly) {
        result.totalCorrect += 1;
        result.questions[questionId].correct = [
          ...result.questions[questionId].correct,
          studentAnswer.createdAt,
        ];
      } else {
        result.totalIncorrect += 1;
        result.questions[questionId].incorrect = [
          ...result.questions[questionId].incorrect,
          studentAnswer.createdAt,
        ];
      }

      return result;
    },
    { totalCorrect: 0, totalIncorrect: 0, questions: {} }
  );

  return answerSummary;
}

function sortQuestionByCreatedAt(questionA, questionB) {
  if (questionA.createdAt < questionB.createdAt) {
    return -1;
  } else if (questionB.createdAt < questionA.createdAt) {
    return 1;
  }

  return 0;
}
