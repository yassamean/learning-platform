import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  RECAPTCHA_SECRET_KEY,
  BASE_URL_FOR_EMAIL,
} from "../utils/config.js";
import { User } from "../models/index.js";
import { sendEmail } from "../utils/email.js";

export async function login(req, res) {
  const { identifier, password, captchaValue } = req.body;

  if (process.env.ENVIRONMENT !== "dev") {
    try {
      const verifyResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaValue}`,
        {
          method: "POST",
        }
      );

      const data = await verifyResponse.json();

      if (!data.success) {
        console.error("Invalid reCAPTCHA token", data);
        return res.status(400).json({ message: "Invalid reCAPTCHA token" });
      }
    } catch (error) {
      console.error("Error verifying reCAPTCHA token:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          userDataId: user.userDataId,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ message: "Login successful", token });
    } else {
      res.status(401).json({ message: "Invalid identifier or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function register(req, res) {
  const { username, email, password, captchaValue } = req.body;

  if (process.env.ENVIRONMENT !== "dev") {
    try {
      const verifyResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaValue}`,
        {
          method: "POST",
        }
      );

      const data = await verifyResponse.json();

      if (!data.success) {
        console.error("Invalid reCAPTCHA token", data);
        return res.status(400).json({ message: "Invalid reCAPTCHA token" });
      }
    } catch (error) {
      console.error("Error verifying reCAPTCHA token:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    const result = await user.save();

    const token = jwt.sign(
      {
        userId: result._id,
        username,
        role: "student",
        email: result.email,
        userDataId: result.userDataId,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Registration successful", token });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function resetPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found");
      // Don't reveal whether the email exists or not wait for a few seconds before responding
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return res.json({ message: "Password reset email sent" });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "10m" });

    user.passwordResetToken = await bcrypt.hash(token, 10);
    await user.save();

    const resetLink = `${BASE_URL_FOR_EMAIL}/create-password/${token}`;

    await sendEmail(
      email,
      "Password Reset - School Learning Platform",
      resetLink
    );

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Link has expired" });
    } else {
      return res.status(400).json({ message: "Invalid token" });
    }
  }

  try {
    const user = await User.findOne({
      email: decodedToken.email,
    });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(token, user.passwordResetToken);

    if (!isValid) {
      console.log("Invalid token");
      return res.status(400).json({ message: "Invalid token" });
    }

    // new password cannot be the same as the old password
    if (await bcrypt.compare(password, user.password)) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    await User.updateOne(
      { email: decodedToken.email },
      {
        $unset: {
          passwordResetToken: "",
        },
      }
    );

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
