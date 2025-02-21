"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex">
      {/* Left Side - Image */}
      <div className="w-1/2 hidden md:flex items-center justify-center">
        <img
          src="login.jpg" // Change this path to your image
          alt="Login Illustration"
          className="w-3/4 h-auto"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-8 w-96"
        >
          <h2 className="font-extrabold text-center mb-6 text-3xl">Login</h2>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <label className="input input-bordered flex items-center gap-2 mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="grow"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="input input-bordered flex items-center gap-2 mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="grow"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          {/* Centered Login Button */}
          <div className="w-full flex">
            <button type="submit" className="btn btn-neutral w-full">
              Login
            </button>
          </div>

          <p className="mt-2 text-center">
            Don't have an account?{" "}
            <Link href="/" className="underline font-bold text-gray-900">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
