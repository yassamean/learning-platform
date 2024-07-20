import { useAuth } from "../context/UserContext";
import { useDropzone } from "react-dropzone";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import ReactPlayer from "react-player";
import { BeatLoader } from "react-spinners";
import { Worker } from "@react-pdf-viewer/core";
import { Viewer } from "@react-pdf-viewer/core";
import toast from "react-hot-toast";
import "@react-pdf-viewer/core/lib/styles/index.css";

import {
  ArrowUpOnSquareIcon,
  FilmIcon,
  DocumentArrowUpIcon,
  DocumentPlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function CreateLecturePage() {
  const navigate = useNavigate();
  const params = useParams();

  const [videoUrlInput, setVideoUrlInput] = useState(
    "/uploads/videos/example.mp4"
  );
  const [loading, setLoading] = useState({
    video: false,
    pdf: false,
  });
  const [pdfUrlInput, setPdfUrlInput] = useState("/uploads/pdfs/example.pdf");
  const [isNew, setIsNew] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    pdfUrl: "",
    course: "",
  });

  const onDropVideo = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file.size > 50 * 1024 * 1024) {
        // 50 MB size limit
        toast.error("Video file size exceeds 5 MB");
        return;
      }
      setVideoUrlInput("");
      setLoading({ ...loading, video: true });
      const blob = await handleFileUpload(file);
      setLoading({ ...loading, video: false });

      setVideoUrlInput(blob.url);
    },
    [setForm, setVideoUrlInput]
  );

  const onDropPdf = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file.size > 5 * 1024 * 1024) {
        // 5 MB size limit
        toast.error("PDF file size exceeds 5 MB");
        return;
      }
      setPdfUrlInput("");
      setLoading({ ...loading, pdf: true });
      const blob = await handleFileUpload(file);
      setLoading({ ...loading, pdf: false });

      setPdfUrlInput(blob.url);
    },
    [setForm, setPdfUrlInput]
  );

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } =
    useDropzone({
      onDrop: onDropVideo,
      accept: { "video/mp4": [".mp4"] },
      maxFiles: 1,
      maxSize: 1024 * 1024 * 50,
    });

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps } =
    useDropzone({
      onDrop: onDropPdf,
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      maxSize: 1024 * 1024 * 5,
    });

  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  const videoUrlHandler = (value) => {
    setVideoUrlInput(value);
  };

  const pdfUrlHandler = (value) => {
    setPdfUrlInput(value);
  };

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
      setVideoUrlInput(lecture.videoUrl);
      setPdfUrlInput(lecture.pdfUrl);
    }
    fetchLecture();
    return;
  }, [params.id, navigate]);

  async function handleFileUpload(file) {
    const response = await fetch(
      `${API_BASE_URL}/upload?filename=${file.name}`,
      {
        method: "POST",
        body: file,
      }
    );

    const newBlob = await response.json();
    return newBlob;
  }

  async function handleFileDelete(fileUrl) {
    const response = await fetch(`${API_BASE_URL}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: fileUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      toast.success("File deleted successfully");
    } else {
      console.error("Failed to delete file");
    }
  }

  async function deleteLecture(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/${params.courseId}/lectures/${params.lectureId}`,
        {
          method: "DELETE",
        }
      );
      navigate(`/courses/${params.courseId}`);
    } catch (error) {
      console.error("A problem occurred with your fetch operation: ", error);
    } finally {
      navigate("/courses");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const lecture = { ...form };
    // delete files if changed
    if (!form.name) {
      !form.name && toast.error("Please provide a lecture title");
      return;
    }
    if (videoUrlInput != lecture.videoUrl) {
      lecture.videoUrl.includes("public.blob.vercel-storage.com") &&
        handleFileDelete(lecture.videoUrl);
      lecture.videoUrl = videoUrlInput;
    }
    if (pdfUrlInput != lecture.pdfUrl) {
      lecture.pdfUrl.includes("public.blob.vercel-storage.com") &&
        handleFileDelete(lecture.pdfUrl);
      lecture.pdfUrl = pdfUrlInput;
    }
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
                Lecture Title{" "}
                <span className="text-sm font-light text-gray-400">*</span>
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
              <div className="flex flex-col md:flex-row gap-4">
                {(loading.video || videoUrlInput) && (
                  <div className="relative flex flex-col items-center justify-center mt-2 aspect-video md:w-1/2 lg:w-1/3 rounded-lg border border-dashed border-gray-900/25 p-1 dark:border-slate-400 dark:bg-slate-800">
                    <div
                      className={
                        "absolute z-10 px-2 top-2 left-2 text-sm font-medium bg-white dark:bg-slate-700 dark:text-slate-200 rounded-lg"
                      }
                    >
                      Preview
                    </div>
                    {videoUrlInput.includes(
                      "public.blob.vercel-storage.com"
                    ) && (
                      <div
                        onClick={() => {
                          handleFileDelete(videoUrlInput);
                          setVideoUrlInput("");
                        }}
                        className="absolute z-10 top-1 right-1 cursor-pointer"
                      >
                        <TrashIcon className="size-5 text-gray-900 dark:text-slate-200 hover:text-red-500"></TrashIcon>
                      </div>
                    )}
                    <BeatLoader
                      color="#e2e8f0"
                      size="20px"
                      loading={loading.video}
                    />
                    {loading.video && (
                      <>
                        <div className="text-sm font-medium pt-5 text-gray-900 dark:text-slate-200">
                          Uploading...
                        </div>
                        <div className="text-sm font-light text-gray-900 dark:text-slate-200">
                          Creating Blob, this can take a while
                        </div>
                      </>
                    )}
                    {videoUrlInput && (
                      <ReactPlayer
                        width="100%"
                        height="100%"
                        controls={true}
                        url={videoUrlInput}
                      ></ReactPlayer>
                    )}
                  </div>
                )}
                <div className="grow">
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-slate-400 dark:bg-slate-800">
                    <div {...getVideoRootProps()} className="text-center">
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
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            {...getVideoInputProps()}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">
                        MP4 up to 50MB
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex grow justify-start items-center rounded-lg border border-dashed border-gray-900/25 p-2 dark:border-slate-400 dark:bg-slate-800">
                    <label
                      htmlFor="picture-url"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
                    >
                      Video Url:
                    </label>
                    <input
                      id="video-url"
                      name="video-url"
                      type="text"
                      value={videoUrlInput}
                      onChange={(e) => videoUrlHandler(e.target.value)}
                      placeholder={`https://www.youtube.com/watch?v=...`}
                      className="grow rounded-md py-2 ml-2 pl-1 pr-4 text-gray-900 ring-1 ring-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-sky-400 dark:hover:bg-sky-900"
                    />
                  </div>
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="grow">
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-slate-400 dark:bg-slate-800">
                    <div {...getPdfRootProps()} className="text-center">
                      <DocumentArrowUpIcon
                        className="mx-auto size-20 text-gray-300"
                        aria-hidden="true"
                      />
                      <div className="mt-4 flex items-center text-sm leading-6 dark:text-slate-400">
                        <label
                          htmlFor="pdf-upload"
                          className="flex items-center gap-1 cursor-pointer rounded-xl p-2 dark:hover:bg-sky-900 dark:hover:text-sky-400 font-semibold dark:text-slate-200 dark:bg-slate-700 bg-gray-100 hover:bg-gray-300"
                        >
                          <ArrowUpOnSquareIcon className="size-8"></ArrowUpOnSquareIcon>
                          <span className="flex-none">Upload a file</span>
                          <input
                            name="pdf-upload"
                            className="sr-only"
                            {...getPdfInputProps()}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">
                        PDF up to 5MB
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex grow justify-start items-center rounded-lg border border-dashed border-gray-900/25 p-2 dark:border-slate-400 dark:bg-slate-800">
                    <label
                      htmlFor="picture-url"
                      className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-200"
                    >
                      PDF Url:
                    </label>
                    <input
                      id="pdf-url"
                      name="pdf-url"
                      type="text"
                      value={pdfUrlInput}
                      onChange={(e) => pdfUrlHandler(e.target.value)}
                      placeholder={`https://ae.cs.uni-frankfurt.de/teaching/24ss/+algo1/skript_gl1_ws1213.pdf`}
                      className="grow rounded-md py-2 ml-2 pl-1 pr-4 text-gray-900 ring-1 ring-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-sky-400 dark:hover:bg-sky-900"
                    />
                  </div>
                </div>
                {(loading.pdf || pdfUrlInput) && (
                  <div className="relative flex flex-col items-center justify-center mt-2 aspect-video sm:h-96 md:h-[312px] md:w-1/2 lg:w-1/3 rounded-lg border border-dashed border-gray-900/25 p-1 dark:border-slate-400 dark:bg-slate-800">
                    <div
                      className={
                        "absolute z-10 px-2 top-2 left-2 text-sm font-medium bg-white dark:bg-slate-700 dark:text-slate-200 rounded-lg"
                      }
                    >
                      Preview
                    </div>
                    {pdfUrlInput.includes("public.blob.vercel-storage.com") && (
                      <div
                        onClick={() => {
                          handleFileDelete(pdfUrlInput);
                          setPdfUrlInput("");
                        }}
                        className="absolute z-10 top-1 right-5 cursor-pointer"
                      >
                        <TrashIcon className="size-5 text-gray-900 hover:text-red-500"></TrashIcon>
                      </div>
                    )}
                    <BeatLoader
                      color="#e2e8f0"
                      size="20px"
                      loading={loading.pdf}
                    />
                    {loading.pdf && (
                      <>
                        <div className="text-sm font-medium pt-5 text-gray-900 dark:text-slate-200">
                          Uploading...
                        </div>
                        <div className="text-sm font-light text-gray-900 dark:text-slate-200">
                          Creating Blob, this can take a while
                        </div>
                      </>
                    )}
                    {pdfUrlInput && (
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                        <Viewer fileUrl={pdfUrlInput} />
                      </Worker>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="text-sm font-light text-gray-400">
        * Required fields
      </span>
      <div className="mt-6 flex items-center justify-between gap-x-6">
        {!isNew ? (
          <button
            onClick={(e) => deleteLecture(e)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 dark:text-slate-200 shadow-sm dark:hover:bg-sky-900 hover:text-red-600 hover:bg-gray-300"
          >
            <TrashIcon className="size-8"></TrashIcon>
            Delete
          </button>
        ) : (
          <div></div>
        )}
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
