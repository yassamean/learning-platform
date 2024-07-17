import { Link } from "react-router-dom";
import { useAuth } from "../context/UserContext";

const LandingPage = () => {
	const { user } = useAuth();

	return (
		<div className="bg-white mt-10 p-8 rounded mx-auto dark:text-white dark:bg-slate-900">
			{/* 
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
      )} */}

			<div className="grid md:grid-cols-2 items-center">
				<div className="text-center md:text-left md:mr-8">
					<h1 className="text-5xl font-bold text-gray-800 dark:text-slate-100 font-display">
						Welcome to your <br />
						<span className="text-blue-500">
							School Learning Platform
						</span>
					</h1>
					<p className="mt-4 text-gray-600 dark:text-slate-300">
						Our platform is designed to help school students learn
						various topics effectively. Whether you need help with
						your homework or want to deepen your understanding of a
						subject, we are here to assist you.
					</p>
					<div className="mt-8">
						<Link
							to="/login"
							className="text-lg font-semibold text-white bg-gray-800 px-4 py-2 rounded hover:bg-gray-700"
						>
							Join Now
						</Link>
					</div>
				</div>
				<div className="mt-8 md:mt-0">
					<img
						src="/images/online-learning.svg"
						alt="Online studying illustration"
						className="w-full max-w-md mx-auto"
					/>
				</div>
			</div>

			<div className="grid md:grid-cols-2 items-center mt-32">
				<div className="mt-8 md:mt-0 order-last md:order-first md:mr-8">
					<img
						src="/images/video-tutorial.svg"
						alt="User experience illustration"
						className="w-full max-w-md mx-auto"
					/>
				</div>
				<div className="text-center md:text-left">
					<h2 className="text-4xl font-bold text-gray-800 dark:text-slate-100 font-display">
						Interactive{" "}
						<span className="text-pink-500">User Experience</span>
					</h2>
					<p className="mt-4 text-gray-600 dark:text-slate-300">
						You can watch video tutorials, comment on lessons and
						PDF files, and take personal notes
					</p>
					<div className="mt-8">
						<Link
							to="/courses"
							className="text-lg font-semibold text-white bg-pink-500 px-4 py-2 rounded hover:bg-pink-700"
						>
							View Courses
						</Link>
					</div>
				</div>
			</div>

			<div className="grid md:grid-cols-2 items-center my-32">
				<div className="text-center md:text-left md:mr-8">
					<h2 className="text-4xl font-bold text-gray-800 dark:text-slate-100 font-display">
						Test your knowledge with{" "}
						<span className="text-green-500">Online Quizzes</span>
					</h2>
					<p className="mt-4 text-gray-600 dark:text-slate-300">
						You can take quizzes on various topics and get instant
						feedback on your performance
					</p>
					<div className="mt-8">
						<Link
							to="/register"
							className="text-lg font-semibold text-white bg-green-500 px-4 py-2 rounded hover:bg-green-700"
						>
							Get Started
						</Link>
					</div>
				</div>
				<div className="mt-8 md:mt-0">
					<img
						src="/images/online-test.svg"
						alt="Admission completed illustration"
						className="w-full max-w-md mx-auto"
					/>
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
