// The page for a Teacher to create or edit a question for a quiz.
// There is no "Quiz" model; a quiz is just made up of the QuizQuestions and Answers
// related to the given lecture.

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config";

export default function CreateQuizQuestionPage() {
  const navigate = useNavigate();
  const params = useParams();

  const [lectureName, setLectureName] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [possibleAnswers, setPossibleAnswers] = useState([
    { answerText: "", isCorrect: false },
  ]);
  const [error, setError] = useState("");

  const courseId = params.courseId;
  const lectureId = params.lectureId;
  const questionId = params.questionId;

  const handleQuestionTextChange = (e) => {
    setQuestionText(e.target.value);
  };

  const handleAnswerChange = (index, e) => {
    const newAnswers = [...possibleAnswers];
    newAnswers[index].answerText = e.target.value;
    setPossibleAnswers(newAnswers);
  };

  const handleCheckboxChange = (index) => {
    const newAnswers = [...possibleAnswers];
    newAnswers[index].isCorrect = !newAnswers[index].isCorrect;
    setPossibleAnswers(newAnswers);
  };

  const addAnswer = () => {
    setPossibleAnswers([...possibleAnswers, { text: "", isCorrect: false }]);
  };

  const deleteAnswer = (index) => {
    setPossibleAnswers(possibleAnswers.filter((_, i) => i !== index));
  };

  const isFormValid = () => {
    if (!questionText) return false;
    for (const answer of possibleAnswers) {
      if (!answer.answerText) return false;
    }
    return true;
  };

  useEffect(() => {
    async function getLecture() {
      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/lectures/${lectureId}`
      );
      const data = await response.json();
      setLectureName(data.title);
    }

    async function getQuestion() {
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}`);
      const data = await response.json();
      setLectureName(data.lectureTitle);
      setQuestionText(data.questionText);
      setPossibleAnswers(data.possibleAnswers);
    }

    if (questionId) {
      getQuestion();
    } else {
      getLecture();
    }
  }, [questionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const correctAnswers = possibleAnswers.filter((answer) => answer.isCorrect);
    if (correctAnswers.length !== 1) {
      setError("There must be exactly one correct answer.");
      return;
    }

    if (possibleAnswers.length <= 1) {
      setError("There must at least two possible answers");
      return;
    }

    if (
      new Set(possibleAnswers.map((answer) => answer.answerText)).size !==
      possibleAnswers.length
    ) {
      setError("Different answers cannot have the same text.");
      return;
    }

    const url = questionId
      ? `${API_BASE_URL}/questions/${questionId}`
      : `${API_BASE_URL}/courses/${courseId}/lectures/${lectureId}/questions`;

    const response = await fetch(url, {
      method: questionId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionText,
        possibleAnswers,
      }),
    });

    const data = await response.json();
    navigate(`/courses/${courseId}/lectures/${lectureId}/manageQuiz`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-10 space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-200">
            {params.questionId
              ? "Edit Question"
              : `Create a new Question ${
                  lectureName ? "for '" + lectureName + "'" : ""
                }`}
          </h1>{" "}
          <div className="flex flex-col mt-10 gap-x-6 gap-y-8">
            <div className="sm:col-span-4">
              <label
                htmlFor="questionText"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
              >
                Question text:
                <input
                  type="text"
                  name="questionText"
                  value={questionText}
                  onChange={handleQuestionTextChange}
                  className="w-full rounded-md py-2 pl-1 pr-4 text-gray-900 ring-1 ring-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-sky-400 dark:hover:bg-sky-900"
                  required
                />
              </label>
            </div>
            {possibleAnswers.map((answer, index) => (
              <div key={`answer-${index}`} className="flex g-2">
                <div className="sm:col-span-4">
                  <label
                    htmlFor={`answers[${index}]`}
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
                  >
                    Answer {index}:
                    <span className="flex gap-2 align-center">
                      <input
                        type="text"
                        name={`answers[${index}][answerText]`}
                        value={answer.answerText || ""}
                        className="w-full rounded-md py-2 pl-1 pr-4 text-gray-900 ring-1 ring-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-sky-400 dark:hover:bg-sky-900"
                        onChange={(e) => handleAnswerChange(index, e)}
                        required
                      />
                      <TrashIcon
                        onClick={() => deleteAnswer(index)}
                        className="h-6 w-6 hover:cursor-pointer"
                      />
                    </span>
                  </label>

                  <label
                    htmlFor={`answers[${index}]`}
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      name={`answers[${index}][isCorrect]`}
                      checked={answer.isCorrect || false}
                      className="mt-2 mr-2"
                      onChange={() => handleCheckboxChange(index)}
                    />
                    Correct
                  </label>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 dark:text-slate-200 shadow-sm dark:hover:bg-sky-900 dark:hover:text-sky-400 hover:bg-gray-300 hover:cursor-pointer"
                onClick={addAnswer}
              >
                New Answer
              </button>
              <button
                type="submit"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 dark:text-slate-200 shadow-sm dark:hover:bg-sky-900 dark:hover:text-sky-400 hover:bg-gray-300 hover:cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!isFormValid()}
              >
                Save
              </button>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </div>
      </div>
    </form>
  );
}
