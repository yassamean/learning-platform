import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import {
	HomeIcon,
	DocumentTextIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import MenuDropdown from "./MenuDropdown";
import DarkmodeToggle from "./DarkmodeToggle";

export default function Navbar({ setSearch }) {
	const { user } = useAuth();

	return (
		<header className="border-b border-slate-900/10 dark:border-slate-300/10">
			<nav
				className="mx-auto flex max-w-7xl items-center justify-between p-2 lg:px-8"
				aria-label="Global"
			>
				<div className="flex items-center gap-x-4">
					<span className="sr-only">Learning Platform</span>
					<Link to="/">
						<img
							className="h-14 w-auto"
							src="/goethe-uni-book.png"
							alt=""
						/>
					</Link>
					{user && (
						<>
							<NavLink
								to={"/dashboard"}
								className="hidden sm:flex rounded-lg py-2 px-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-200 dark:text-slate-200 dark:hover:text-sky-400 dark:hover:bg-sky-900"
							>
								<HomeIcon
									className="h-6 w-6"
									aria-hidden="true"
								></HomeIcon>
								<span className="ml-2">Dashboard</span>
							</NavLink>
							<NavLink
								to="/courses"
								className="hidden sm:flex rounded-lg py-2 px-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-200 dark:text-slate-200 dark:hover:text-sky-400 dark:hover:bg-sky-900"
							>
								<DocumentTextIcon
									className="h-6 w-6"
									aria-hidden="true"
								></DocumentTextIcon>
								<span className="ml-2">Courses</span>
							</NavLink>{" "}
						</>
					)}
				</div>

				<div className="hidden md:flex flex-1 justify-center">
					{user ? (
						<div className="relative rounded-md w-full max-w-md">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 dark:text-slate-200 dark:hover:text-sky-400">
								<MagnifyingGlassIcon
									className="h-6 w-6"
									aria-hidden="true"
								></MagnifyingGlassIcon>
							</div>

							<input
								type="text"
								name="search"
								id="search"
								onChange={e => setSearch(e.target.value)}
								className="w-full rounded-md py-2 pl-10 pr-4 text-gray-900 ring-1 ring-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-sky-400 dark:hover:bg-sky-900"
							/>
						</div>
					) : null}
				</div>

				<div className="flex items-center space-x-4">
					<DarkmodeToggle></DarkmodeToggle>
					<MenuDropdown></MenuDropdown>
				</div>
			</nav>
		</header>
	);
}
