import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar,Users,PlusCircle,BarChart3,MapPin,Pencil,Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function OrganizerDashboard() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);

  const getMyEvents = async () => {
    try {
      const res = await API.get("/events/my-events");
      setEvents(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/events/${id}`);

      alert("Event deleted successfully");

      getMyEvents();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  useEffect(() => {
    getMyEvents();
  }, []);

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">

          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-slate-800 rounded-3xl p-8">

            <h1 className="text-4xl font-bold">
              Welcome, {user?.name} 👋
            </h1>

            <p className="text-gray-300 mt-3">
              Manage your events and grow your community.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

              <Calendar className="text-blue-400" size={32} />

              <h2 className="text-4xl font-bold mt-4">
                {events.length}
              </h2>

              <p className="text-gray-400">
                My Events
              </p>

            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

              <Users className="text-blue-400" size={32} />

              <h2 className="text-4xl font-bold mt-4">
                {events.reduce(
                  (total, event) =>
                    total + (event.availableSeats || 0),
                  0
                )}
              </h2>

              <p className="text-gray-400">
                Seats Available
              </p>

            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

              <BarChart3 className="text-blue-400" size={32} />

              <h2 className="text-4xl font-bold mt-4">
                {
                  events.filter(
                    (event) => event.status === "approved"
                  ).length
                }
              </h2>

              <p className="text-gray-400">
                Approved
              </p>

            </div>

            <Link
              to="/create-event"
              className="bg-blue-500 hover:bg-blue-600 rounded-3xl p-6 flex flex-col justify-center items-center transition"
            >
              <PlusCircle size={40} />

              <p className="mt-3 font-semibold">
                Create Event
              </p>

            </Link>

          </div>

          <div className="mt-12">

            <div className="flex justify-between items-center mb-8">

              <h2 className="text-3xl font-bold">
                My Events
              </h2>

            </div>

            {events.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">

                <h3 className="text-2xl font-semibold">
                  No Events Yet
                </h3>

                <p className="text-gray-400 mt-3">
                  Click "Create Event" to organize your first event.
                </p>

              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">

                {events.map((event) => (
                  <div
                    key={event._id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500 transition"
                  >

                    <img
                      src={
                        event.banner ||
                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
                      }
                      alt={event.title}
                      className="h-56 w-full object-cover"
                    />

                    <div className="p-6">

                      <span className="bg-blue-500 px-3 py-1 rounded-full text-sm">
                        {event.category}
                      </span>

                      <h3 className="text-2xl font-bold mt-4">
                        {event.title}
                      </h3>

                      <div className="mt-5 space-y-3 text-gray-300">

                        <p className="flex items-center gap-2">
                          <Calendar size={18} />
                          {new Date(event.date).toLocaleDateString()}
                        </p>

                        <p className="flex items-center gap-2">
                          <MapPin size={18} />
                          {event.location}
                        </p>

                        <div className="mt-4">
                          {event.status === "approved" && (
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                              ✓ Approved
                            </span>
                          )}

                          {event.status === "pending" && (
                            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                              ⏳ Pending Approval
                            </span>
                          )}

                          {event.status === "rejected" && (
                            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                              ✕ Rejected
                            </span>
                          )}
                        </div>

                      </div>

                      <div className="flex items-center gap-3 mt-3">

                        {/* View Attendees */}
                        <Link
                          to={`/organizer/events/${event._id}/attendees`}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl flex justify-center items-center gap-2 transition"
                        >
                          <Users size={18} />
                          View Attendees
                        </Link>

                        {/* Edit */}
                        <Link
                          to={`/edit-event/${event._id}`}
                          className="bg-slate-800 hover:bg-slate-700 w-12 h-12 rounded-xl flex justify-center items-center transition"
                        >
                          <Pencil size={18} className="text-green-400" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="bg-slate-800 hover:bg-slate-700 w-12 h-12 rounded-xl flex justify-center items-center transition"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>

                      </div>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>
      </section>
    </>
  );
}

export default OrganizerDashboard;