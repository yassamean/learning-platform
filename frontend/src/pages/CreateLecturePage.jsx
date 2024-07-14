import { useAuth } from "../context/UserContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

import {
  ArrowUpOnSquareIcon,
  FilmIcon,
  DocumentArrowUpIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";

export default function CreateLecturePage() {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();

  const [isNew, setIsNew] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    pdfUrl: "",
    course: "",
  });

  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  useEffect(() => {
    async function fetchLecture() {
      const lectureId = params.lectureId?.toString() || undefined;
      if (!lectureId) return;
      setIsNew(false);
      const response = await fetch(
        `${API_BASE_URL}/courses/${params.courseId}/lectures/${lectureId}`
      );
      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const lecture = await response.json();
      if (!lecture) {
        console.warn(`Lecture with id ${lectureId} not found`);
        navigate("/");
        return;
      }
      updateForm(lecture);
    }
    fetchLecture();
    return;
  }, [params.id, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    const lecture = { ...form };
    try {
      let response;
      if (isNew) {
        response = await fetch(
          `${API_BASE_URL}/courses/${params.courseId}/lectures`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(lecture),
          }
        );
      } else {
        response = await fetch(
          `${API_BASE_URL}/courses/${params.courseId}/lectures/${params.lectureId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(lecture),
          }
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("A problem occurred with your fetch operation: ", error);
    } finally {
      navigate(`/courses/${params.courseId}`);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="mt-10 space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-200">
            {params.lectureId ? "Edit Lecture" : "Create a new Lecture"}
          </h1>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
            Please fill in all the necessary information for{" "}
            {params.lectureId
              ? "editing your existing lecture"
              : "creating a new lecture"}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
              >
                Lecture Title
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-gray-300 sm:max-w-md">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="name"
                    value={form.title}
                    onChange={(e) => updateForm({ title: e.target.value })}
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
                Lecture description
              </label>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
                Here you can provide a short lecture description
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
                htmlFor="image"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
              >
                Lecture video
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-slate-400 dark:bg-slate-800">
                <div className="text-center">
                  <FilmIcon
                    className="mx-auto size-20 text-gray-300"
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
                    MP4 up to 50MB
                  </p>
                </div>
              </div>
            </div>
            <div className="col-span-full">
              <label
                htmlFor="image"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
              >
                Lecture PDF
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-slate-400 dark:bg-slate-800">
                <div className="text-center">
                  <DocumentArrowUpIcon
                    className="mx-auto size-20 text-gray-300"
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
                    MP4 up to 50MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 dark:text-slate-200 shadow-sm dark:hover:bg-sky-900 dark:hover:text-sky-400 hover:bg-gray-300"
        >
          <DocumentPlusIcon className="size-8"></DocumentPlusIcon>
          Save
        </button>
      </div>
    </form>
  );
}
