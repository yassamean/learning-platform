import {
  AcademicCapIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowPathIcon,
  AtSymbolIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useAuth } from "../context/UserContext";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";
import VideoCard from "../components/VideoCard";
import { formatDistanceToNow } from "date-fns";
import { Tooltip } from "react-tooltip";

function CoursePage() {
  const params = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState({});
  const [lectures, setLectures] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const courseId = params.courseId.toString();

  useEffect(() => {
    async function getCourse() {
      try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error(error);
      }
    }
    getCourse();

    if (user.role === "student") {
      getEnrollmentStatus();
    } else {
      setIsEnrolled(true);
      getLectures();
    }
  }, [isEnrolled]);

  async function getLectures() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/lectures`
      );
      const data = await response.json();
      setLectures(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function getEnrollmentStatus() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/userData/${user.userDataId}/enrollments`
      );
      const data = await response.json();
      if (data.enrollments?.includes(courseId)) {
        setIsEnrolled(true);
        getLectures();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function addToEnrollments() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/userData/${user.userDataId}/addEnrollment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId }),
        }
      );
      const data = await response.json();
      if (data.enrollments.includes(courseId)) {
        setIsEnrolled(true);
        getLectures();
      }
    } catch (error) {
      console.error("Error during enrollment:", error);
    }
  }

  async function deleteEnrollment() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/userData/${user.userDataId}/deleteEnrollment`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId }),
        }
      );
      const data = await response.json();
      setIsEnrolled(false);
    } catch (error) {
      console.error("Error during enrollment deletion:", error);
    }
  }

  return !course ? (
    <div className="pt-6 dark:text-slate-200">
      <p>Loading Coursepage...</p>
    </div>
  ) : isEnrolled ? (
    <>
      <div className="flex justify-between">
        <div>
          <h1 className="text-lg pt-10 text-gray-900 dark:text-slate-400">
            Welcome to
          </h1>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-200">
            {course.name}
          </h1>
          {["teacher"].includes(user.role) ? (
            <Link
              className="flex gap-2 place-items-center mt-2 dark:text-slate-300"
              to={`/courses/${courseId}/quizzes`}
            >
              <ListBulletIcon className="size-6 dark:text-slate-200" />
              Manage Quizzes
            </Link>
          ) : null}
        </div>
        <div className="flex items-end gap-2">
          {["teacher", "admin"].includes(user.role) && (
            <>
              <Link to={`/courses/${courseId}/edit`} className="">
                <PencilSquareIcon className="editCourseButton size-8 dark:text-slate-200"></PencilSquareIcon>
                <Tooltip anchorSelect=".editCourseButton">
                  Edit course data
                </Tooltip>
              </Link>
              <Link to={`/courses/${courseId}/lectures/create`}>
                <PlusCircleIcon className="addLectureButton size-8 dark:text-slate-200"></PlusCircleIcon>
                <Tooltip anchorSelect=".addLectureButton">
                  Create a new lecture
                </Tooltip>
              </Link>
            </>
          )}
          {isEnrolled && (
            <>
              <button className="deleteEnrollmentButton">
                <ArrowLeftStartOnRectangleIcon
                  className="size-8 text-red-500"
                  onClick={deleteEnrollment}
                ></ArrowLeftStartOnRectangleIcon>
              </button>
              <Tooltip anchorSelect=".deleteEnrollmentButton">
                Revoke enrollment
              </Tooltip>
            </>
          )}
        </div>
      </div>
      <div className="mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-lg mb-2 font-bold dark:text-slate-200">
              Watch the latest Lecture
            </div>
            {lectures.at(0) && (
              <VideoCard
                path={`/courses/${courseId}/lectures/${lectures.at(0)._id}
              `}
                data={lectures.at(0)}
              ></VideoCard>
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold dark:text-slate-200">
              Course Information
            </h1>
            <div className="flex flex-col pt-2 gap-y-2">
              <div className="flex p-4 gap-x-4 bg-gray-50 dark:bg-slate-800 dark:text-slate-200 items-center rounded-lg">
                <AcademicCapIcon className="h-6 w-6" />
                <div className="">
                  Lectured by:{" "}
                  <span className="font-bold">
                    {course.lecturedBy?.username}
                  </span>
                </div>
              </div>
              <div className="flex p-4 gap-x-4 bg-gray-50 dark:bg-slate-800 dark:text-slate-200  items-center rounded-lg">
                <AtSymbolIcon className="h-6 w-6" />
                <div className="">
                  Contact:{" "}
                  <span className="font-bold">{course.lecturedBy?.email}</span>
                </div>
              </div>
              <div className="flex p-4 gap-x-4 bg-gray-50 dark:bg-slate-800 dark:text-slate-200  items-center rounded-lg">
                <CalendarDaysIcon className="h-6 w-6" />
                <div className="">
                  Lecturing days:{" "}
                  <span className="font-bold">
                    {course.lecturingDays?.join(", ")}
                  </span>
                </div>
              </div>
              <div className="flex p-4 gap-x-4 bg-gray-50 dark:bg-slate-800 dark:text-slate-200  items-center rounded-lg">
                <PuzzlePieceIcon className="h-6 w-6" />
                <div className="">
                  Quizpage:{" "}
                  <Link
                    className="font-bold text-blue-600 dark:text-blue-300 dark:hover:text-blue-600"
                    to={`/courses/${courseId}/quizzes`}
                  >
                    Link
                  </Link>
                </div>
              </div>
              <div className="flex p-4 gap-x-4 bg-gray-50 dark:bg-slate-800 dark:text-slate-200  items-center rounded-lg">
                <ArrowPathIcon className="h-6 w-6" />
                <div className="">
                  Last Updated:{" "}
                  <span className="font-bold">
                    {course.updatedAt
                      ? formatDistanceToNow(new Date(course.updatedAt), {
                          addSuffix: true,
                        })
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 text-lg font-bold dark:text-slate-200">
          Course Description
        </div>
        <div className="flex  p-4 gap-x-4 bg-gray-50 dark:bg-slate-800 dark:text-slate-200 items-start rounded-lg">
          <BookOpenIcon className="min-w-6 size-6"></BookOpenIcon>
          <div className="grow whitespace-pre-wrap">{course.description}</div>
        </div>
      </div>
      <div className="mt-5">
        <div className="text-lg font-bold dark:text-slate-200">
          All Lectures
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {lectures.map((lecture) => (
            <VideoCard
              key={lecture._id}
              path={`/courses/${courseId}/lectures/${lecture._id}
          `}
              data={lecture}
            ></VideoCard>
          ))}
        </div>
      </div>
    </>
  ) : (
    <div className="bg-white mt-10 p-8 rounded-lg border mx-auto max-w-md">
      <h1 className="text-xl mb-6 text-center">
        Missing enrollment for course:
      </h1>
      <h1 className="text-2xl font-bold mb-6 text-center">{course.name}</h1>
      {course.isOpenToEnroll ? (
        <div>
          <p>
            You are not enrolled to this course. Enroll now to start learning
            and gain access to all the course materials.
          </p>
          <button
            className="w-full mt-10 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            onClick={addToEnrollments}
          >
            Enroll
          </button>
        </div>
      ) : (
        <div>Sadly this course is currently closed for enrollment.</div>
      )}
    </div>
  );
}

export default CoursePage;
