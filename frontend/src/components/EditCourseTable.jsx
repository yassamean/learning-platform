import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TableRow = (props) => (
  <tr className="border-b hover:bg-muted/50 data-[state=selected]:bg-muted">
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.course.name}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.course.image}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.course.semester}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.course.studyProgram.toString()}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.course.isOpenToEnroll.toString()}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {props.course.updatedAt}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      <div className="flex gap-2">
        <Link
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 dark:hover:bg-sky-900 dark:hover:text-sky-400 h-9 rounded-md px-3"
          to={`/courses/${props.course._id}/edit`}
        >
          Edit
        </Link>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 dark:hover:bg-sky-900 dark:hover:text-sky-400 hover:text-accent-foreground h-9 rounded-md px-3"
          color="red"
          type="button"
          onClick={() => {
            props.deleteRecord(props._id);
          }}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function CourseTable() {
  const [courses, setCourses] = useState([]);

  // This method fetches the records from the database.
  useEffect(() => {
  async function getCourses() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/courses/`);
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      console.error(message);
      return;
    }
    const courses = await response.json();
    setCourses(courses);
  }
  getCourses();
  return;
}, [courses.length]);

  // This method will delete a record
  async function deleteCourse(id) {
  await fetch(`${import.meta.env.VITE_API_URL}/courses/${id}`, {
    method: "DELETE",
  });
  const newCourses = courses.filter((el) => el._id !== id);
  setCourses(newCourses);
}

  // This following section will display the table with the records of individuals.
  return (
    <div className="mx-auto max-w-7xl p-2 lg:px-8">
      <h3 className="text-lg font-semibold p-4 dark:text-slate-200">
        Course Data
      </h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm dark:text-slate-400 dark:bg-slate-800">
            <thead className="[&amp;_tr]:border-b">
              <tr className="border-b hover:bg-muted/50 data-[state=selected]:bg-muted dark:text-slate-200">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Image
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Semester
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Study Program
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Open
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Last Update
                </th>
              </tr>
            </thead>
            <tbody className="[&amp;_tr:last-child]:border-0">
              {courses.map((course) => {
                return (
                  <TableRow
                    course={course}
                    deleteCourse={() => deleteCourse(course._id)}
                    key={course._id}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
