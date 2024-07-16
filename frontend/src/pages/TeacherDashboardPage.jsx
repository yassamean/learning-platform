import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { API_BASE_URL } from "../config";
import { Link } from "react-router-dom";

const TeacherDashboardPage = () => {
	const { user } = useContext(UserContext);
	const [students, setStudents] = useState([]);
	const [filter, setFilter] = useState("");
	const [error, setError] = useState("");
	let filteredStudents = students.filter(
		u =>
			u.username.toLowerCase().includes(filter.toLowerCase()) ||
			u.email.toLowerCase().includes(filter.toLowerCase())
	);

	useEffect(() => {
		const fetchStudents = async () => {
			try {
				const response = await fetch(
					`${API_BASE_URL}/${user.userId}/students`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								"token"
							)}`,
						},
					}
				);
				const data = await response.json();
				if (!response.ok) {
					throw new Error(data.message || "Failed to fetch students");
				}
				setStudents(data);
			} catch (error) {
				setError(error.message);
				console.error(error);
			}
		};

		fetchStudents();
	}, []);

	return (
		<div
			className="container mx-auto mb-auto p-4"
			style={{ maxHeight: "100%" }}
		>
			<header className="sticky top-3">
				<h1 className="text-2xl font-bold mb-6 text-center dark:text-slate-200">
					Teacher Dashboard
				</h1>
				{error && <p className="text-red-500">{error}</p>}
				<div className="mb-4">
					<label
						className="block text-gray-700 dark:text-slate-200 mb-2"
						htmlFor="students"
					>
						Filter Students
					</label>
					<input
						type="text"
						id="students"
						name="students"
						value={filter}
						onChange={e => setFilter(e.target.value)}
						className="w-full p-2 border border-gray-300 rounded"
					/>
				</div>
			</header>
			<div className="overflow-x-auto max-h-96">
				<table className="min-w-full bg-white dark:bg-slate-700 dark:text-slate-200">
					<thead className="bg-gray-200 dark:bg-slate-800 sticky top-0 z-10">
						<tr>
							<th className="py-2 px-4 border-b text-start ">
								Username
							</th>
							<th className="py-2 px-4 border-b text-start">
								Email
							</th>
							<th className="py-2 px-4 border-b text-start">
								Course Names
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredStudents.map(u => (
							<tr key={u._id}>
								<td className="py-2 px-4 border-b">
									{u.username}
								</td>
								<td className="py-2 px-4 border-b">
									{u.email}
								</td>
								<td className="py-2 px-4 border-b">
									{u.courses.map(c => (
										<p>
											<Link
												className="hover:underline"
												to={`/courses/${c._id}`}
												key={c._id}
											>
												{c.name}
											</Link>
										</p>
									))}
								</td>
							</tr>
						))}
					</tbody>
					<tfoot className="bg-gray-100 sticky bottom-0 z-10">
						<tr>
							<td
								className="py-2 px-4 border-t dark:bg-slate-800"
								colSpan="4"
							>
								{filteredStudents.length} results found
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
};

export default TeacherDashboardPage;
