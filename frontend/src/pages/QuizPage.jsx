// The Quiz Show page for Students.
// Displays the next question

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

import { useAuth } from "../context/UserContext";
import { API_BASE_URL } from "../config";

export default function QuizPage() {
  const params = useParams();
  const courseId = params.courseId;
  const lectureId = params.lectureId;

  const { user } = useAuth();

  const [questionData, setQuestionData] = useState(null);
  const [lectureName, setLectureName] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [lastQuestionResult, setLastQuestionResult] = useState(null);

  const [currentPerformancePercentage, setCurrentPerformancePercentage] =
    useState(19);
  const [totalCorrect, setTotalCorret] = useState(9);
  const [totalAsked, setTotalAsked] = useState(10);

  const questionTypeStyling = (questionType) => {
    switch (questionType) {
      case "REVIEW":
        return "border-red-500 bg-red-500";
      case "REPEAT":
        return "border-green-500 bg-green-500";
    }

    return "border border-gray-400 bg-gray-400";
  };

  const answerColorClasses = (answer) => {
    // During answer selection
    if (!showingAnswer) {
      return answer === selectedAnswer
        ? "border-blue-500 hover:border-color"
        : "";
    }

    // After answer submission
    if (answer === selectedAnswer) {
      return lastQuestionResult?.answeredCorrectly
        ? "border-green-500 bg-green-500 text-white hover:border-green-500"
        : "border-red-500 bg-red-500 text-white hover:border-red-500";
    } else {
      return answer === lastQuestionResult?.correctAnswer
        ? "border-green-500 hover:border-green-500"
        : "hover:border-gray-200";
    }
  };

  const resetState = () => {
    setQuestionData(null);
    setSelectedAnswer(null);
    setLastQuestionResult(null);
    setShowingAnswer(false);
  };

  const getNextQuestion = async () => {
    resetState();

    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/lectures/${lectureId}/nextQuestion?userId=${user.userId}`
      );
      const data = await response.json();
      setQuestionData(data);
      setLectureName(data.lectureId.title);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitAnswer = async () => {
    const response = await fetch(
      `${API_BASE_URL}/questions/${questionData._id}/answer?userId=${user.userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer: selectedAnswer }),
      }
    );
    const responseData = await response.json();
    setLastQuestionResult(responseData);
    setShowingAnswer(true);
  };

  useEffect(() => {
    getNextQuestion();
  }, []);

  return (
    <>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg dark:text-white dark:bg-slate-800">
        <div className="flex flex-col gap-3 place-items-center">
          {!questionData && <p>Loading...</p>}

          <h1 className="text-3xl font-semibold text-center mb-3">
            {lectureName}
          </h1>

          {questionData && (
            <>
              <div
                className={`rounded-lg w-fit text-white ${questionTypeStyling(
                  questionData.questionType
                )}`}
              >
                <p className="p-2 text-xs">{questionData.questionType}</p>
              </div>

              <h2 className="text-2xl font-semibold text-center mb-3">
                {questionData.questionText}
              </h2>
              <div
                className={
                  questionData?.possibleAnswers?.length > 3
                    ? "grid sm:grid-cols-2 grid-cols-1"
                    : "min-w-fit w-48"
                }
              >
                {questionData.possibleAnswers?.map((answer) => (
                  <div
                    key={answer}
                    onClick={() =>
                      showingAnswer ? null : setSelectedAnswer(answer)
                    }
                    className={`rounded-lg border-2 text-center w-38 p-4 m-3 hover:border-blue-500 ${
                      showingAnswer ? "" : "hover:cursor-pointer"
                    } ${answerColorClasses(answer)}`}
                  >
                    <span className="text">{answer}</span>
                  </div>
                ))}
              </div>

              {!showingAnswer && (
                <button
                  type="button"
                  className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:cursor-pointer disabled:bg-blue-600 disabled:cursor-not-allowed"
                  onClick={() => handleSubmitAnswer()}
                  disabled={!selectedAnswer}
                >
                  Submit
                </button>
              )}

              {showingAnswer && (
                <button
                  type="button"
                  className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:cursor-pointer disabled:bg-blue-600 disabled:cursor-not-allowed"
                  onClick={() => getNextQuestion()}
                >
                  Next
                </button>
              )}
              {!showingAnswer && questionData.lastShown && (
                <p className="italic text-xs">
                  Last seen: {new Date(questionData.lastShown).toLocaleString()}
                </p>
              )}
            </>
          )}
        </div>

        <Link to={`/courses/${courseId}/quizzes`} className="flex mt-8 gap-3">
          <ArrowUturnLeftIcon className="size-5" />
          Back to Quizzes Page
        </Link>
      </div>
      <div>
        <div className="grid grid grid-cols-2 mt-4 max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg dark:text-white dark:bg-slate-800">
          <div>
            <p>Current performance: {currentPerformancePercentage}%</p>
            {currentPerformancePercentage < 20 && (
              <p className="text-red-800 dark:text-red-400">
                Your performance has fallen below 20% of questions answered
                correctly. Perhaps you would like to{" "}
                <Link
                  to={`/courses/${courseId}/lectures/${lectureId}`}
                  className="underline font-bold hover:text-red-400 hover:dark:text-red-200"
                >
                  review the lecture material
                </Link>
                ?
              </p>
            )}
          </div>
          <div className="flex flex-col place-items-center">
            <h3 className="text-2xl"> 9/10</h3>
            <p>graded result</p>
          </div>
        </div>
        <p className="text-small mt-4 max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg dark:text-white dark:bg-slate-800">
          This quiz will repeat questions according to Spaced Repitition. You
          will always see new or questions you answered incorrectly first, and
          then you will be asked questions you've answered correctly for review
          purposes. However,{" "}
          <b>you will be graded on your first answer for each question.</b>
        </p>
      </div>
    </>
  );
}
