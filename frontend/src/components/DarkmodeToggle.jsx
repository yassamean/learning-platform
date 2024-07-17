import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

const DarkmodeToggle = () => {
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		// Check if dark mode is already enabled in local storage
		const savedMode = localStorage.getItem("darkMode") === "true";
		setDarkMode(savedMode);

		if (savedMode) {
			document.documentElement.classList.add("dark");
		}
	}, []);

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
		document.documentElement.classList.toggle("dark", !darkMode);
		const audio = new Audio(
			darkMode ? "/audios/switch-on.mp3" : "/audios/switch-off.mp3"
		);
		audio.play();
		localStorage.setItem("darkMode", !darkMode);
	};

	return (
		<button
			onClick={toggleDarkMode}
			className="mx-5 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-sky-900 group"
		>
			{darkMode ? (
				<MoonIcon className="h-6 w-6 text-slate-200 dark:group-hover:text-sky-400"></MoonIcon>
			) : (
				<SunIcon className="h-6 w-6 text-gray-900"></SunIcon>
			)}
		</button>
	);
};

export default DarkmodeToggle;
