
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      // Save user and JWT
      login(res.data);

      // Navigate according to user role
      if (res.data.role === "admin") {
        navigate("/admin");
      } else if (res.data.role === "organizer") {
        navigate("/organizer");
      } else {
        navigate("/events");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">
      <form
        onSubmit={handleLogin}
        className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl"
      >
        <p className="text-blue-400 text-sm text-center font-semibold tracking-widest uppercase">
          Connect Event
        </p>

        <h1 className="text-4xl font-bold text-center mt-3">
          Welcome back
        </h1>

        <p className="text-slate-400 text-center mt-3">
          Sign in to connect with your community.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-300 text-sm"
          >
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email address"
          autoComplete="email"
          required
          className="w-full mt-8 p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          className="w-full mt-4 p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-slate-400 mt-6">
          New user?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300"
          >
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
