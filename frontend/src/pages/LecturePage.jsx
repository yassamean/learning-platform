import { API_BASE_URL } from "../config";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/UserContext";
import {
  ArrowUturnLeftIcon,
  PencilSquareIcon,
  ListBulletIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import CommentSection from "../components/CommentSection";
import ReactPlayer from "react-player";
import PDFViewer from "../components/PdfViewer";
import { Tooltip } from "react-tooltip";
import { formatDistanceToNow } from "date-fns";

const LecturePage = () => {
  const { user } = useAuth();
  const params = useParams();
  const playerRef = useRef(null);
  const [lecture, setLecture] = useState({});
  const [watchTime, setWatchTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [highlightedText, setHighlightedText] = useState([]);
  const hasSeeked = useRef(false);
  const latestState = useRef({ watchTime, notes, highlightedText });
  const [userInteraction, setUserInteraction] = useState(false);

  const courseId = params.courseId.toString();

  useEffect(() => {
    async function increaseViewCount() {
      await fetch(`${API_BASE_URL}/${params.lectureId}/increaseViewCount`, {
        method: "PATCH",
      });
    }
    async function getLecture() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/courses/${params.courseId}/lectures/${params.lectureId}`
        );
        const data = await response.json();
        setLecture(data);
      } catch (error) {
        console.error(error);
      }
    }
    async function getUserDataLectureData() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/userData/${user.userDataId}/lectureData/${params.lectureId}`
        );
        const data = await response.json();
        if (data) {
          setWatchTime(data.watchTime);
          setNotes(data.notes);
          setHighlightedText(data.highlightedText);
        }
      } catch (error) {
        console.error(error);
      }
    }

    increaseViewCount();
    getLecture();
    getUserDataLectureData();
  }, []);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSendData = useCallback(
    debounce(() => {
      updateUserDataLectureData(latestState);
    }, 1500),
    []
  );

  useEffect(() => {
    if (lecture && userInteraction) {
      latestState.current = { watchTime, notes, highlightedText };
      debouncedSendData();
    }
  }, [watchTime, notes, highlightedText]);

  async function updateUserDataLectureData(latestState) {
    try {
      await fetch(
        `${API_BASE_URL}/userData/${user.userDataId}/updateLectureData`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId: courseId,
            lectureId: params.lectureId,
            watchTime: latestState.current.watchTime,
            notes: latestState.current.notes,
            highlightedText: latestState.current.highlightedText,
          }),
        }
      );
    } catch (error) {
      console.error("Error during update:", error);
    }
  }

  return !lecture ? (
    <div className="pt-6 dark:text-slate-200">
      <p>Loading lecture content...</p>
    </div>
  ) : (
    <div className="">
      <div className="flex justify-between">
        <div>
          <h1 className="text-lg pt-10 text-gray-900 dark:text-slate-300">
            Lecture:
          </h1>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-200">
            {lecture.title}
          </h1>

          {user.role === "teacher" ? (
            <Link
              className="flex gap-2 place-items-center dark:text-slate-200"
              to={`/courses/${courseId}/lectures/${params.lectureId.toString()}/manageQuiz`}
            >
              <ListBulletIcon className="size-8 dark:text-slate-200" />
              Manage Quiz
            </Link>
          ) : null}
          <Link
            to={`/courses/${courseId}/`}
            className="flex gap-2 dark:text-slate-300"
          >
            <ArrowUturnLeftIcon className="size-5 " />
            Back to Course Page
          </Link>
        </div>
        {["teacher", "admin"].includes(user.role) && (
          <div className="flex items-end gap-2">
            <Link
              to={`/courses/${courseId}/lectures/${params.lectureId.toString()}/edit`}
              className=""
            >
              <PencilSquareIcon className="editLectureButton size-8 dark:text-slate-200"></PencilSquareIcon>
              <Tooltip anchorSelect=".editLectureButton">
                Edit lecture data
              </Tooltip>
            </Link>
          </div>
        )}
        {lecture.hasQuiz && ["student"].includes(user.role) && (
          <div className="flex items-end gap-2">
            <Link
              to={`/courses/${params.courseId}/lectures/${params.lectureId}/quiz`}
              className="flex flex-col mr-2 place-items-center gap-1"
            >
              <PencilSquareIcon className="size-8 dark:text-slate-200"></PencilSquareIcon>
              <span className="dark:text-slate-300">Lecture Quiz</span>
            </Link>
          </div>
        )}
      </div>
      <div className="mt-10">
        <div className="mb-2 text-lg font-bold dark:text-slate-200">
          Lecture Description
        </div>
        <div className="flex p-4 gap-x-4 bg-gray-50 dark:bg-slate-800 dark:text-slate-200 items-start rounded-lg">
          <BookOpenIcon className="min-w-6 size-6"></BookOpenIcon>
          <div>
            <div className="grow whitespace-pre-wrap">
              {lecture.description}
            </div>
            <div className="text-sm font-light">
              Created:{" "}
              {lecture.createdAt &&
                formatDistanceToNow(new Date(lecture.createdAt), {
                  addSuffix: true,
                })}
            </div>
            <div className="text-sm font-light">
              Updated:{" "}
              {lecture.updatedAt &&
                formatDistanceToNow(new Date(lecture.updatedAt), {
                  addSuffix: true,
                })}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-flow-row grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="p-1 col-span-2 border w-full aspect-video rounded-lg bg-black">
          <ReactPlayer
            ref={playerRef}
            onProgress={(state) => setWatchTime(state.playedSeconds)}
            onReady={() => {
              if (!hasSeeked.current) {
                playerRef.current.seekTo(watchTime, "seconds");
                hasSeeked.current = true;
              }
            }}
            onPlay={() => {
              !userInteraction && setUserInteraction(true);
            }}
            width="100%"
            height="100%"
            controls={true}
            url={lecture.videoUrl}
          ></ReactPlayer>
        </div>
        <div className="col-span-1 border rounded-lg dark:bg-slate-800">
          <CommentSection
            videoSeekTo={(watchTime) =>
              playerRef.current.seekTo(watchTime, "seconds")
            }
          ></CommentSection>
        </div>
      </div>
      <div className="mt-5 grid grid-flow-row sm:grid-cols-1 md:grid-cols-2 gap-5">
        <div className="border rounded-lg aspect-square p-1 bg-[#f0ecec] dark:bg-[#302c2c]">
          {lecture.pdfUrl && (
            <PDFViewer
              pdfUrl={lecture.pdfUrl}
              highlightedText={highlightedText}
              setHighlightedText={setHighlightedText}
              userInteraction={userInteraction}
              setUserInteraction={setUserInteraction}
            ></PDFViewer>
          )}
        </div>
        <div className="rounded-lg aspect-square">
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              !userInteraction && setUserInteraction(true);
            }}
            className="w-full h-full text-gray-900 dark:text-slate-200 p-2 border rounded-lg bg-orange-50 dark:bg-sky-900/60 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
            placeholder="Write private notes here..."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default LecturePage;
