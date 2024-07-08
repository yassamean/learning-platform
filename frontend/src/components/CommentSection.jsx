import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/UserContext";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "react-router-dom";

const CommentSection = () => {
  const params = useParams();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();

  const handleInputChange = (event) => {
    setCommentText(event.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    async function setComment() {
      try {
        await fetch(
          `${API_BASE_URL}/courses/${params.courseId}/lectures/${params.lectureId}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: commentText,
              userId: user.userId,
              lectureId: params.lectureId,
              date: new Date(),
            }),
          }
        );
        fetchComments();
      } catch (error) {
        console.error(error);
      }
    }
    setComment();
    setCommentText("");
  };

  async function fetchComments() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/${params.courseId}/lectures/${params.lectureId}/comments`
      );
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/courses/${params.courseId}/lectures/${params.lectureId}/comments`
        );
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchComments();
  }, []);

  const renderComments = () => {
    return comments.map((comment, index) => (
      <div key={index} className="mx-2">
        <div>
          <span className=" dark:text-slate-200">
            {comment.userId.username}
          </span>
          <span className="ml-2 text-sm font-thin dark:text-slate-400">
            {formatDistanceToNow(comment.updatedAt, {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-sm dark:text-slate-200">{comment.text}</p>
      </div>
    ));
  };

  return (
    <div className="flex flex-col">
      <div className="relative">
        <form onSubmit={onSubmit}>
          <textarea
            value={commentText}
            onChange={handleInputChange}
            className="w-full min-h-14 p-2 pr-14 border-b rounded-t-lg dark:bg-slate-700"
            placeholder="Write a comment..."
            // rows="1"
          ></textarea>
          <button
            type="submit"
            className="absolute top-0 right-0 mt-2 mr-2 px-4 py-2 bg-gray-100 text-gray-900 hover:bg-gray-300 rounded"
          >
            <PaperAirplaneIcon className="size-6"></PaperAirplaneIcon>
          </button>
          <div className="flex divide-y flex-col gap-2">{renderComments()}</div>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;
