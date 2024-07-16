import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <div className="bg-white p-8 rounded shadow-md text-center  dark:bg-slate-800">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-slate-200">Page Not Found</h1>
        <img src="/vincent.gif" alt="404" className="rounded-md" />
        <p className="m-6 text-gray-600 dark:text-slate-200">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
