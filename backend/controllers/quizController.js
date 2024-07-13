import {
  Course,
  Lecture,
  Student,
  QuizAnswer,
  QuizQuestion,
  QuizStudentAnswer,
  User,
} from "../models/index.js";

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
    const question = await QuizQuestion.findById(req.params.questionId)
      .populate({
        path: "lectureId",
        select: "title",
      })
      .populate("possibleAnswers");

    res.status(200).json(question);
  } catch (error) {
    console.error("Error creating quiz question", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function addQuestion(req, res) {
  try {
    const possibleAnswers = req.body.possibleAnswers;
    const possibleAnswerRecords = await QuizAnswer.insertMany(possibleAnswers);

    const question = await QuizQuestion.create({
      lectureId: req.params.lectureId,
      questionText: req.body.questionText,
      possibleAnswers: possibleAnswerRecords.map((answer) => answer._id),
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
    const existingPossibleAnswerIds = questionRecord.possibleAnswerIds;
    const updatedAnswers = req.body.possibleAnswers;

    const answersToDelete = existingPossibleAnswerIds.filter(
      (existingAnswerId) => {
        return !updatedAnswers.some(
          (updatedAnswer) => updatedAnswer?._id?.toString() == existingAnswerId
        );
      }
    );

    const { answersToUpdate, answersToCreate } = updatedAnswers.reduce(
      (result, answer) => {
        if (answer._id) {
          result.answersToUpdate.push(answer);
        } else {
          result.answersToCreate.push(answer);
        }
        return result;
      },
      { answersToUpdate: [], answersToCreate: [] }
    );

    QuizAnswer.deleteMany({
      id: { $in: answersToDelete.map((answer) => answer._id) },
    });

    const createdAnswers = await QuizAnswer.insertMany(answersToCreate, {
      ordered: false,
    });

    for (const answerToUpdate of answersToUpdate) {
      const { _id, ...updateFields } = answerToUpdate;
      await QuizAnswer.updateOne({ _id }, { $set: updateFields });
    }

    await questionRecord.updateOne({
      questionText: req.body.questionText,
      possibleAnswers: [
        ...answersToUpdate.map((answer) => answer._id),
        ...createdAnswers.map((answer) => answer._id),
      ],
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
    await QuizAnswer.deleteMany({
      _id: { $in: question.possibleAnswers },
    });
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

async function getStudentQuizInfoForLecture({
  student,
  lecture,
  includeNextQuestion = false,
}) {
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

// async function getTeacherQuizInfoForCourse({ courseId }) {
//   const course = await Course.findById(courseId);
//   return {
//     courseId: courseId,
//     courseTitle: course.title,
//     lectureQuizzes: getStudentQuizInfoForLecture({
//       student,
//       includeNextQuestion: false,
//     }),
//   };
// }

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

export async function getQuizzesForCourse(req, res) {
  try {
    const userId = req.params.userId;
    const courseId = req.params.courseId;

    const courseQuizData = await getQuizInfoForCourse({ courseId, userId });
    res.status(200).json(courseQuizData);
  } catch (error) {
    console.error("Error fetching quiz data for course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
