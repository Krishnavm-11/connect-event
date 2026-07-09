import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    profession: "",
    interests: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", {
        ...formData,
        interests: formData.interests.split(","),
      });

      login(res.data);

      navigate("/events");
    } catch (error) {
      alert(error.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">
      <form
        onSubmit={handleRegister}
        className="bg-slate-900 p-8 rounded-3xl w-full max-w-md shadow-lg"
      >
        <h1 className="text-4xl font-bold text-center text-blue-400">
          Register
        </h1>

        <input
          name="name"
          placeholder="Name"
          className="w-full mt-8 p-4 rounded-xl bg-slate-800 outline-none"
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full mt-4 p-4 rounded-xl bg-slate-800 outline-none"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full mt-4 p-4 rounded-xl bg-slate-800 outline-none"
          onChange={handleChange}
        />

        <select
          name="role"
          className="w-full mt-4 p-4 rounded-xl bg-slate-800 outline-none"
          onChange={handleChange}
        >
          <option value="user">User</option>
          <option value="organizer">Organizer</option>
        </select>

        <input
          name="profession"
          placeholder="Profession"
          className="w-full mt-4 p-4 rounded-xl bg-slate-800 outline-none"
          onChange={handleChange}
        />

        <input
          name="interests"
          placeholder="Interests: React, AI, Music"
          className="w-full mt-4 p-4 rounded-xl bg-slate-800 outline-none"
          onChange={handleChange}
        />

        <button className="w-full mt-6 bg-blue-500 hover:bg-blue-600 py-3 rounded-xl font-semibold">
          Register
        </button>

        <p className="text-center text-gray-400 mt-5">
          Already have account?{" "}
          <Link to="/login" className="text-blue-400">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;