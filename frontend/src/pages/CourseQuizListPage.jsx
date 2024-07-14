import { useParams } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import StudentCourseQuizListPage from "./quizzes/students/StudentCourseQuizListPage";
import TeacherCourseQuizListPage from "./quizzes/teachers/TeacherCourseQuizListPage";

export default function CourseQuizListPage() {
  const { user } = useAuth();
  const params = useParams();

  return user.role === "student" ? (
    <StudentCourseQuizListPage courseId={params.courseId} />
  ) : (
    <TeacherCourseQuizListPage courseId={params.courseId} />
  );
}
