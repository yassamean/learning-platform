import { Link } from "react-router-dom";
import { useAuth } from "../context/UserContext";

const tiles = [
  {
    title: "Explore All Courses",
    description: "Check out the latest lectures and stay up to date.",
    buttonText: "See Courses",
    role: ["student"],
    buttonLink: "/courses",
  },
  {
    title: "Manage Users",
    description: "Administer user accounts and manage roles.",
    buttonText: "Go to User Management",
    role: ["admin"],
    buttonLink: "/admin/users",
  },
  {
    title: "Manage Courses",
    description:
      "Administer courses, create new ones and assign them to teachers.",
    buttonText: "Go to Course Management",
    role: ["admin"],
    buttonLink: "/courses",
  },
  {
    title: "Manage Courses",
    description:
      "Administer your courses, upload new lectures and create quizzes for your lectures.",
    buttonText: "Go to Course Management",
    role: ["teacher"],
    buttonLink: "/courses",
  },
  {
    title: "Manage Students",
    description:
      "View and manage your students, assign grades and view their progress.",
    buttonText: "Go to Student Management",
    role: ["teacher"],
    buttonLink: "/teacher/users",
  },
  {
    title: "Profile Settings",
    description: "Update your profile settings and change your password.",
    buttonText: "Go to Profile Settings",
    role: ["student", "teacher", "admin"],
    buttonLink: "/me",
  },
];

const Dashboard = () => {
  const { user } = useAuth();

  const filteredTiles = tiles.filter((tile) => tile.role.includes(user.role));

  return (
    <div className="mt-10">
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-display dark:text-slate-200">
          Hello, {user.username}!
        </h1>
        <p className="text-lg text-gray-600 dark:text-slate-400">
          Welcome back to your learning dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTiles.map((tile, index) => (
          <div
            key={index}
            className="bg-white shadow rounded-lg p-6 dark:bg-slate-800"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2 dark:text-slate-200">
              {tile.title}
            </h3>
            <p className="text-gray-600 dark:text-slate-400">
              {tile.description}
            </p>
            <Link to={tile.buttonLink}>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg ">
                {tile.buttonText}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
