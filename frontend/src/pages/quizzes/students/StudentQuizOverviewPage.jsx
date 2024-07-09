// The page Students see when they go to the
// dropdown menu and go to "My Quizzes", which displays
// all the quizzes by lecture/course with stats
// Students will see stats on how many they've got right so far, etc

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/UserContext";
import { API_BASE_URL } from "../../../config";

import { Link } from "react-router-dom";

export default function StudentQuizOverviewPage() {
  const [quizOverview, setQuizOverview] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    async function getQuizzes() {
      try {
        const response = await fetch(`${API_BASE_URL}/quizzes/${user.userId}`);
        const data = await response.json();
        setQuizOverview(data);
      } catch (error) {
        console.error(error);
      }
    }
    getQuizzes();
  }, []);

  return (
    <div className="flex flex-col ">
      <div className="pt-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-200">
            Available Quizzes
          </h1>
        </div>
      </div>
      <ul role="list" className="flex flex-col grow gap-y-2 pt-5">
        {quizOverview.map(({ courseId, courseName, lectureQuizzes }) => (
          <div key={courseId}>
            <h2 className="text-xl">{courseName}</h2>
            {Object.entries(lectureQuizzes).map((lectureId, values) => (
              <Link
                to={`/courses/${courseId}/lectures/${lectureId}?userId=${user.userId}`}
                key={lectureId}
                className="flex cursor-pointer group rounded-lg p-5 bg-gray-50 hover:bg-gray-200 justify-between dark:hover:bg-sky-900 dark:bg-slate-800"
              >
                <h3>values</h3>
              </Link>
            ))}
          </div>
        ))}
      </ul>
    </div>
  );
}
