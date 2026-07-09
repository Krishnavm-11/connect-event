import { Bell, UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminTopbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-8">

      <div>
        <h1 className="text-2xl font-bold text-white">
          Admin Dashboard
        </h1>

        <p className="text-gray-400 text-sm">
          Manage your platform
        </p>
      </div>

      <div className="flex items-center gap-6">

        <button className="text-gray-300 hover:text-white transition">
          <Bell size={22} />
        </button>

        <div className="flex items-center gap-3">

          <UserCircle
            size={34}
            className="text-blue-400"
          />

          <div>
            <p className="text-white font-medium">
              {user?.name}
            </p>

            <p className="text-gray-400 text-sm">
              Administrator
            </p>
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-white transition"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </header>
  );
}

export default AdminTopbar;