import { Link } from "react-router-dom";
import { useAuth } from "../context/UserContext";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white mt-10 p-8 rounded border mx-auto max-w-md dark:text-white dark:bg-slate-800">
      <h1 className="text-3xl font-bold mb-4">
        Welcome to the School Learning Platform
      </h1>
      <p className="mb-6 text-gray-700 dark:text-slate-300">
        Our platform is designed to help school students learn various topics
        effectively. Whether you need help with your homework or want to deepen
        your understanding of a subject, we are here to assist you.
      </p>
      {user ? null : (
        <div>
          <Link
            to="/register"
            className="bg-blue-500 text-white py-2 px-4 rounded mr-2 hover:bg-blue-600"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Log In
          </Link>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
