"use client";
import { BACKEND_URL } from "@/backendRoutes";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { signIn } from "next-auth/react";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    // Email validation (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // Register user
      const register = await axios.post(`${BACKEND_URL}/api/signUp`, {
        username,
        email,
        password,
      });

      if (register.status !== 201) {
        alert("Registration failed. Please try again.");
        return;
      }

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res?.ok) {
        alert("Sign-in failed. Please try logging in.");
        return;
      }

      window.location.href = "/"; // Change as needed
    } catch (err) {
      console.error("Error signing up user:", err);
      alert("An error occurred while signing up. Please try again.");
    }
  };

  return (
    <div className="flex mt-10">
      {/* Left Side - Image */}
      <div className="w-1/2 hidden md:flex items-center justify-center">
        <img src="signin.jpg" alt="Sign Up Illustration" className="w-3/4 h-auto" />
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full md:w-1/2 flex items-center">
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-96">
          <h2 className="font-extrabold text-center mb-6 text-3xl">Sign Up</h2>

          <label className="input input-bordered flex items-center gap-2 mb-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="grow"
              onChange={handleChange}
              required
            />
          </label>

          <label className="input input-bordered flex items-center gap-2 mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="grow"
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
              onChange={handleChange}
              required
            />
          </label>

          <label className="input input-bordered flex items-center gap-2 mb-4">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="grow"
              onChange={handleChange}
              required
            />
          </label>

          {/* Centered Sign Up Button */}
          <div className="w-full flex">
            <button type="submit" className="btn btn-neutral w-full">
              Sign Up
            </button>
          </div>

          <p className="mt-2 text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline font-bold text-gray-900">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
