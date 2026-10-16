
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Users,
  Plus,
  LayoutDashboard,
  Bell,
  CheckCircle2,
  Clock3,
  CalendarCheck,
  MapPin,
  Pencil,
  Trash2,
  Menu,
  X,
  ChevronRight,
  AlertCircle,
  CalendarClock,
  Hourglass,
  LogOut,
} from "lucide-react";

import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import notify from "../utils/toast";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, id: "overview" },
  { label: "My Events", icon: CalendarDays, id: "events" },
  { label: "Notifications", icon: Bell, id: "notifications" },
];

function getEventStatus(event) {
  const now = new Date();
  const eventDate = new Date(event.date);

  if (Number.isNaN(eventDate.getTime())) {
    return "unknown";
  }

  if (
    eventDate <
    new Date(now.getFullYear(), now.getMonth(), now.getDate())
  ) {
    return "expired";
  }

  return event.status || "pending";
}

function StatusBadge({ status }) {
  const styles = {
    approved: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    rejected: "bg-rose-400/10 text-rose-400 border-rose-400/20",
    expired: "bg-slate-700/60 text-slate-300 border-slate-600",
    unknown: "bg-slate-700/60 text-slate-300 border-slate-600",
  };

  const labels = {
    approved: "Approved",
    pending: "Pending approval",
    rejected: "Rejected",
    expired: "Expired",
    unknown: "Unknown status",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        styles[status] || styles.unknown
      }`}
    >
      {status === "approved" && <CheckCircle2 size={13} />}
      {status === "pending" && <Clock3 size={13} />}
      {status === "expired" && <CalendarClock size={13} />}
      {labels[status] || labels.unknown}
    </span>
  );
}

function OrganizerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getMyEvents = useCallback(async () => {
    setLoading(true);

    try {
      const res = await API.get("/events/my-events");
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      notify.error(
        error.response?.data?.message || "Unable to load your events."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getMyEvents();
  }, [getMyEvents]);

  const eventStats = useMemo(() => {
    const result = {
      total: events.length,
      approved: 0,
      pending: 0,
      expired: 0,
      seats: 0,
    };

    events.forEach((event) => {
      const status = getEventStatus(event);

      if (status === "expired") {
        result.expired += 1;
      } else if (status === "approved") {
        result.approved += 1;
      } else if (status === "pending") {
        result.pending += 1;
      }

      result.seats += Number(event.availableSeats) || 0;
    });

    return result;
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;

    return events.filter(
      (event) => getEventStatus(event) === filter
    );
  }, [events, filter]);

  const handleDeleteEvent = async (event) => {
    if (event.status === "approved") {
      notify.error("Approved events cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${event.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/events/${event._id}`);

      setEvents((previous) =>
        previous.filter((item) => item._id !== event._id)
      );

      notify.success("Event deleted successfully.");
    } catch (error) {
      notify.error(
        error.response?.data?.message || "Could not delete this event."
      );
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof logout !== "function") {
        notify.error(
          "Logout is not available in your authentication context."
        );
        return;
      }

      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      notify.error(
        error.response?.data?.message || "Unable to log out."
      );
    }
  };

  const changeSection = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);

    if (section === "events") {
      setFilter("all");
    }
  };

  const upcomingEvents = useMemo(() => {
    return events
      .filter(
        (event) =>
          getEventStatus(event) === "approved" &&
          new Date(event.date) >=
            new Date(new Date().setHours(0, 0, 0, 0))
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  }, [events]);

  const pageTitle =
    activeSection === "events"
      ? "My Events"
      : activeSection === "notifications"
        ? "Notifications"
        : "Organizer Overview";

  const statCards = [
    {
      label: "Total events",
      value: eventStats.total,
      icon: CalendarDays,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Approved events",
      value: eventStats.approved,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Awaiting approval",
      value: eventStats.pending,
      icon: Hourglass,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Expired events",
      value: eventStats.expired,
      icon: CalendarClock,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
              ConnectEvent
            </p>
            <h2 className="mt-1 text-lg font-bold">
              Organizer Studio
            </h2>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-800 p-5">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "O"}
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold">
                {user?.name || "Organizer"}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Event organizer
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => changeSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "border border-blue-500/20 bg-blue-500/10 text-blue-300"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>

                {item.id === "events" && (
                  <span className="ml-auto rounded-md bg-slate-800 px-2 py-0.5 text-xs">
                    {events.length}
                  </span>
                )}

                {active && (
                  <ChevronRight className="ml-auto" size={16} />
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-5">
          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center gap-2 text-blue-300">
              <CalendarCheck size={17} />
              <span className="text-sm font-semibold">
                Plan ahead
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Schedule events at least five days in advance.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-rose-500/20 px-4 py-3 text-left text-sm font-medium text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 lg:ml-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-800 p-2.5 text-slate-300 hover:bg-slate-900 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold sm:text-2xl">
                {pageTitle}
              </h1>
              <p className="mt-1 hidden text-sm text-slate-400 sm:block">
                Welcome back, {user?.name || "Organizer"}. Here's your event
                activity.
              </p>
            </div>
          </div>

          <button
            onClick={() => changeSection("notifications")}
            className="relative rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-300 transition hover:border-blue-500/40 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>
        </header>

        <div className="mx-auto max-w-[1600px] p-5 sm:p-8 lg:p-10">
          {activeSection === "overview" && (
            <>
              <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-600/15 via-slate-900 to-purple-600/10 p-6 sm:p-9">
                <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div className="max-w-xl">
                    <p className="text-sm font-medium text-blue-300">
                      YOUR EVENT WORKSPACE
                    </p>

                    <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                      Make every event
                      <span className="block text-blue-400">
                        worth remembering.
                      </span>
                    </h2>

                    <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                      Manage your events, track registrations, and keep
                      everything ready for the big day.
                    </p>

                    <Link
                      to="/create-event"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
                    >
                      <Plus size={18} />
                      Create an event
                    </Link>
                  </div>

                  <div className="hidden h-36 w-36 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/10 md:flex">
                    <CalendarDays
                      size={66}
                      strokeWidth={1.2}
                      className="text-blue-300"
                    />
                  </div>
                </div>
              </section>

              <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                          {stat.label}
                        </p>
                        <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                          <Icon size={20} className={stat.color} />
                        </div>
                      </div>

                      <p className="mt-5 text-3xl font-bold tabular-nums">
                        {loading ? "—" : stat.value}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Across your event workspace
                      </p>
                    </div>
                  );
                })}
              </section>

              <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 xl:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">
                        Upcoming events
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Your next approved events
                      </p>
                    </div>

                    <button
                      onClick={() => changeSection("events")}
                      className="text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                      View all
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {loading ? (
                      <p className="py-8 text-center text-sm text-slate-400">
                        Loading your events...
                      </p>
                    ) : upcomingEvents.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-700 px-5 py-10 text-center">
                        <CalendarDays
                          size={30}
                          className="mx-auto text-slate-500"
                        />
                        <p className="mt-3 font-medium">
                          No upcoming approved events
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Approved events will appear here.
                        </p>
                      </div>
                    ) : (
                      upcomingEvents.map((event) => (
                        <div
                          key={event._id}
                          className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center"
                        >
                          <img
                            src={
                              event.banner ||
                              "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
                            }
                            alt={event.title}
                            className="h-24 w-full rounded-lg object-cover sm:w-28"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">
                              {event.title}
                            </p>
                            <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                              <CalendarDays size={15} />
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                              <MapPin size={15} />
                              <span className="truncate">
                                {event.location}
                              </span>
                            </p>
                          </div>

                          <StatusBadge status={getEventStatus(event)} />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <h3 className="text-lg font-bold">Event reminders</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Stay ready for your event day.
                  </p>

                  <div className="mt-5 space-y-4">
                    <div className="flex gap-3 rounded-xl bg-slate-950/70 p-4">
                      <div className="h-fit rounded-lg bg-blue-500/10 p-2 text-blue-400">
                        <Bell size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          One day before
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          Reminder to prepare for the event.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 rounded-xl bg-slate-950/70 p-4">
                      <div className="h-fit rounded-lg bg-purple-500/10 p-2 text-purple-400">
                        <CalendarCheck size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Event day</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          A reminder when your event date arrives.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 rounded-xl bg-slate-950/70 p-4">
                      <div className="h-fit rounded-lg bg-amber-500/10 p-2 text-amber-400">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          After the event
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          Get notified when the event expires.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => changeSection("notifications")}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 text-sm font-medium transition hover:bg-slate-800"
                  >
                    Open notifications
                    <ChevronRight size={16} />
                  </button>
                </div>
              </section>
            </>
          )}

          {activeSection === "events" && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Manage your events</h2>
                <p className="mt-2 text-sm text-slate-400">
                  View event status, attendees, and event details.
                </p>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {["all", "approved", "pending", "rejected", "expired"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition ${
                        filter === status
                          ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                          : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      {status === "all" ? "All events" : status}
                    </button>
                  )
                )}
              </div>

              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
                  Loading events...
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
                  <CalendarDays
                    size={36}
                    className="mx-auto text-slate-500"
                  />
                  <h3 className="mt-4 text-lg font-semibold">
                    No events found
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Try another filter or create a new event.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredEvents.map((event) => {
                    const status = getEventStatus(event);
                    const approved = event.status === "approved";

                    return (
                      <article
                        key={event._id}
                        className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 transition hover:border-slate-700"
                      >
                        <img
                          src={
                            event.banner ||
                            "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
                          }
                          alt={event.title}
                          className="h-48 w-full object-cover"
                        />

                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                              {event.category || "Event"}
                            </span>
                            <StatusBadge status={status} />
                          </div>

                          <h3 className="mt-4 text-lg font-bold">
                            {event.title}
                          </h3>

                          <div className="mt-3 space-y-2 text-sm text-slate-400">
                            <p className="flex items-center gap-2">
                              <CalendarDays size={16} />
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                            <p className="flex items-center gap-2">
                              <MapPin size={16} />
                              <span className="line-clamp-1">
                                {event.location}
                              </span>
                            </p>
                            <p className="flex items-center gap-2">
                              <Users size={16} />
                              {Number(event.availableSeats) || 0} seats
                              available
                            </p>
                          </div>

                          <div className="mt-5 grid grid-cols-1 gap-2">
                            <Link
                              to={`/organizer/events/${event._id}/attendees`}
                              className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-3 text-sm font-medium transition hover:bg-slate-700"
                            >
                              <Users size={17} />
                              View attendees
                            </Link>

                            {!approved && status !== "expired" && (
                              <div className="grid grid-cols-2 gap-2">
                                <Link
                                  to={`/edit-event/${event._id}`}
                                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 text-sm text-emerald-400 transition hover:bg-slate-800"
                                >
                                  <Pencil size={16} />
                                  Edit
                                </Link>

                                <button
                                  onClick={() => handleDeleteEvent(event)}
                                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 py-3 text-sm text-rose-400 transition hover:bg-rose-500/10"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            )}

                            {approved && (
                              <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-3 text-center text-xs leading-5 text-emerald-300">
                                This approved event cannot be deleted or
                                edited from this dashboard.
                              </p>
                            )}

                            {status === "expired" && (
                              <p className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-3 text-center text-xs text-slate-400">
                                This event has expired.
                              </p>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeSection === "notifications" && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Reminders and event status updates for your events.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={21}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />
                  <div>
                    <h3 className="font-semibold">Notification feed setup</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      This page currently shows event-based reminders. To show
                      persistent notification history and unread counts, it
                      must be connected to your backend notification API.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {events
                  .filter(
                    (event) =>
                      getEventStatus(event) === "expired" ||
                      (getEventStatus(event) === "approved" &&
                        new Date(event.date) >=
                          new Date(new Date().setHours(0, 0, 0, 0)))
                  )
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((event) => {
                    const expired = getEventStatus(event) === "expired";
                    const daysUntil = Math.ceil(
                      (new Date(event.date).setHours(0, 0, 0, 0) -
                        new Date().setHours(0, 0, 0, 0)) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div
                        key={event._id}
                        className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                      >
                        <div
                          className={`rounded-xl p-3 ${
                            expired
                              ? "bg-purple-500/10 text-purple-400"
                              : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {expired ? (
                            <CalendarClock size={20} />
                          ) : (
                            <Bell size={20} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">
                            {expired
                              ? "Event expired"
                              : daysUntil === 0
                                ? "Event day"
                                : daysUntil === 1
                                  ? "Event tomorrow"
                                  : "Upcoming event"}
                          </p>
                          <p className="mt-1 text-sm text-slate-300">
                            {event.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>

                        <StatusBadge
                          status={expired ? "expired" : "approved"}
                        />
                      </div>
                    );
                  })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default OrganizerDashboard;
