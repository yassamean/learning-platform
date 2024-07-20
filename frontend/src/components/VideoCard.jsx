import { PlayCircleIcon } from "@heroicons/react/16/solid";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import ReactPlayer from "react-player";

export default function VideoCard(params) {
  return (
    <Link to={params.path}>
      <div className="group p-1 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-sky-900">
        <div className="flex border p-1 rounded-lg aspect-video bg-gray-900 items-center justify-center">
          <ReactPlayer
            width="100%"
            height="100%"
            light={
              params.data.videoUrl.includes("youtu") ? (
                true
              ) : (
                <video src={params.data.videoUrl}></video>
              )
            }
            url={params.data.videoUrl}
          ></ReactPlayer>
        </div>
        <div className="line-clamp-2 font-bold dark:text-slate-200 group-hover:dark:text-sky-400">
          {params.data.title}
        </div>
        <div className="flex justify-between text-sm dark:text-slate-400">
          <div>Views: {params.data.views}</div>
          <div>
            {formatDistanceToNow(new Date(params.data.createdAt), {
              addSuffix: true,
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}
