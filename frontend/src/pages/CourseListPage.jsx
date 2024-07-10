import {
  ChevronDoubleRightIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/UserContext";

export default function CourseListPage({ search }) {
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    async function getCourses() {
      try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error(error);
      }
    }
    getCourses();
    async function getEnrollments() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/userData/${user.userDataId}/enrollments`
        );
        const data = await response.json();
        setEnrollments(data.enrollments);
      } catch (error) {
        console.error(error);
      }
    }
    getEnrollments();
  }, []);

  return (
    <div className="flex flex-col ">
      <div className="pt-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-200">
            Available Courses
          </h1>
          <h1 className="text-lg text-gray-900 dark:text-slate-400">
            Find a course you are interested in
          </h1>
        </div>
        <div>
          {["teacher", "admin"].includes(user.role) && (
            <Link to="/courses/create">
              <PlusCircleIcon className="size-8 dark:text-slate-200"></PlusCircleIcon>
            </Link>
          )}
        </div>
      </div>
      <ul role="list" className="flex flex-col grow gap-y-2 pt-5">
        {courses
          .filter((course) => (search ? course.name.includes(search) : course))
          .map((course) => (
            <Link
              to={`/courses/${course._id}`}
              key={course._id}
              className="flex cursor-pointer group rounded-lg p-5 bg-gray-50 hover:bg-gray-200 justify-between dark:hover:bg-sky-900 dark:bg-slate-800"
            >
              <div className="flex min-w-0 gap-x-4">
                <img
                  className="h-12 w-12 flex-none rounded-full"
                  src={"/course-pictures/" + course.image}
                  alt=""
                />
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-slate-200">
                    {course.name}
                  </p>
                  <p className="mt-1 truncate text-xs leading-5 text-gray-500 dark:text-slate-400">
                    {course.semester}
                  </p>
                </div>
              </div>
              <div className="flex gap-x-6">
                <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm leading-6 text-gray-900 dark:text-slate-400">
                    Updated {new Date(course.updatedAt).toLocaleString()}
                  </p>
                  {enrollments.includes(course._id) ? (
                    <div className="mt-1 flex items-center gap-x-1.5">
                      <div className="flex-none rounded-full bg-sky-500/20 p-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                      </div>
                      <p className="text-xs leading-5 text-gray-500 dark:text-slate-400">
                        Enrolled
                      </p>
                    </div>
                  ) : course.isOpenToEnroll ? (
                    <div className="mt-1 flex items-center gap-x-1.5">
                      <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <p className="text-xs leading-5 text-gray-500 dark:text-slate-400">
                        Open
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-x-1.5">
                      <div className="flex-none rounded-full bg-red-500/20 p-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      </div>
                      <p className="text-xs leading-5 text-gray-500 dark:text-slate-400">
                        Closed
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <ChevronDoubleRightIcon className="h-6 w-6 dark:text-slate-200 dark:group-hover:text-sky-400"></ChevronDoubleRightIcon>
                </div>
              </div>
            </Link>
          ))}
      </ul>
    </div>
  );
}
