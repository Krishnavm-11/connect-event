
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Users,
  UserRoundCheck,
  Bell,
  CalendarDays,
  MessageCircle,
  MapPin,
  ArrowUpRight,
  Menu,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Inbox,
  ChevronRight,
  Clock,
} from "lucide-react";

import Navbar from "../components/Navbar";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "tickets", label: "My Tickets", icon: Ticket },
  { id: "connections", label: "My Connections", icon: Users },
  { id: "requests", label: "Connection Requests", icon: UserRoundCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const StatCard = ({ icon: Icon, label, value, description }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 sm:p-6">
    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/5 blur-2xl transition-colors duration-300 group-hover:bg-blue-500/10" />

    <div className="relative flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-400 transition-colors group-hover:text-slate-300">
          {label}
        </p>

        <p className="mt-3 break-words text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {value ?? 0}
        </p>

        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 transition-all duration-300 group-hover:border-blue-400/40 group-hover:bg-blue-500/15 group-hover:text-blue-300 sm:h-12 sm:w-12">
        {Icon && <Icon size={21} strokeWidth={1.8} />}
      </div>
    </div>

    <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transition-colors group-hover:via-blue-400/50" />
  </div>
);

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 px-6 py-12 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-slate-400">
      <Icon size={25} />
    </div>

    <h3 className="mt-4 font-semibold text-white">{title}</h3>

    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
      {description}
    </p>

    {action && <div className="mt-5">{action}</div>}
  </div>
);

function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [registrations, setRegistrations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });

    window.setTimeout(() => {
      setToast((current) =>
        current?.message === message ? null : current
      );
    }, 3500);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const [eventsResult, connectionsResult, requestsResult] =
        await Promise.allSettled([
          API.get("/registrations/my-events"),
          API.get("/connections/my-connections"),
          API.get("/connections/requests"),
        ]);

      if (eventsResult.status === "fulfilled") {
        const data = eventsResult.value.data;
        setRegistrations(
          Array.isArray(data) ? data : data?.registrations || []
        );
      } else {
        console.error(
          "Could not load registrations:",
          eventsResult.reason
        );
      }

      if (connectionsResult.status === "fulfilled") {
        const data = connectionsResult.value.data;
        setConnections(
          Array.isArray(data) ? data : data?.connections || []
        );
      } else {
        console.error(
          "Could not load connections:",
          connectionsResult.reason
        );
      }

      if (requestsResult.status === "fulfilled") {
        const data = requestsResult.value.data;
        setRequests(
          Array.isArray(data) ? data : data?.requests || []
        );
      } else {
        console.error(
          "Could not load connection requests:",
          requestsResult.reason
        );
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
      showToast("Unable to refresh your dashboard.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const confirmedTickets = registrations.filter(
    (item) =>
      item.status === "registered" &&
      ["paid", "free"].includes(item.paymentStatus) &&
      item.event
  );

  // Create reminders for confirmed events happening today or tomorrow.
  const eventReminders = confirmedTickets
    .map((item) => {
      const event = item.event;
      const rawDate = event?.date || event?.startDate;

      if (!rawDate) return null;

      const eventDate = new Date(rawDate);

      if (Number.isNaN(eventDate.getTime())) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      eventDate.setHours(0, 0, 0, 0);

      if (eventDate.getTime() === today.getTime()) {
        return {
          id: item._id,
          title: event.title || "Your event",
          date: rawDate,
          type: "today",
          message: `${event.title || "Your event"} is happening today!`,
        };
      }

      if (eventDate.getTime() === tomorrow.getTime()) {
        return {
          id: item._id,
          title: event.title || "Your event",
          date: rawDate,
          type: "tomorrow",
          message: `Reminder: ${event.title || "Your event"} is tomorrow!`,
        };
      }

      return null;
    })
    .filter(Boolean);

  const handleNavigation = (section) => {
    setSidebarOpen(false);
    setActiveSection(section);

    if (section === "notifications") {
      window.dispatchEvent(
        new Event("connect-event:open-notifications")
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRequest = async (requestId, action) => {
    const actionKey = `${action}-${requestId}`;
    setActionLoading(actionKey);

    try {
      await API.put(`/connections/${action}/${requestId}`);

      setRequests((current) =>
        current.filter((request) => request._id !== requestId)
      );

      if (action === "accept") {
        showToast("Connection request accepted.");
        await loadDashboard();
      } else {
        showToast("Connection request declined.");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Unable to process this request.",
        "error"
      );
    } finally {
      setActionLoading("");
    }
  };

  const getPerson = (item) =>
    item?.sender ||
    item?.requester ||
    item?.from ||
    item?.user ||
    item;

  const getPersonName = (item) => {
    const person = getPerson(item);
    return person?.name || person?.fullName || "ConnectEvent Member";
  };

  const getInitials = (name = "U") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const formatDate = (date) => {
    if (!date) return "Date to be announced";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date to be announced";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const pageTitle =
    navigation.find((item) => item.id === activeSection)?.label ||
    "Overview";

  const firstName = user?.name?.trim()?.split(" ")[0] || "there";

  const PersonAvatar = ({ person, name }) => (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800 text-sm font-bold text-blue-300">
      {person?.profileImage || person?.avatar ? (
        <img
          src={person.profileImage || person.avatar}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );

  const renderTicketCard = (item) => {
    const event = item.event;
    const eventId = event?._id;

    return (
      <article
        key={item._id}
        className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-black/20"
      >
        <div className="relative h-40 overflow-hidden bg-slate-800">
          {event?.banner || event?.image || event?.coverImage ? (
            <img
              src={event.banner || event.image || event.coverImage}
              alt={event.title || "Event"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950">
              <CalendarDays size={42} className="text-blue-400" />
            </div>
          )}

          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-emerald-300 shadow-sm">
            <CheckCircle2 size={14} />
            Confirmed
          </span>
        </div>

        <div className="p-5">
          <h3 className="line-clamp-2 text-lg font-bold text-white">
            {event?.title || "Event"}
          </h3>

          <div className="mt-3 space-y-2 text-sm text-slate-400">
            <p className="flex items-center gap-2">
              <CalendarDays size={16} className="shrink-0 text-blue-400" />
              {formatDate(event?.date || event?.startDate)}
            </p>

            <p className="flex items-center gap-2">
              <MapPin size={16} className="shrink-0 text-blue-400" />
              <span className="line-clamp-1">
                {event?.location || event?.venue || "Location to be announced"}
              </span>
            </p>

            {item.ticketNumber && (
              <p className="text-xs text-slate-500">
                Ticket: {item.ticketNumber}
              </p>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigate(`/ticket/${item._id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <Ticket size={16} />
              View Ticket
            </button>

            <button
              type="button"
              disabled={!eventId}
              onClick={() => navigate(`/events/${eventId}/chat`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageCircle size={16} />
              Event Chat
            </button>
          </div>
        </div>
      </article>
    );
  };

  const renderConnections = () => {
    if (connections.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title="Your network starts here"
          description="Connect with people who share your interests and attend events together."
          action={
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Explore Events <ArrowUpRight size={16} />
            </Link>
          }
        />
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {connections.map((item) => {
          const person = getPerson(item);
          const name = getPersonName(item);

          return (
            <div
              key={item._id || person?._id || name}
              className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700"
            >
              <PersonAvatar person={person} name={name} />

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{name}</p>
                <p className="mt-1 truncate text-sm text-slate-400">
                  {person?.profession ||
                    person?.occupation ||
                    "ConnectEvent Member"}
                </p>
              </div>

              <CheckCircle2
                size={19}
                className="shrink-0 text-emerald-400"
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderRequests = () => {
    if (requests.length === 0) {
      return (
        <EmptyState
          icon={Inbox}
          title="No pending requests"
          description="When someone sends you a connection request, it will appear here."
        />
      );
    }

    return (
      <div className="space-y-3">
        {requests.map((request) => {
          const person = getPerson(request);
          const name = getPersonName(request);
          const accepting = actionLoading === `accept-${request._id}`;
          const rejecting = actionLoading === `reject-${request._id}`;

          return (
            <div
              key={request._id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center"
            >
              <PersonAvatar person={person} name={name} />

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white">{name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {person?.profession ||
                    person?.occupation ||
                    "Would like to connect with you"}
                </p>

                {person?.email && (
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {person.email}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={Boolean(actionLoading)}
                  onClick={() => handleRequest(request._id, "accept")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  {accepting ? "Accepting..." : "Accept"}
                </button>

                <button
                  type="button"
                  disabled={Boolean(actionLoading)}
                  onClick={() => handleRequest(request._id, "reject")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  {rejecting ? "Declining..." : "Decline"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderNotifications = () => {
    if (eventReminders.length === 0) {
      return (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="Event reminders will appear here one day before your event and on the event day."
          action={
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Explore Events <ArrowUpRight size={16} />
            </Link>
          }
        />
      );
    }

    return (
      <div className="space-y-4">
        {eventReminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`flex items-start gap-4 rounded-2xl border p-5 ${
              reminder.type === "today"
                ? "border-blue-500/40 bg-blue-500/10"
                : "border-amber-500/30 bg-amber-500/5"
            }`}
          >
            <div
              className={`rounded-xl p-3 ${
                reminder.type === "today"
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {reminder.type === "today" ? (
                <Bell size={22} />
              ) : (
                <Clock size={22} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">
                {reminder.type === "today"
                  ? "Event Today"
                  : "Event Tomorrow"}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-300">
                {reminder.message}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {formatDate(reminder.date)}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(`/events/${reminder.id}`)
                }
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                View event <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const sectionContent = () => {
    if (loading) {
      return (
        <div className="flex min-h-64 flex-col items-center justify-center text-slate-400">
          <RefreshCw size={28} className="animate-spin text-blue-400" />
          <p className="mt-3 text-sm">Loading your dashboard...</p>
        </div>
      );
    }

    switch (activeSection) {
      case "tickets":
        return confirmedTickets.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {confirmedTickets.map(renderTicketCard)}
          </div>
        ) : (
          <EmptyState
            icon={Ticket}
            title="No confirmed tickets yet"
            description="Discover an event that interests you and your confirmed tickets will appear here."
            action={
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Explore Events <ArrowUpRight size={16} />
              </Link>
            }
          />
        );

      case "connections":
        return renderConnections();

      case "requests":
        return renderRequests();

      case "notifications":
        return renderNotifications();

      case "overview":
      default:
        return (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                icon={Ticket}
                label="Confirmed Tickets"
                value={confirmedTickets.length}
                description="Your confirmed event bookings"
              />

              <StatCard
                icon={Users}
                label="My Connections"
                value={connections.length}
                description="People in your network"
              />

              <StatCard
                icon={UserRoundCheck}
                label="New Requests"
                value={requests.length}
                description="Connection requests to review"
              />
            </div>

            {eventReminders.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Event Reminders
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Events happening today or tomorrow
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigation("notifications")}
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                  >
                    View all <ChevronRight size={17} />
                  </button>
                </div>

                <div className="space-y-3">
                  {eventReminders.slice(0, 2).map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`flex items-start gap-3 rounded-2xl border p-4 ${
                        reminder.type === "today"
                          ? "border-blue-500/40 bg-blue-500/10"
                          : "border-amber-500/30 bg-amber-500/5"
                      }`}
                    >
                      <Bell
                        size={20}
                        className={
                          reminder.type === "today"
                            ? "mt-0.5 text-blue-400"
                            : "mt-0.5 text-amber-400"
                        }
                      />

                      <div>
                        <p className="font-semibold text-white">
                          {reminder.message}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(reminder.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Your Upcoming Events
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Your most recent confirmed tickets
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigation("tickets")}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  View all <ChevronRight size={17} />
                </button>
              </div>

              {confirmedTickets.length ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {confirmedTickets.slice(0, 3).map(renderTicketCard)}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="Your next event is waiting"
                  description="Browse upcoming events and find something worth attending."
                  action={
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      Discover Events <ArrowUpRight size={16} />
                    </Link>
                  }
                />
              )}
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Connection Requests
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Build your event community
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigation("requests")}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  View all <ChevronRight size={17} />
                </button>
              </div>

              {requests.length ? (
                renderRequests()
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
                  You're all caught up. New connection requests will appear here.
                </div>
              )}
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {toast && (
        <div
          role="status"
          className={`fixed right-4 top-20 z-[100] flex max-w-sm items-center gap-3 rounded-xl border bg-slate-900 px-4 py-3 shadow-xl ${
            toast.type === "error"
              ? "border-red-500/30 text-red-300"
              : "border-emerald-500/30 text-emerald-300"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle size={20} className="shrink-0" />
          ) : (
            <CheckCircle2 size={20} className="shrink-0" />
          )}

          <p className="flex-1 text-sm font-medium">{toast.message}</p>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setToast(null)}
            className="rounded-lg p-1 transition hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Member dashboard
            </p>
            <h1 className="mt-1 text-xl font-bold text-white">
              Welcome, {firstName}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 transition hover:bg-slate-800"
          >
            {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]">
          <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm lg:sticky lg:top-24">
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/15 text-lg font-bold text-blue-300">
                  {getInitials(user?.name || "U")}
                </div>

                <h2 className="mt-4 truncate text-lg font-bold">
                  {user?.name || "Event Member"}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-400">
                  {user?.email || "Welcome to ConnectEvent"}
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Member account
                </div>
              </div>

              <nav className="p-3" aria-label="User dashboard navigation">
                <p className="px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Workspace
                </p>

                {navigation.map(({ id, label, icon: Icon }) => {
                  const active = activeSection === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleNavigation(id)}
                      aria-current={active ? "page" : undefined}
                      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                        active
                          ? "border border-blue-500/10 bg-blue-500/10 text-blue-300"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon
                        size={19}
                        className={active ? "text-blue-400" : "text-slate-500"}
                      />

                      <span className="flex-1">{label}</span>

                      {active && (
                        <span className="h-5 w-1 rounded-full bg-blue-400" />
                      )}
                    </button>
                  );
                })}

                <div className="my-4 border-t border-slate-800" />

                <Link
                  to="/events"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-blue-300"
                >
                  <CalendarDays size={19} className="text-slate-500" />
                  <span className="flex-1">Explore Events</span>
                  <ArrowUpRight size={16} className="text-slate-500" />
                </Link>
              </nav>

              <div className="mx-3 mb-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <MessageCircle size={17} className="text-blue-400" />
                  Meet your community
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Discover events, meet people, and build meaningful connections.
                </p>

                <Link
                  to="/events"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-400 transition hover:text-blue-300"
                >
                  Find an event <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-6 hidden items-center justify-between gap-4 lg:flex">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                  Your workspace
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white xl:text-3xl">
                  {activeSection === "overview"
                    ? `Welcome back, ${firstName}`
                    : pageTitle}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  {activeSection === "overview"
                    ? "Your events, connections, and community — all in one place."
                    : `Manage your ${pageTitle.toLowerCase()} in one place.`}
                </p>
              </div>

              <button
                type="button"
                onClick={loadDashboard}
                disabled={loading}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
              <div>
                <h2 className="text-lg font-bold text-white">{pageTitle}</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Manage your ConnectEvent activity
                </p>
              </div>

              <button
                type="button"
                onClick={loadDashboard}
                disabled={loading}
                aria-label="Refresh dashboard"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>

            {sectionContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
