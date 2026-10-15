import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Bell,
  MessageCircle,
  Ticket,
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  MapPin,
} from "lucide-react";

import Navbar from "../components/Navbar";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myEvents, setMyEvents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [toast, setToast] = useState(null);

  // Toast messages are handled directly in this file.
  const showToast = (message, type = "success") => {
    setToast({ message, type });

    // Automatically hide the message after 3.5 seconds.
    window.setTimeout(() => {
      setToast((current) =>
        current?.message === message ? null : current
      );
    }, 3500);
  };

  const getMyEvents = useCallback(async () => {
    setLoadingEvents(true);

    try {
      const response = await API.get("/registrations/my-events");

      // The backend returns { registrations: [...] }.
      const registrations = Array.isArray(response.data)
        ? response.data
        : response.data?.registrations || [];

      setMyEvents(registrations);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Unable to load your tickets.",
        "error"
      );
      setMyEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const getConnections = useCallback(async () => {
    try {
      const response = await API.get("/connections/my-connections");
      const data = response.data;

      setConnections(
        Array.isArray(data)
          ? data
          : data?.connections || []
      );
    } catch (error) {
      console.error(
        "Load connections error:",
        error.response?.data?.message || error.message
      );
    }
  }, []);

  const getRequests = useCallback(async () => {
    try {
      const response = await API.get("/connections/requests");
      const data = response.data;

      setRequests(
        Array.isArray(data)
          ? data
          : data?.requests || []
      );
    } catch (error) {
      console.error(
        "Load requests error:",
        error.response?.data?.message || error.message
      );
    }
  }, []);

  const acceptRequest = async (id) => {
    try {
      await API.put(`/connections/accept/${id}`);
      showToast("Connection request accepted.");
      await Promise.all([getRequests(), getConnections()]);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Unable to accept the request.",
        "error"
      );
    }
  };

  const rejectRequest = async (id) => {
    try {
      await API.put(`/connections/reject/${id}`);
      showToast("Connection request rejected.");
      await getRequests();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Unable to reject the request.",
        "error"
      );
    }
  };

  useEffect(() => {
    getMyEvents();
    getConnections();
    getRequests();
  }, [getMyEvents, getConnections, getRequests]);

  // Only show registrations that have a confirmed ticket.
  const confirmedTickets = myEvents.filter(
    (item) =>
      item.status === "registered" &&
      ["paid", "free"].includes(item.paymentStatus) &&
      item.event
  );

  const activePendingBookings = myEvents.filter(
    (item) => item.status === "pending"
  );

  return (
    <>
      <Navbar />

      {/* Inline toast: no separate component/file and no alert() */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-4 z-[100] max-w-sm w-[calc(100%-2rem)] rounded-2xl border p-4 shadow-2xl flex items-start gap-3 ${
            toast.type === "error"
              ? "bg-red-950 border-red-500/40 text-red-100"
              : "bg-emerald-950 border-emerald-500/40 text-emerald-100"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle className="shrink-0 text-red-400" size={22} />
          ) : (
            <CheckCircle2
              className="shrink-0 text-emerald-400"
              size={22}
            />
          )}

          <p className="text-sm flex-1">{toast.message}</p>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Close message"
            className="opacity-70 hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <main className="min-h-screen bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest">
              Your personal space
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold mt-3">
              Welcome back,{" "}
              <span className="text-blue-400">
                {user?.name || "Member"}
              </span>{" "}
              👋
            </h1>

            <p className="text-gray-300 mt-3">
              Manage your event bookings, tickets, connections and conversations.
            </p>

            <button
              type="button"
              onClick={() => navigate("/events")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 px-5 py-3 font-semibold transition"
            >
              <Calendar size={18} />
              Explore Events
            </button>
          </section>

          {/* Dashboard summary */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <Ticket className="text-blue-400" size={30} />
              <h2 className="text-3xl font-bold mt-4">
                {confirmedTickets.length}
              </h2>
              <p className="text-gray-400 mt-1">Confirmed Bookings</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <Users className="text-blue-400" size={30} />
              <h2 className="text-3xl font-bold mt-4">
                {connections.length}
              </h2>
              <p className="text-gray-400 mt-1">Connections</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <Bell className="text-blue-400" size={30} />
              <h2 className="text-3xl font-bold mt-4">{requests.length}</h2>
              <p className="text-gray-400 mt-1">Connection Requests</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <MessageCircle className="text-blue-400" size={30} />
              <h2 className="text-3xl font-bold mt-4">—</h2>
              <p className="text-gray-400 mt-1">Event Chats</p>
            </div>
          </section>

          {/* All confirmed tickets */}
          <section className="mt-10 bg-slate-900 border border-slate-800 p-5 sm:p-7 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Ticket size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">My Tickets</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    View all your confirmed event tickets.
                  </p>
                </div>
              </div>

              <span className="text-sm text-gray-400">
                {confirmedTickets.length} confirmed
              </span>
            </div>

            {loadingEvents ? (
              <p className="text-gray-400 py-6">Loading your tickets...</p>
            ) : confirmedTickets.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-700 rounded-2xl">
                <Ticket className="mx-auto text-gray-500" size={38} />
                <p className="font-semibold mt-4">No confirmed tickets yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Your tickets will appear here after your booking is confirmed.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/events")}
                  className="mt-5 bg-blue-500 hover:bg-blue-600 rounded-xl px-5 py-3 font-semibold"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {confirmedTickets.map((item) => (
                  <article
                    key={item._id}
                    className="overflow-hidden bg-slate-800/70 border border-slate-700 rounded-2xl"
                  >
                    {item.event?.banner && (
                      <img
                        src={item.event.banner}
                        alt={item.event.title || "Event banner"}
                        className="w-full h-40 object-cover"
                      />
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xl font-bold">
                          {item.event?.title || "Event"}
                        </h3>

                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-400 px-3 py-1 text-xs font-semibold">
                          <CheckCircle2 size={14} />
                          Confirmed
                        </span>
                      </div>

                      <p className="text-sm text-gray-400 mt-3 flex items-center gap-2">
                        <Calendar size={16} />
                        {item.event?.date
                          ? new Date(item.event.date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Date unavailable"}
                        {item.event?.time ? ` · ${item.event.time}` : ""}
                      </p>

                      <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                        <MapPin size={16} />
                        {item.event?.venue || "Venue unavailable"}
                        {item.event?.location
                          ? `, ${item.event.location}`
                          : ""}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-slate-900 rounded-xl p-3">
                          <p className="text-xs text-gray-500">Seats</p>
                          <p className="font-semibold mt-1">
                            {item.selectedSeats?.length
                              ? item.selectedSeats
                                  .map((seat) => `#${seat}`)
                                  .join(", ")
                              : "Not listed"}
                          </p>
                        </div>

                        <div className="bg-slate-900 rounded-xl p-3">
                          <p className="text-xs text-gray-500">Total paid</p>
                          <p className="font-semibold mt-1">
                            ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-4 break-all">
                        Ticket number: {item.ticketNumber || "Pending"}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-5">
                        <button
                          type="button"
                          onClick={() => navigate(`/ticket/${item._id}`)}
                          className="inline-flex items-center justify-center gap-2 flex-1 bg-blue-500 hover:bg-blue-600 rounded-xl px-4 py-3 text-sm font-semibold transition"
                        >
                          <Eye size={17} />
                          View Ticket
                        </button>

                        <Link
                          to={`/events/${item.event?._id}/chat`}
                          className="inline-flex items-center justify-center gap-2 flex-1 bg-slate-700 hover:bg-slate-600 rounded-xl px-4 py-3 text-sm font-semibold transition"
                        >
                          <MessageCircle size={17} />
                          Open Chat
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activePendingBookings.length > 0 && (
              <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                You have {activePendingBookings.length} booking
                {activePendingBookings.length > 1 ? "s" : ""} awaiting confirmation.
                A ticket will appear here after the booking is confirmed.
              </div>
            )}
          </section>

          {/* Connections and requests */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-7 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-blue-400" />
                <h2 className="text-2xl font-bold">My Connections</h2>
              </div>

              {connections.length === 0 ? (
                <p className="text-gray-400">No connections yet.</p>
              ) : (
                <div className="space-y-3">
                  {connections.map((item) => {
                    const sender = item.sender;
                    const receiver = item.receiver;

                    const currentUserId = user?._id || user?.id;
                    const senderId = sender?._id || sender;
                    const otherUser =
                      String(senderId) === String(currentUserId)
                        ? receiver
                        : sender;

                    if (!otherUser || typeof otherUser !== "object") {
                      return null;
                    }

                    return (
                      <div
                        key={item._id}
                        className="bg-slate-800 border border-slate-700 p-4 rounded-2xl"
                      >
                        <h3 className="font-semibold">
                          {otherUser.name || "Connected member"}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {otherUser.profession || otherUser.email || ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-7 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="text-blue-400" />
                <h2 className="text-2xl font-bold">Connection Requests</h2>
              </div>

              {requests.length === 0 ? (
                <p className="text-gray-400">No pending requests.</p>
              ) : (
                <div className="space-y-4">
                  {requests.map((item) => (
                    <div
                      key={item._id}
                      className="bg-slate-800 border border-slate-700 p-5 rounded-2xl"
                    >
                      <h3 className="font-semibold">
                        {item.sender?.name || "Member"}
                      </h3>

                      <p className="text-gray-400 text-sm mt-1">
                        {item.sender?.profession || ""}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => acceptRequest(item._id)}
                          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold"
                        >
                          <UserCheck size={17} />
                          Accept
                        </button>

                        <button
                          type="button"
                          onClick={() => rejectRequest(item._id)}
                          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold"
                        >
                          <UserX size={17} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default UserDashboard;