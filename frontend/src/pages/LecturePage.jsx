import { API_BASE_URL } from "../config";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/UserContext";
import {
  ArrowUturnLeftIcon,
  PencilSquareIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import CommentSection from "../components/CommentSection";
import ReactPlayer from "react-player";
import PDFViewer from "../components/PdfViewer";

const LecturePage = () => {
  const { user } = useAuth();
  const params = useParams();
  const playerRef = useRef(null);
  const [lecture, setLecture] = useState({});
  const [watchTime, setWatchTime] = useState(0);
  const watchTimeRef = useRef(0); //ref is needed because state is deleted on unmount
  const [notes, setNotes] = useState("");
  const notesRef = useRef(""); //ref is needed because state is deleted on unmount
  const [highlightedText, setHighlightedText] = useState([]);
  const highlightedTextRef = useRef(""); //ref is needed because state is deleted on unmount
  const hasSeeked = useRef(false);

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

    return () => {
      // called when unmounted
      updateUserDataLectureData();
    };
  }, []);

  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }

  const debounceSendData = useCallback(
    debounce(updateUserDataLectureData, 3000),
    []
  );

  useEffect(() => {
    debounceSendData();
    const intervalId = setInterval(() => {
      updateUserDataLectureData();
    }, 15000); // 15-second interval

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [watchTime, notes, highlightedText]);

  async function updateUserDataLectureData() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/userData/${user.userDataId}/updateLectureData`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId: courseId,
            lectureId: params.lectureId,
            watchTime: watchTime,
            notes: notes,
            highlightedText: highlightedText,
          }),
        }
      );
      console.log(
        JSON.stringify({
          courseId: courseId,
          lectureId: params.lectureId,
          watchTime: watchTime,
          notes: notes,
          highlightedText: highlightedText,
        })
      );
    } catch (error) {
      console.error("Error during update:", error);
    }
  }

  return (
    <div className="">
      <div className="flex justify-between">
        <div>
          <h1 className="text-lg pt-10 text-gray-900 dark:text-slate-400">
            Lecture:
          </h1>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-200">
            {lecture.title}
          </h1>
          <Link to={`/courses/${courseId}/`} className="flex gap-2">
            <ArrowUturnLeftIcon className="size-5" />
            Back to Course Page
          </Link>
          {user.role === "teacher" ? (
            <Link
              className="flex gap-2 place-items-center"
              to={`/courses/${courseId}/lectures/${params.lectureId.toString()}/manageQuiz`}
            >
              <ListBulletIcon className="size-8 dark:text-slate-200" />
              Manage Quiz
            </Link>
          ) : null}
        </div>
        {["teacher", "admin"].includes(user.role) && (
          <div className="flex items-end gap-2">
            <Link
              to={`/courses/${courseId}/lectures/${params.lectureId.toString()}/edit`}
              className=""
            >
              <PencilSquareIcon className="size-8 dark:text-slate-200"></PencilSquareIcon>
            </Link>
          </div>
        )}
        {["student"].includes(user.role) && (
          <div className="flex items-end gap-2">
            <Link
              to={`/courses/${params.courseId}/lectures/${params.lectureId}/quiz`}
              className="flex flex-col mr-2 place-items-center gap-1"
            >
              <PencilSquareIcon className="size-8 dark:text-slate-200"></PencilSquareIcon>
              <span>Lecture Quiz</span>
            </Link>
          </div>
        )}
      </div>
      <div className="mt-10 grid grid-flow-row grid-cols-3 gap-5">
        <div className="p-1 col-span-2 border aspect-video rounded-lg bg-black">
          <ReactPlayer
            ref={playerRef}
            onProgress={(state) => setWatchTime(state.playedSeconds)}
            onReady={() => {
              if (!hasSeeked.current) {
                playerRef.current.seekTo(watchTime, "seconds");
                hasSeeked.current = true;
              }
            }}
            width="100%"
            height="100%"
            controls={true}
            url="/uploads/videos/example.mp4"
          ></ReactPlayer>
        </div>
        <div className="col-span-1 border rounded-lg dark:bg-slate-800 ">
          <CommentSection
            videoSeekTo={(watchTime) =>
              playerRef.current.seekTo(watchTime, "seconds")
            }
          ></CommentSection>
        </div>
      </div>
      <div className="mt-5 grid grid-flow-row grid-cols-2 gap-5">
        <div className="border rounded-lg aspect-square p-1 bg-[#f0ecec] dark:bg-[#302c2c]">
          <PDFViewer
            pdfUrl="/uploads/pdfs/example2.pdf"
            highlightedText={highlightedText}
            setHighlightedText={setHighlightedText}
          ></PDFViewer>
        </div>
        <div className="rounded-lg">
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              notesRef.current = e.target.value;
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
