import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import API from "../services/api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const getNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      getNotifications();
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-gray-300 hover:text-blue-400"
      >
        <Bell />

        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-bold text-white">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <p className="text-gray-400 p-4">No notifications yet.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => markAsRead(item._id)}
                  className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800 ${!item.isRead ? "bg-slate-800/70" : ""
                    }`}
                >
                  <h4 className="text-white font-semibold">{item.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">{item.message}</p>

                  {!item.isRead && (
                    <p className="text-blue-400 text-xs mt-2">New</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;