import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import API from "../services/api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const response = await API.get("/notifications");
      const data = response.data;

      setNotifications(
        Array.isArray(data)
          ? data
          : data?.notifications || []
      );
    } catch (error) {
      console.error(
        "Load notifications error:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  // Allow the dashboard sidebar to open this navbar notification panel.
  useEffect(() => {
    const handleOpenNotifications = () => {
      setOpen(true);
      getNotifications();
    };

    window.addEventListener(
      "connect-event:open-notifications",
      handleOpenNotifications
    );

    return () => {
      window.removeEventListener(
        "connect-event:open-notifications",
        handleOpenNotifications
      );
    };
  }, [getNotifications]);

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);

          if (!open) {
            getNotifications();
          }
        }}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-800 hover:text-blue-400"
      >
        <Bell size={21} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-slate-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <div>
                <h3 className="font-bold text-white">Notifications</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {unreadCount
                    ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                    : "You're all caught up"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notification panel"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {loading && notifications.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">
                Loading notifications...
              </p>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell
                  size={30}
                  className="mx-auto text-slate-600"
                />
                <p className="mt-3 font-medium text-white">
                  No notifications yet
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Updates about your events will appear here.
                </p>
              </div>
            ) : (
              <div className="max-h-[min(420px,65vh)] overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item._id}
                    className={`border-b border-slate-800 p-4 transition hover:bg-slate-800/70 ${
                      !item.isRead ? "bg-blue-500/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          !item.isRead
                            ? "bg-blue-400"
                            : "bg-slate-700"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-white">
                          {item.title || "Notification"}
                        </h4>

                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-400">
                          {item.message}
                        </p>

                        {!item.isRead && (
                          <button
                            type="button"
                            onClick={() => markAsRead(item._id)}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
                          >
                            <CheckCheck size={14} />
                            Mark as read
                          </button>
                        )}

                        {item.isRead && (
                          <p className="mt-2 text-xs text-slate-500">
                            Read
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;