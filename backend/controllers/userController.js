import { User } from "../models/user.js";
import { Course } from "../models/course.js";
import { UserData } from "../models/userData.js";

export async function getUsers(req, res) {
	try {
		const users = await User.find({});
		res.json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function updateUserRole(req, res) {
	const { username } = req.params;
	const { role } = req.body;

	try {
		const user = await User.findOne({ username });
		user.role = role;
		await user.save();

		res.json({ message: "User role updated successfully" });
	} catch (error) {
		console.error("Error updating user role:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}

export async function getStudentsByTeacherId(req, res) {
	const { teacherId } = req.params;
	try {
		// Step 1: Get the courses that belong to the teacher
		const teacherCourses = await Course.find({ lecturedBy: teacherId });
	
		// Step 2: Extract the list of course IDs
		const teacherCourseIds = teacherCourses.map(course => course._id.toString());
	
		// Step 3: Find the user data for students enrolled in these courses
		const userData = await UserData.find({ enrollments: { $in: teacherCourseIds } }).populate('enrollments');
	
		// Step 4: Extract the user IDs
		const studentIds = userData.map(data => data.userId);
	
		// Step 5: Fetch the user details for these students
		const students = await User.find({ _id: { $in: studentIds } });
	
		// Step 6: Prepare the response to include only the teacher's courses for each student
		const studentsWithCourses = students.map(student => {
			const allCoursesOfStudent = userData.find(
				data => data.userId.toString() === student._id.toString())
			.enrollments;

			const coursesFromThisTeacher = allCoursesOfStudent.filter(
				course => teacherCourseIds.includes(course._id.toString())
		  	);
		  
			return {
				_id: student._id,
				username: student.username,
				email: student.email,
				courses: coursesFromThisTeacher
		  	};
		});
	
		// Return the students with filtered course details
		res.status(200).json(studentsWithCourses);
	} catch (error) {
		console.error("Error fetching students:", error);
		res.status(500).json({ message: "Internal server error" });
	}
}
