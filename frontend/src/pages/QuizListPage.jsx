import { useParams } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config";

export default function QuizListPage() {
  const { user } = useAuth();
  const [quizzesInfo, setQuizzesInfo] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);

  const noQuizzesMessage =
    user.role === "teacher"
      ? "You don't seem to be teaching any courses, or your courses don't contain any lectures. Create a lecture so you can begin adding Quiz questions."
      : "No quizzes available. Watch a lecture to unlock the lecture's quiz (note: some lectures may not have an accompanying quiz).";

  useEffect(() => {
    async function getQuizzesInfo() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/quizzes?userId=${user.userId}`
        );
        const data = await response.json();
        setQuizzesInfo(data);
        setDataLoaded(data);
      } catch (error) {
        console.error(error);
      }
    }

    getQuizzesInfo();
  }, []);

  return (
    <div className="flex flex-col ml-4">
      <div className="pt-10 flex items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-200">
          Quizzes Overview
        </h1>
      </div>
      {dataLoaded && Object.keys(quizzesInfo).length === 0 && (
        <p className="mt-2">{noQuizzesMessage}</p>
      )}
      {!dataLoaded && <p className="mt-2">Loading quizzes...</p>}
      <ul role="list" className="flex flex-col grow gap-y-2 pt-5">
        {quizzesInfo &&
          Object.entries(quizzesInfo).map(([courseName, info]) => (
            <div>
              <h2 className="text-xl font-bold pb-3">{courseName}</h2>
              {info?.lectureInfo?.map((lecture) => (
                <Link
                  to={`/courses/${quizzesInfo.courseId}/lectures/${
                    lecture.id
                  }/${user.role === "teacher" ? "manageQuiz" : "quiz"}`}
                  key={lecture.id}
                  className="flex cursor-pointer group rounded-lg p-5 bg-gray-50 hover:bg-gray-200 justify-between dark:hover:bg-sky-900 dark:bg-slate-800"
                >
                  <div className="flex min-w-0 gap-x-4">
                    <div className="flex min-w-0 gap-3">
                      <p className="text-lg font-semibold leading-6 text-gray-900 dark:text-slate-200">
                        {lecture.title}
                      </p>
                      <PencilSquareIcon className="size-6 dark:text-slate-200" />
                    </div>
                  </div>
                  <div className="flex gap-x-6">
                    <div className="flex flex-col items-end">
                      <p className="text-sm leading-6 text-gray-900 dark:text-slate-400">
                        {lecture.numQuestions} questions
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
      </ul>
    </div>
  );
}
