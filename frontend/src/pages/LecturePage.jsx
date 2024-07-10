import { API_BASE_URL } from "../config";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/UserContext";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import CommentSection from "../components/CommentSection";
import ReactPlayer from "react-player";

const LecturePage = () => {
  const { user } = useAuth();
  const params = useParams();
  const playerRef = useRef(null);
  const [lecture, setLecture] = useState({});
  const [watchTime, setWatchTime] = useState(0);
  const watchTimeRef = useRef(0);
  const [notes, setNotes] = useState("");
  const notesRef = useRef("");
  const [highlightedText, setHighlightedText] = useState("");
  const highlightedTextRef = useRef("");
  const hasSeeked = useRef(false);

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
        console.log(data);
        if (data) {
          setWatchTime(data.watchTime);
          watchTimeRef.current = data.watchTime;
          setNotes(data.notes);
          notesRef.current = data.notes;
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
            courseId: params.courseId.toString(),
            lectureId: params.lectureId,
            watchTime: watchTimeRef.current,
            notes: notesRef.current,
            highlightedText: highlightedTextRef.current,
          }),
        }
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
        </div>
        {["teacher", "admin"].includes(user.role) && (
          <div className="flex items-end">
            <Link
              to={`/courses/${params.courseId.toString()}/lectures/${params.lectureId.toString()}/edit`}
              className=""
            >
              <PencilSquareIcon className="size-8 dark:text-slate-200"></PencilSquareIcon>
            </Link>
          </div>
        )}
      </div>
      <div className="mt-10 grid grid-flow-row grid-cols-3 gap-5">
        <div className="p-1 col-span-2 border aspect-video rounded-lg bg-black">
          <ReactPlayer
            ref={playerRef}
            onProgress={(state) => (watchTimeRef.current = state.playedSeconds)}
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
          <CommentSection></CommentSection>
        </div>
      </div>
      <div className="mt-5 grid grid-flow-row grid-cols-2 gap-5">
        <div className="border rounded-lg aspect-square">
          <iframe
            className="w-full h-full rounded-lg"
            src="/uploads/pdfs/example.pdf"
          ></iframe>
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
