import { useParams } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUturnLeftIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config";

export default function QuizCourseListPage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.courseId;

  const [courseQuizInfo, setCourseQuizInfo] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);

  const noLectures = dataLoaded && courseQuizInfo?.lectureInfo?.length === 0;
  const noLecturesMessage =
    user.role === "student"
      ? "No quizzes available. Watch a lecture to unlock the lecture's quiz (note: some lectures may not have an accompanying quiz)."
      : "This course doesn't have any lectures yet. Create a lecture, then you can manage quizzes for that lecture.";

  useEffect(() => {
    async function getCourseQuizInfo() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/courses/${courseId}/quizzes?userId=${user.userId}`
        );
        const data = await response.json();
        setCourseQuizInfo(data);
        setDataLoaded(true);
      } catch (error) {
        console.error(error);
      }
    }

    getCourseQuizInfo();
  }, []);

  return (
    <div className="flex flex-col ml-3 gap-5  dark:text-white">
      <div className="pt-10 flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-200">
          Quizzes{" "}
          {courseQuizInfo.courseName
            ? "for '" + courseQuizInfo.courseName + "'"
            : ""}
        </h1>
        {!dataLoaded && <p>Loading quizzes...</p>}
        {noLectures && <p>{noLecturesMessage}</p>}
        {noLectures && user.role === "teacher" && (
          <Link
            to={`/courses/${courseId}/lectures/create`}
            className="w-fit px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
          >
            Add Lecture
          </Link>
        )}
      </div>

      <ul role="list" className="flex flex-col grow gap-y-2 ">
        {courseQuizInfo?.lectureInfo?.map((lecture) => (
          <Link
            to={`/courses/${courseQuizInfo.courseId}/lectures/${lecture.id}/${
              user.role === "teacher" ? "manageQuiz" : "quiz"
            }`}
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
      {dataLoaded && (
        <div>
          <Link
            to={`/courses/${courseQuizInfo.courseId}/`}
            className="flex gap-2"
          >
            <ArrowUturnLeftIcon className="size-5" />
            Back to Course Page
          </Link>
        </div>
      )}
    </div>
  );
}
