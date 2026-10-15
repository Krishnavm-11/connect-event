
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      setOtpStep(true);
      setMessage(res.data.message || "Check your email for the OTP.");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await API.post("/auth/login/verify-otp", {
        email: email.trim().toLowerCase(),
        otp,
      });

      login(res.data);

      if (res.data.role === "admin") {
        navigate("/admin");
      } else if (res.data.role === "organizer") {
        navigate("/organizer");
      } else {
        navigate("/events");
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await API.post("/auth/login/resend-otp", {
        email: email.trim().toLowerCase(),
      });

      setOtp("");
      setMessage(res.data.message || "A new OTP has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10">
      <form
        onSubmit={otpStep ? handleVerifyOTP : handleLogin}
        className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl"
      >
        <p className="text-blue-400 text-sm text-center font-semibold tracking-widest uppercase">
          Connect Event
        </p>

        <h1 className="text-4xl font-bold text-center mt-3">
          {otpStep ? "Verify email" : "Welcome back"}
        </h1>

        <p className="text-slate-400 text-center mt-3">
          {otpStep
            ? `Enter the 6-digit code sent to ${email}.`
            : "Sign in to connect with your community."}
        </p>

        {message && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-blue-500/10 border border-blue-500/30 p-3 text-blue-300 text-sm"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-300 text-sm"
          >
            {error}
          </p>
        )}

        {!otpStep ? (
          <>
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
          </>
        ) : (
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 6-digit OTP"
            aria-label="Email verification code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            className="w-full mt-8 p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-blue-400 text-center tracking-[0.5em] text-xl"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
        >
          {loading
            ? "Please wait..."
            : otpStep
              ? "Verify OTP & Login"
              : "Continue"}
        </button>

        {otpStep && (
          <div className="mt-4 flex justify-between gap-3 text-sm">
            <button
              type="button"
              disabled={loading}
              onClick={handleResendOTP}
              className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
            >
              Resend OTP
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setOtpStep(false);
                setOtp("");
                setError("");
                setMessage("");
              }}
              className="text-slate-400 hover:text-white"
            >
              Back to login
            </button>
          </div>
        )}

        {!otpStep && (
          <p className="text-center text-slate-400 mt-6">
            New user?{" "}
            <Link to="/register" className="text-blue-400 hover:text-blue-300">
              Create account
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}

export default Login;
