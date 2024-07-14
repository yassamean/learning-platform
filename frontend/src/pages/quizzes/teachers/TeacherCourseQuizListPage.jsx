// All quizzes for a course,
// Links to page to manage the questions.
// Can be merged with student page eventually.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/UserContext";
import { API_BASE_URL } from "../../../config";

export default function TeacherCourseQuizListPage({ courseId }) {
  const [courseQuizInfo, setCourseQuizInfo] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    async function getCourseQuizInfo() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/courses/${courseId}/quizzes?userId=${user.userId}`
        );
        const data = await response.json();
        setCourseQuizInfo(data);
      } catch (error) {
        console.error(error);
      }
    }

    getCourseQuizInfo();
  }, []);

  return (
    <div className="flex flex-col ">
      <div className="pt-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-200">
            Quizzes{" "}
            {courseQuizInfo.courseName
              ? "for '" + courseQuizInfo.courseName + "'"
              : ""}
          </h1>
        </div>
      </div>
      <ul role="list" className="flex flex-col grow gap-y-2 pt-5">
        {courseQuizInfo?.lectureInfo?.map((lecture) => (
          <Link
            to={`/courses/${courseQuizInfo.courseId}/lectures/${lecture.id}/manageQuiz`}
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
      </ul>
    </div>
  );
}
