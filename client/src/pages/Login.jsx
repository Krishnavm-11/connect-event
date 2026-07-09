import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      login(res.data);

      if (res.data.role === "admin") {
        navigate("/admin");
      } else if (res.data.role === "organizer") {
        navigate("/organizer");
      } else {
        navigate("/events");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <form
        onSubmit={handleLogin}
        className="bg-slate-900 p-8 rounded-3xl w-full max-w-md shadow-lg"
      >
        <h1 className="text-4xl font-bold text-center text-blue-400">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mt-8 p-4 rounded-xl bg-slate-800 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mt-4 p-4 rounded-xl bg-slate-800 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full mt-6 bg-blue-500 hover:bg-blue-600 py-3 rounded-xl font-semibold">
          Login
        </button>

        <p className="text-center text-gray-400 mt-5">
          New user?{" "}
          <Link to="/register" className="text-blue-400">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;