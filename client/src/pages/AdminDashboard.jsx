import { useEffect, useState } from "react";
import { Calendar, Users, UserCheck, Clock } from "lucide-react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);

  const getStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const getEvents = async () => {
    try {
      const res = await API.get("/admin/events");
      setEvents(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const approveEvent = async (id) => {
    try {
      await API.put(`/admin/events/${id}/approve`);
      alert("Event approved");
      getStats();
      getEvents();
    } catch (error) {
      alert(error.response?.data?.message || "Approve failed");
    }
  };

  const rejectEvent = async (id) => {
    try {
      await API.put(`/admin/events/${id}/reject`);
      alert("Event rejected");
      getStats();
      getEvents();
    } catch (error) {
      alert(error.response?.data?.message || "Reject failed");
    }
  };

  useEffect(() => {
    getStats();
    getEvents();
  }, []);

  return (
    <AdminLayout>

      <section className="min-h-screen bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-slate-800 rounded-3xl p-8">
            <h1 className="text-4xl font-bold">Admin Dashboard 🛡️</h1>
            <p className="text-gray-300 mt-3">
              Manage users, organizers, events and approvals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500 transition">
              <div className="flex justify-between items-center">
                <Users className="text-blue-400" size={34} />
                <span className="text-green-400 text-sm bg-green-500/10 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>

              <h2 className="text-5xl font-bold mt-6">
                {stats?.totalUsers || 0}
              </h2>

              <p className="text-gray-400 mt-2">Total Users</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500 transition">
              <div className="flex justify-between items-center">
                <UserCheck className="text-blue-400" size={34} />
                <span className="text-blue-400 text-sm bg-blue-500/10 px-3 py-1 rounded-full">
                  Verified
                </span>
              </div>

              <h2 className="text-5xl font-bold mt-6">
                {stats?.totalOrganizers || 0}
              </h2>

              <p className="text-gray-400 mt-2">Organizers</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-blue-500 transition">
              <div className="flex justify-between items-center">
                <Calendar className="text-blue-400" size={34} />
                <span className="text-purple-400 text-sm bg-purple-500/10 px-3 py-1 rounded-full">
                  Listed
                </span>
              </div>

              <h2 className="text-5xl font-bold mt-6">
                {stats?.totalEvents || 0}
              </h2>

              <p className="text-gray-400 mt-2">Total Events</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-yellow-500 transition">
              <div className="flex justify-between items-center">
                <Clock className="text-yellow-400" size={34} />
                <span className="text-yellow-400 text-sm bg-yellow-500/10 px-3 py-1 rounded-full">
                  Review
                </span>
              </div>

              <h2 className="text-5xl font-bold mt-6">
                {stats?.pendingEvents || 0}
              </h2>

              <p className="text-gray-400 mt-2">Pending Events</p>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Event Approval Queue
                </h2>

                <p className="text-gray-400 mt-2">
                  Review organizer events before publishing.
                </p>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
                <h3 className="text-2xl font-semibold">
                  No Events Found
                </h3>

                <p className="text-gray-400 mt-3">
                  All events have been reviewed.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-8">
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
                      className="w-full h-52 object-cover"
                    />

                    <div className="p-6">

                      <div className="flex justify-between items-start">

                        <div>
                          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                            {event.category}
                          </span>

                          <h3 className="text-2xl font-bold mt-4">
                            {event.title}
                          </h3>
                        </div>

                        {event.status === "approved" && (
                          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                            Approved
                          </span>
                        )}

                        {event.status === "pending" && (
                          <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                            Pending
                          </span>
                        )}

                        {event.status === "rejected" && (
                          <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                            Rejected
                          </span>
                        )}
                      </div>

                      <div className="mt-6 space-y-2 text-gray-400">

                        <p>
                          👤 <span className="text-white">
                            {event.organizer?.name}
                          </span>
                        </p>

                        <p>
                          📍 {event.location}
                        </p>

                        <p>
                          📅 {new Date(event.date).toLocaleDateString()}
                        </p>

                        <p>
                          💰 ₹{event.price}
                        </p>

                      </div>

                      <div className="flex gap-3 mt-7">

                        {event.status !== "approved" && (
                          <button
                            onClick={() => approveEvent(event._id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl transition"
                          >
                            Approve
                          </button>
                        )}

                        {event.status !== "rejected" && (
                          <button
                            onClick={() => rejectEvent(event._id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl transition"
                          >
                            Reject
                          </button>
                        )}

                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;