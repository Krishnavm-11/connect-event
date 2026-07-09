import { Link, useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-950/90 backdrop-blur-lg text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Connect<span className="text-blue-400">Event</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <Link to="/" className="hover:text-blue-400 transition">
            Home
          </Link>

          <Link to="/events" className="hover:text-blue-400 transition">
            Events
          </Link>

          <Link to="/" className="hover:text-blue-400 transition">
            Categories
          </Link>

          <Link to="/about" className="hover:text-blue-400 transition">
            About
          </Link>

          <Link to="/contact" className="hover:text-blue-400 transition">
            Contact
          </Link>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            {user.role === "user" && (
              <Link
                to="/dashboard"
                className="hidden sm:block hover:text-blue-400 transition"
              >
                Dashboard
              </Link>
            )}

            {user.role === "organizer" && (
              <Link
                to="/organizer"
                className="hidden sm:block hover:text-blue-400 transition"
              >
                Dashboard
              </Link>
            )}

            {user.role === "admin" && (
              <Link
                to="/admin"
                className="hidden sm:block hover:text-blue-400 transition"
              >
                Dashboard
              </Link>
            )}

            {user.role === "admin" && (
              <Link
                to="/admin"
                className="hidden sm:block hover:text-blue-400 transition"
              >
                Admin
              </Link>
            )}

            <NotificationBell />

            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-700">
              <UserCircle className="text-blue-400" />
              <span className="font-semibold">{user.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-full transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;