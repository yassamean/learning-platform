// The page for a Teacher to see all and manage questions for a Quiz.

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config";

export default function QuizManagePage() {
  const navigate = useNavigate();
  const params = useParams();
  const [deleteQuestionFailed, setDeleteQuestionFailed] = useState(false);
  const [quizData, setQuizData] = useState({});

  const courseId = params.courseId;

  const deleteQuestion = async (questionId) => {
    setDeleteQuestionFailed(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/questions/${questionId}/delete`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        setDeleteQuestionFailed(true);
        const message = `An error has occurred: ${response.statusText}`;
        console.error(message);
      } else {
        setQuizData({
          lectureTitle: quizData.lectureTitle,
          questionsData: quizData.questionsData.filter(
            (question) => question.id != questionId
          ),
        });
      }
    } catch (e) {
      setDeleteQuestionFailed(true);
    }
  };

  useEffect(() => {
    async function fetchQuizData() {
      const lectureId = params.lectureId;
      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/lectures/${lectureId}/manageQuiz`
      );
      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        console.error(message);
        return;
      }

      const quizData = await response.json();
      setQuizData({ ...quizData });
    }

    fetchQuizData();
    return;
  }, [params.id, navigate]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {deleteQuestionFailed ? (
        <span className="text-red-700">
          Sorry, we couldn't delete the question.
        </span>
      ) : null}
      <div className="flex flex-col gap-2 place-items-center">
        <h2 className="text-2xl font-semibold text-center">Manage Quiz</h2>
        <Link to={`/courses/${params.courseId}/lectures/${params.lectureId}`}>
          <h2 className="text-xl hover:text-blue-500">
            {quizData.lectureTitle}
          </h2>
        </Link>
        <Link
          to={`/courses/${params.courseId}/lectures/${params.lectureId}/questions`}
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
        >
          Add question
        </Link>
      </div>
      <ul className="space-y-4">
        {quizData?.questionsData?.map((question, index) => (
          <li
            key={index}
            className="p-4 border border-gray-300 rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-medium mb-2">
              {question.questionText}
            </h3>
            <p className="mb-4">{question.numAnswers} possible answers</p>
            <p className="mb-4">
              <b>Correct answer: </b>
              {question?.correctAnswer?.answerText}
            </p>

            <Link
              to={`/courses/${params.courseId}/lectures/${params.lectureId}/questions/${question.id}`}
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-4"
            >
              Edit Question
            </Link>
            <button
              onClick={() => deleteQuestion(question.id)}
              className="inline-block px-4 py-2 text-white rounded-lg bg-red-700 hover:bg-red-900 mr-4"
            >
              Delete Question
            </button>
          </li>
        ))}
      </ul>
      <Link to={`/courses/${courseId}/quizzes`} className=" flex mt-4 gap-3">
        <ArrowUturnLeftIcon className="size-5" />
        Back to Quizzes Page
      </Link>
    </div>
  );
}
