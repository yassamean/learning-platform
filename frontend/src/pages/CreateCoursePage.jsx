import { useAuth } from "../context/UserContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import {
  ArrowUpOnSquareIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();

  const [semesterInfo, setSemesterInfo] = useState([]);
  const [isNew, setIsNew] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    semester: "",
    studyProgram: [],
    lecturedBy: "",
    lecturingDays: [],
    isOpenToEnroll: true,
  });

  const daysOfWeek = [
    { name: "Monday", value: "Monday" },
    { name: "Tuesday", value: "Tuesday" },
    { name: "Wednesday", value: "Wednesday" },
    { name: "Thursday", value: "Thursday" },
    { name: "Friday", value: "Friday" },
    { name: "Saturday", value: "Saturday" },
    { name: "Sunday", value: "Sunday" },
  ];

  const studyPrograms = [
    "Informatik",
    "Wirtschaftsinformatik",
    "Wirtschaftswissenschaften",
    "Mathematik",
    "Physik",
    "Biologie",
    "Germanistik",
    "Philosophie",
  ];

  const handleRandomImage = () => {
    const randomImage = `${Math.floor(Math.random() * 16)}.svg`;
    updateForm({ image: randomImage });
  };

  const handleDayChange = (event) => {
    const value = event.target.value;
    setForm((prevForm) => ({
      ...prevForm,
      lecturingDays: prevForm.lecturingDays.includes(value)
        ? prevForm.lecturingDays.filter((day) => day !== value)
        : [...prevForm.lecturingDays, value],
    }));
  };

  const handleStudyProgramChange = (event) => {
    const value = event.target.value;
    setForm((prevForm) => ({
      ...prevForm,
      studyProgram: prevForm.studyProgram.includes(value)
        ? prevForm.studyProgram.filter((day) => day !== value)
        : [...prevForm.studyProgram, value],
    }));
  };

  const getSemesterInfo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const semesterInfo = [];

    for (let i = 0; i < 4; i++) {
      const monthCheck = (month + 6 * i) % 12;
      if (3 <= monthCheck && monthCheck < 8) {
        semesterInfo.push(`SS-${year + i}`);
      } else {
        semesterInfo.push(`WS-${year + i}/${year + 1 + i}`);
      }
    }
    return semesterInfo;
  };

  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  useEffect(() => {
    const semesterInfo = getSemesterInfo();
    setSemesterInfo(semesterInfo);
    handleRandomImage();

    async function fetchCourse() {
      const courseId = params.courseId?.toString() || undefined;
      if (!courseId) {
        updateForm({
          lecturedBy: { _id: user.userId, username: user.username },
        });
        return;
      }
      setIsNew(false);
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const course = await response.json();
      if (!course) {
        console.warn(`Course with id ${courseId} not found`);
        navigate("/");
        return;
      }
      updateForm(course);
    }
    fetchCourse();
    return;
  }, [params.id, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    const course = { ...form };
    try {
      let response;
      if (isNew) {
        response = await fetch(`${API_BASE_URL}/courses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(course),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/courses/${params.courseId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(course),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("A problem occurred with your fetch operation: ", error);
    } finally {
      navigate("/courses");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="mt-10 space-y-12">
        <div className="border-b border-slate-900/10 dark:border-slate-300/10 pb-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-200">
            {params.courseId ? "Edit Course" : "Create a new Course"}
          </h1>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
            Please fill in all the necessary information for{" "}
            {params.courseId
              ? "editing your existing course"
              : "creating a new Course"}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
              >
                Course Title
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-gray-300 sm:max-w-md">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                    className="w-full rounded-md py-2 pl-1 pr-4 text-gray-900 ring-1 ring-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-sky-400 dark:hover:bg-sky-900"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
              >
                Course description
              </label>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
                Here you can provide a short course description
              </p>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full rounded-md py-2 pl-1 pr-4 text-gray-900 ring-1 ring-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-sky-400 dark:hover:bg-sky-900"
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="photo"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
              >
                Course Owner/Lecturer
              </label>
              <div className="mt-2 flex items-center gap-x-3 dark:text-slate-200">
                <UserCircleIcon
                  className="h-12 w-12 text-gray-300"
                  aria-hidden="true"
                />
                {form.lecturedBy?.username}
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="image"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
              >
                Course photo
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="mt-2 flex flex-col justify-center rounded-lg border border-dashed border-gray-900/25 p-3 dark:border-slate-400 dark:bg-slate-800">
                  <div className="flex justify-center">
                    <img
                      className="size-40 rounded-full"
                      src={"/course-pictures/" + form.image}
                      alt=""
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRandomImage}
                    className="mt-2 rounded-lg px-3 py-2 text-sm font-semibold dark:hover:bg-sky-900 dark:hover:text-sky-400 dark:text-slate-200 dark:bg-slate-700 bg-gray-100 hover:bg-gray-300"
                  >
                    Randomize
                  </button>
                </div>
                <div className="mt-2 flex grow justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-slate-400 dark:bg-slate-800">
                  <div className="text-center">
                    <PhotoIcon
                      className="mx-auto h-12 w-12 text-gray-300"
                      aria-hidden="true"
                    />
                    <div className="mt-4 flex items-center text-sm leading-6 dark:text-slate-400">
                      <label
                        htmlFor="file-upload"
                        className="flex items-center gap-1 cursor-pointer rounded-xl p-2 dark:hover:bg-sky-900 dark:hover:text-sky-400 font-semibold dark:text-slate-200 dark:bg-slate-700 bg-gray-100 hover:bg-gray-300"
                      >
                        <ArrowUpOnSquareIcon className="size-8"></ArrowUpOnSquareIcon>
                        <span className="flex-none">Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-slate-900/10 dark:border-slate-300/10 pb-12">
          <div className="grid gap-5 grid-flow-col items-start">
            <fieldset>
              <legend className="text-sm font-semibold leading-6 text-gray-900 dark:text-slate-200">
                Study Program
              </legend>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
                For which study programs is the course available
              </p>
              <div className="mt-6 space-y-6">
                <div className="relative grid-flow-col gap-x-3">
                  {studyPrograms.map((program) => (
                    <label
                      key={program}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        value={program}
                        checked={form.studyProgram.includes(program)}
                        onChange={handleStudyProgramChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <span className="text-gray-700 dark:text-slate-400">
                        {program}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-semibold leading-6 text-gray-900 dark:text-slate-200">
                Lecturing Days
              </legend>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
                Choose the days the course will get new lectures
              </p>
              <div className="mt-6 space-y-6">
                <div className="relative grid-flow-col gap-x-3">
                  {daysOfWeek.map((day) => (
                    <label
                      key={day.value}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        value={day.value}
                        checked={form.lecturingDays.includes(day.value)}
                        onChange={handleDayChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <span className="text-gray-700 dark:text-slate-400">
                        {day.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>
          </div>
        </div>
        <div className="border-b border-slate-900/10 dark:border-slate-300/10 pb-12">
          <div className="grid gap-5 grid-flow-col items-start">
            <fieldset>
              <legend className="text-sm font-semibold leading-6 text-gray-900 dark:text-slate-200">
                Semester
              </legend>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
                This selects the semester the course will take place
              </p>
              <div className="mt-6 space-y-3">
                {semesterInfo.map((semester) => (
                  <label
                    key={semester}
                    className="flex items-center gap-x-3 text-sm font-medium leading-6 text-gray-900"
                  >
                    <input
                      type="radio"
                      value={semester}
                      checked={form.semester === semester}
                      onChange={(e) => updateForm({ semester: e.target.value })}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-gray-700 dark:text-slate-400">
                      {semester}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-semibold leading-6 text-gray-900 dark:text-slate-200">
                Open to Enroll
              </legend>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
                An open course lets students freely join
              </p>
              <div className="mt-6 flex items-center space-x-2">
                <div className="text-gray-600 dark:text-slate-400 w-12">
                  {form.isOpenToEnroll ? "Open" : "Closed"}
                </div>
                <div
                  className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-300 ${
                    form.isOpenToEnroll ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  onClick={(e) =>
                    form.isOpenToEnroll
                      ? updateForm({ isOpenToEnroll: false })
                      : updateForm({ isOpenToEnroll: true })
                  }
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                      form.isOpenToEnroll ? "translate-x-6" : "translate-x-1"
                    }`}
                  ></span>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 dark:text-slate-200 shadow-sm dark:hover:bg-sky-900 dark:hover:text-sky-400 hover:bg-gray-300"
        >
          <FolderPlusIcon className="size-8"></FolderPlusIcon>
          Save
        </button>
      </div>
    </form>
  );
}
