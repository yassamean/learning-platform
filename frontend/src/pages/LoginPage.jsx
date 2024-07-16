import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import ReCAPTCHA from "react-google-recaptcha";
import { API_BASE_URL } from "../config";

const LoginPage = () => {
  const recaptcha = useRef();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let captchaValue = "";

    if (import.meta.env.MODE === "production") {
      captchaValue = recaptcha.current.getValue();

      if (!captchaValue) {
        setError("Please complete the reCAPTCHA");
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, captchaValue }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (import.meta.env.MODE === "production") {
          recaptcha.current.reset();
        }
        throw new Error(data.message || "Login failed");
      }
      login(data.token);
      navigate(location.state?.from || "/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="bg-white mt-10 p-8 rounded border mx-auto max-w-md dark:text-white dark:bg-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 mb-2 dark:text-slate-200"
            htmlFor="identifier"
          >
            Username or Email
          </label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded dark:text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 mb-2 dark:text-slate-200"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded dark:text-black"
            required
          />
        </div>
        {import.meta.env.MODE === "production" ? (
          <div className="mb-4">
            <ReCAPTCHA
              sitekey="6Leb0f0pAAAAAEIHe2ZYSnst33YlW16v1F_TWUb2"
              ref={recaptcha}
            />
          </div>
        ) : null}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
        >
          Login
        </button>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:underline dark:text-blue-400"
          >
            Register here
          </Link>
        </p>
        <p className="mt-4 text-center">
          Forgot your password?{" "}
          <Link
            to="/reset-password"
            className="text-blue-500 hover:underline dark:text-blue-400"
          >
            Reset it here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
