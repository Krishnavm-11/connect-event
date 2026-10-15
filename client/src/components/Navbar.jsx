import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Clock,
  ArrowUpRight,
  Menu,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Inbox,
  ChevronRight,
} from "lucide-react";

import Navbar from "../components/Navbar";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getEvent = (registration) =>
  registration?.eventId ||
  registration?.event ||
  registration?.eventDetails ||
  {};

const getEventId = (registration) => {
  const event = getEvent(registration);

  return typeof event === "string"
    ? event
    : event?._id || event?.id || registration?.eventId?._id || "";
};

const getEventTitle = (registration) => {
  const event = getEvent(registration);

  if (typeof event === "string") {
    return registration?.eventTitle || "Event";
  }

  return (
    event?.title ||
    event?.name ||
    registration?.eventTitle ||
    "Untitled event"
  );
};

const getEventImage = (registration) => {
  const event = getEvent(registration);

  if (typeof event === "string") {
    return "";
  }

  return (
    event?.bannerImage ||
    event?.image ||
    event?.thumbnail ||
    event?.coverImage ||
    ""
  );
};

const getEventDate = (registration) => {
  const event = getEvent(registration);

  if (typeof event === "string") {
    return registration?.eventDate || registration?.date || null;
  }

  return (
    event?.date ||
    event?.eventDate ||
    registration?.eventDate ||
    registration?.date ||
    null
  );
};

const getEventLocation = (registration) => {
  const event = getEvent(registration);

  if (typeof event === "string") {
    return registration?.location || "Location unavailable";
  }

  return (
    event?.venue ||
    event?.location ||
    event?.address ||
    registration?.location ||
    "Location unavailable"
  );
};

const getRegistrationId = (registration) =>
  registration?._id || registration?.id || "";

const getPerson = (item) =>
  item?.userId ||
  item?.senderId ||
  item?.requester ||
  item?.from ||
  item?.user ||
  item?.sender ||
  {};

const getPersonName = (item) => {
  const person = getPerson(item);

  if (typeof person === "string") {
    return item?.name || "ConnectEvent member";
  }

  return (
    person?.name ||
    person?.fullName ||
    person?.username ||
    item?.name ||
    "ConnectEvent member"
  );
};

const getPersonImage = (item) => {
  const person = getPerson(item);

  if (typeof person === "string") {
    return "";
  }

  return (
    person?.profileImage ||
    person?.avatar ||
    person?.photo ||
    person?.image ||
    ""
  );
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "CE";

const StatCard = ({ title, value, description, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition duration-200 hover:border-blue-500/40">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>

        <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {value}
        </p>

        <p className="mt-2 text-xs text-slate-500">{description}</p>
      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-400">
        <Icon size={21} />
      </div>
    </div>
  </div>
);

const SectionHeading = ({ eyebrow, title, description, action }) => (
  <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          {eyebrow}
        </p>
      )}

      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {description}
        </p>
      )}
    </div>

    {action}
  </div>
);

const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 px-6 py-14 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-400">
      <Icon size={25} />
    </div>

    <h3 className="text-base font-semibold text-white">{title}</h3>

    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
      {description}
    </p>

    {action && <div className="mt-5">{action}</div>}
  </div>
);

const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
  >
    {children}
  </button>
);

const SecondaryButton = ({
  children,
  onClick,
  disabled = false,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500/50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
  >
    {children}
  </button>
);

const SidebarLink = ({
  icon: Icon,
  label,
  active,
  onClick,
  count,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm font-medium transition",
      active
        ? "border border-blue-400/15 bg-blue-500/10 text-blue-400"
        : "border border-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <span className="flex items-center gap-3">
      <Icon size={18} />
      {label}
    </span>

    {count > 0 && (
      <span
        className={cn(
          "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
          active
            ? "bg-blue-500 text-white"
            : "bg-slate-800 text-slate-300"
        )}
      >
        {count}
      </span>
    )}
  </button>
);

const TicketCard = ({ registration, onViewTicket, onOpenChat }) => {
  const eventTitle = getEventTitle(registration);
  const eventDate = getEventDate(registration);
  const eventLocation = getEventLocation(registration);
  const eventImage = getEventImage(registration);
  const eventId = getEventId(registration);

  const paymentStatus = String(
    registration?.paymentStatus || ""
  ).toLowerCase();

  const status = String(registration?.status || "").toLowerCase();

  const isPaid =
    paymentStatus === "paid" || paymentStatus === "free";

  const isPending = status === "pending";

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-200 hover:border-blue-500/40">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-44 shrink-0 overflow-hidden bg-slate-800 sm:h-auto sm:w-44">
          {eventImage ? (
            <img
              src={eventImage}
              alt={eventTitle}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-36 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
              <CalendarDays size={35} className="text-blue-400/70" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-lg font-semibold text-white">
                {eventTitle}
              </h3>

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <CalendarDays size={15} className="shrink-0 text-blue-400" />
                {formatDate(eventDate)}
                {eventDate && ` · ${formatTime(eventDate)}`}
              </p>

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={15} className="shrink-0 text-blue-400" />
                <span className="line-clamp-1">{eventLocation}</span>
              </p>
            </div>

            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                isPending
                  ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                  : isPaid
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-slate-700 bg-slate-800 text-slate-300"
              )}
            >
              {isPending ? (
                <Clock size={12} />
              ) : (
                <CheckCircle2 size={12} />
              )}

              {isPending ? "Pending" : isPaid ? "Confirmed" : "Registered"}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
            <SecondaryButton
              onClick={() => onViewTicket(registration)}
              className="flex-1 sm:flex-none"
            >
              <Ticket size={15} />
              View ticket
            </SecondaryButton>

            {eventId && !isPending && (
              <SecondaryButton
                onClick={() => onOpenChat(eventId)}
                className="flex-1 sm:flex-none"
              >
                <MessageCircle size={15} />
                Event chat
              </SecondaryButton>
            )}

            {eventId && (
              <Link
                to={`/events/${eventId}`}
                className="ml-auto inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
              >
                Event details
                <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConnectionCard = ({ connection }) => {
  const name = getPersonName(connection);
  const image = getPersonImage(connection);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-blue-500/30">
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-11 w-11 shrink-0 rounded-full border border-slate-700 object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-sm font-semibold text-blue-400">
          {getInitials(name)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{name}</p>

        <p className="mt-1 text-xs text-slate-500">Your connection</p>
      </div>

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
        <CheckCircle2 size={17} />
      </div>
    </div>
  );
};

const RequestCard = ({ request, onAction, processingId }) => {
  const name = getPersonName(request);
  const image = getPersonImage(request);
  const requestId = getRegistrationId(request);
  const processing = processingId === requestId;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-12 w-12 shrink-0 rounded-full border border-slate-700 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-sm font-semibold text-blue-400">
            {getInitials(name)}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Wants to connect with you
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onAction(requestId, "accept")}
          disabled={processing || !requestId}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 sm:flex-none"
        >
          <CheckCircle2 size={16} />
          Accept
        </button>

        <button
          type="button"
          onClick={() => onAction(requestId, "reject")}
          disabled={processing || !requestId}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-400/40 hover:bg-red-400/5 hover:text-red-300 disabled:opacity-50 sm:flex-none"
        >
          <XCircle size={16} />
          Decline
        </button>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [registrations, setRegistrations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState("");

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const loadDashboard = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const results = await Promise.allSettled([
          API.get("/registrations/my-events"),
          API.get("/connections/my-connections"),
          API.get("/connections/requests"),
        ]);

        const [registrationResult, connectionResult, requestResult] = results;

        if (registrationResult.status === "fulfilled") {
          const data = registrationResult.value?.data;

          setRegistrations(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.registrations)
                ? data.registrations
                : Array.isArray(data?.data)
                  ? data.data
                  : []
          );
        } else {
          console.error(
            "Failed to load registrations:",
            registrationResult.reason
          );
        }

        if (connectionResult.status === "fulfilled") {
          const data = connectionResult.value?.data;

          setConnections(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.connections)
                ? data.connections
                : Array.isArray(data?.data)
                  ? data.data
                  : []
          );
        } else {
          console.error(
            "Failed to load connections:",
            connectionResult.reason
          );
        }

        if (requestResult.status === "fulfilled") {
          const data = requestResult.value?.data;

          setRequests(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.requests)
                ? data.requests
                : Array.isArray(data?.data)
                  ? data.data
                  : []
          );
        } else {
          console.error(
            "Failed to load connection requests:",
            requestResult.reason
          );
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);
        showToast("Unable to refresh dashboard data.", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const confirmedTickets = useMemo(
    () =>
      registrations.filter((registration) => {
        const status = String(registration?.status || "").toLowerCase();

        const paymentStatus = String(
          registration?.paymentStatus || ""
        ).toLowerCase();

        const hasEvent = Boolean(getEventId(registration));

        return (
          hasEvent &&
          status === "registered" &&
          ["paid", "free"].includes(paymentStatus)
        );
      }),
    [registrations]
  );

  const pendingBookings = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          String(registration?.status || "").toLowerCase() === "pending"
      ),
    [registrations]
  );

  const recentTickets = useMemo(
    () => confirmedTickets.slice(0, 3),
    [confirmedTickets]
  );

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.firstName ||
    "there";

  const firstName = displayName.split(" ")[0];

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "tickets",
      label: "My tickets",
      icon: Ticket,
      count: confirmedTickets.length,
    },
    {
      id: "connections",
      label: "Connections",
      icon: Users,
      count: connections.length,
    },
    {
      id: "requests",
      label: "Connection requests",
      icon: UserRoundCheck,
      count: requests.length,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
  ];

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);

    if (section === "notifications") {
      window.dispatchEvent(
        new CustomEvent("connect-event:open-notifications")
      );
    }
  };

  const handleViewTicket = (registration) => {
    const registrationId = getRegistrationId(registration);

    if (!registrationId) {
      showToast("Ticket information is unavailable.", "error");
      return;
    }

    navigate(`/ticket/${registrationId}`);
  };

  const handleOpenChat = (eventId) => {
    if (!eventId) {
      showToast("Event chat is unavailable.", "error");
      return;
    }

    navigate(`/events/${eventId}/chat`);
  };

  const handleRequestAction = async (requestId, action) => {
    if (!requestId || processingId) {
      return;
    }

    setProcessingId(requestId);

    try {
      await API.put(`/connections/${action}/${requestId}`);

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => getRegistrationId(request) !== requestId
        )
      );

      if (action === "accept") {
        showToast("Connection request accepted.");
      } else {
        showToast("Connection request declined.");
      }

      await loadDashboard(false);
    } catch (error) {
      console.error(`Unable to ${action} connection request:`, error);

      showToast(
        error?.response?.data?.message ||
          `Unable to ${action} the request. Please try again.`,
        "error"
      );
    } finally {
      setProcessingId("");
    }
  };

  const handleRefresh = () => {
    loadDashboard(false);
  };

  const renderOverview = () => (
    <>
      <div className="mb-8 overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-br from-blue-500/10 via-slate-900 to-slate-900 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Your event space
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Welcome back, {firstName}.
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
              Your next experience starts here. Manage your tickets, discover
              events, and stay connected with your community.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Explore events
                <ArrowUpRight size={17} />
              </Link>

              <button
                type="button"
                onClick={() => handleSectionChange("tickets")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-400/40 hover:bg-slate-800"
              >
                <Ticket size={17} />
                My tickets
              </button>
            </div>
          </div>

          <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-3xl border border-blue-400/15 bg-blue-500/5 sm:flex">
            <CalendarDays size={60} strokeWidth={1.2} className="text-blue-400" />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Confirmed tickets"
          value={confirmedTickets.length}
          description="Events you're registered for"
          icon={Ticket}
        />

        <StatCard
          title="Connections"
          value={connections.length}
          description="People in your network"
          icon={Users}
        />

        <StatCard
          title="Pending requests"
          value={requests.length}
          description="Requests waiting for you"
          icon={UserRoundCheck}
        />

        <StatCard
          title="Pending bookings"
          value={pendingBookings.length}
          description="Registrations awaiting confirmation"
          icon={Clock}
        />
      </div>

      <section className="mb-8">
        <SectionHeading
          eyebrow="Your activity"
          title="Upcoming experiences"
          description="Your recently confirmed event registrations, all in one place."
          action={
            <button
              type="button"
              onClick={() => handleSectionChange("tickets")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition hover:text-blue-300"
            >
              View all
              <ChevronRight size={17} />
            </button>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 py-14">
            <RefreshCw size={22} className="animate-spin text-blue-400" />
            <span className="ml-3 text-sm text-slate-400">
              Loading your events...
            </span>
          </div>
        ) : recentTickets.length > 0 ? (
          <div className="space-y-4">
            {recentTickets.map((registration) => (
              <TicketCard
                key={getRegistrationId(registration)}
                registration={registration}
                onViewTicket={handleViewTicket}
                onOpenChat={handleOpenChat}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Your next event is waiting"
            description="You haven't confirmed an event yet. Explore upcoming events and find something you'll love."
            action={
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Explore events
                <ArrowUpRight size={16} />
              </Link>
            }
          />
        )}
      </section>

      <section>
        <SectionHeading
          eyebrow="Your community"
          title="Connection requests"
          description="Meet people and build your event community."
          action={
            requests.length > 0 ? (
              <button
                type="button"
                onClick={() => handleSectionChange("requests")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition hover:text-blue-300"
              >
                View requests
                <ChevronRight size={17} />
              </button>
            ) : null
          }
        />

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 py-10">
            <RefreshCw size={20} className="animate-spin text-blue-400" />
            <span className="ml-3 text-sm text-slate-400">
              Loading requests...
            </span>
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-3">
            {requests.slice(0, 3).map((request) => (
              <RequestCard
                key={getRegistrationId(request)}
                request={request}
                onAction={handleRequestAction}
                processingId={processingId}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="You're all caught up"
            description="When someone sends you a connection request, you'll find it here."
          />
        )}
      </section>
    </>
  );

  const renderTickets = () => (
    <section>
      <SectionHeading
        eyebrow="Your registrations"
        title="My tickets"
        description="View your confirmed registrations and open your event chats."
        action={
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Discover events
            <ArrowUpRight size={16} />
          </Link>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 py-16">
          <RefreshCw size={22} className="animate-spin text-blue-400" />
          <span className="ml-3 text-sm text-slate-400">
            Loading tickets...
          </span>
        </div>
      ) : confirmedTickets.length > 0 ? (
        <div className="space-y-4">
          {confirmedTickets.map((registration) => (
            <TicketCard
              key={getRegistrationId(registration)}
              registration={registration}
              onViewTicket={handleViewTicket}
              onOpenChat={handleOpenChat}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Ticket}
          title="No confirmed tickets yet"
          description="Once you complete an event registration, your tickets will appear here."
          action={
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Find your next event
              <ArrowUpRight size={16} />
            </Link>
          }
        />
      )}

      {!loading && pendingBookings.length > 0 && (
        <div className="mt-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">
              Pending registrations
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              These registrations are still awaiting confirmation.
            </p>
          </div>

          <div className="space-y-4">
            {pendingBookings.map((registration) => (
              <TicketCard
                key={getRegistrationId(registration)}
                registration={registration}
                onViewTicket={handleViewTicket}
                onOpenChat={handleOpenChat}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );

  const renderConnections = () => (
    <section>
      <SectionHeading
        eyebrow="Your community"
        title="Connections"
        description="Keep track of the people you've connected with."
        action={
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500/40 hover:bg-slate-800"
          >
            Discover events
            <ArrowUpRight size={16} />
          </Link>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 py-16">
          <RefreshCw size={22} className="animate-spin text-blue-400" />
          <span className="ml-3 text-sm text-slate-400">
            Loading connections...
          </span>
        </div>
      ) : connections.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {connections.map((connection, index) => (
            <ConnectionCard
              key={
                getRegistrationId(connection) ||
                connection?.userId?._id ||
                index
              }
              connection={connection}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Grow your network"
          description="Connect with people who share your interests and attend events together."
          action={
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Explore events
              <ArrowUpRight size={16} />
            </Link>
          }
        />
      )}
    </section>
  );

  const renderRequests = () => (
    <section>
      <SectionHeading
        eyebrow="Stay connected"
        title="Connection requests"
        description="Review requests and decide who you'd like to connect with."
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 py-16">
          <RefreshCw size={22} className="animate-spin text-blue-400" />
          <span className="ml-3 text-sm text-slate-400">
            Loading requests...
          </span>
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((request, index) => (
            <RequestCard
              key={getRegistrationId(request) || index}
              request={request}
              onAction={handleRequestAction}
              processingId={processingId}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UserRoundCheck}
          title="No pending requests"
          description="You're all caught up. New connection requests will appear here."
        />
      )}
    </section>
  );

  const renderNotifications = () => (
    <section>
      <SectionHeading
        eyebrow="Stay in the loop"
        title="Notifications"
        description="Keep up with updates related to your account and events."
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-400">
            <Bell size={23} />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-white">
              Stay updated with ConnectEvent
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Use the notifications panel in the main navigation to view
              available updates, event announcements, and account activity.
            </p>

            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("connect-event:open-notifications")
                )
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              <Bell size={16} />
              Open notification panel
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "tickets":
        return renderTickets();

      case "connections":
        return renderConnections();

      case "requests":
        return renderRequests();

      case "notifications":
        return renderNotifications();

      case "overview":
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {toast && (
        <div
          role="status"
          className={cn(
            "fixed right-4 top-20 z-[100] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl sm:right-6",
            toast.type === "error"
              ? "border-red-400/20 bg-slate-900 text-red-300"
              : "border-emerald-400/20 bg-slate-900 text-emerald-300"
          )}
        >
          {toast.type === "error" ? (
            <XCircle size={19} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          )}

          <p className="flex-1 text-sm leading-5">{toast.message}</p>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="shrink-0 text-slate-500 transition hover:text-white"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
              ConnectEvent
            </p>

            <h1 className="mt-1 text-lg font-semibold text-white">
              My dashboard
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-blue-500/40 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            />
          )}

          <aside
            className={cn(
              "fixed bottom-0 left-0 top-0 z-50 w-[280px] overflow-y-auto border-r border-slate-800 bg-slate-950 p-5 transition-transform duration-200 lg:sticky lg:top-24 lg:z-0 lg:h-[calc(100vh-8rem)] lg:w-auto lg:translate-x-0 lg:rounded-2xl lg:border lg:bg-slate-900/70 lg:p-4",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="mb-7 hidden border-b border-slate-800 px-2 pb-5 lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                ConnectEvent
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Dashboard
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your personal event space
              </p>
            </div>

            <div className="mb-5 flex items-center justify-between lg:hidden">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  ConnectEvent
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Navigation
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Workspace
            </p>

            <nav className="space-y-1.5">
              {navigationItems.map((item) => (
                <SidebarLink
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeSection === item.id}
                  count={item.count}
                  onClick={() => handleSectionChange(item.id)}
                />
              ))}
            </nav>

            <div className="mt-8 border-t border-slate-800 pt-5">
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Discover
              </p>

              <Link
                to="/events"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-between rounded-xl border border-blue-400/10 bg-blue-500/5 px-3.5 py-3 text-sm font-medium text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <CalendarDays size={18} className="text-blue-400" />
                  Explore events
                </span>

                <ArrowUpRight size={16} className="text-slate-500" />
              </Link>
            </div>

            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4 lg:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-sm font-semibold text-blue-400">
                  {getInitials(displayName)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {displayName}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user?.email || "Event enthusiast"}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-6 hidden items-center justify-between lg:flex">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Personal workspace
                </p>

                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  {navigationItems.find(
                    (item) => item.id === activeSection
                  )?.label || "Overview"}
                </h1>
              </div>

              <SecondaryButton
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </SecondaryButton>
            </div>

            <div className="mb-5 flex justify-end lg:hidden">
              <SecondaryButton
                onClick={handleRefresh}
                disabled={refreshing}
                className="py-2"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </SecondaryButton>
            </div>

            <div className="min-w-0">{renderContent()}</div>

            <footer className="mt-12 border-t border-slate-800 py-5">
              <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  © {new Date().getFullYear()} ConnectEvent
                </p>

                <p className="flex items-center gap-1.5">
                  Made for meaningful connections
                  <MessageCircle size={13} className="text-blue-400" />
                </p>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;