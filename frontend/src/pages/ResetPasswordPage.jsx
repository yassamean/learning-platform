import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      toast.loading("Loading");
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.dismiss();
        toast.error("Email not sent. Please try again later.");
        throw new Error(data.message || "Password reset failed");
      }

      toast.dismiss();
      toast.success("Email sent successfully");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white mt-10 p-8 rounded border mx-auto max-w-md dark:bg-slate-800 dark:text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
      <p className="mb-6 text-gray-700 dark:text-slate-200">
        Enter the email address associated with your account and we will send
        you a link to reset your password if an account exists.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 mb-2 dark:text-slate-200"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded dark:text-black"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
        >
          Send Email
        </button>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 dark:text-blue-400 hover:underline"
          >
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
