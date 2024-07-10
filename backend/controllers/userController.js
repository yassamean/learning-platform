import { User } from "../models/user.js";
import bcrypt from "bcryptjs";

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

export async function getStudents(req, res) {
  try {
    const students = await User.find({ role: "student" });
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserInformation(req, res) {
  // for now the user can only update their password, because i dont know if there will be a problem with the jwt when updating the username or email
  req.body;
  console.log(req.body);
  console.log(
    req.body.currentPassword,
    req.body.newPassword,
    req.body.confirmPassword
  );
  const username = req.params.username;

  try {
    if (
      !req.body.currentPassword ||
      !req.body.newPassword ||
      !req.body.confirmPassword
    ) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (req.body.currentPassword === req.body.newPassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.find({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (await bcrypt.compare(req.body.newPassword, user.password)) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating user information:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
