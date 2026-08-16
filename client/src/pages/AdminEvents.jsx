import { useEffect, useState } from "react";
import { Calendar, MapPin, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

function AdminEvents() {
  const [events, setEvents] = useState([]);

  const getEvents = async () => {
  try {
    const res = await API.get("/admin/events");

    console.log("Admin Events:", res.data);

    setEvents(res.data);
  } catch (error) {
    console.log(error.response?.data?.message || error.message);
  }
};

  useEffect(() => {
    getEvents();
  }, []);

  const approveEvent = async (id) => {
    try {
      await API.put(`/admin/events/${id}/approve`);
      alert("Event approved");
      getEvents();
    } catch (error) {
      alert(error.response?.data?.message || "Approve failed");
    }
  };

  const rejectEvent = async (id) => {
    try {
      await API.put(`/admin/events/${id}/reject`);
      alert("Event rejected");
      getEvents();
    } catch (error) {
      alert(error.response?.data?.message || "Reject failed");
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-white">
          Event Management
        </h1>

        <p className="text-gray-400 mt-2">
          Review, approve and reject organizer events.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden"
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
                <div className="flex justify-between gap-4">
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    {event.category}
                  </span>

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

                <h2 className="text-2xl font-bold text-white mt-4">
                  {event.title}
                </h2>

                <p className="text-gray-400 mt-2">
                  Organizer: {event.organizer?.name || "Organizer"}
                </p>

                <div className="mt-5 space-y-3 text-gray-300">
                  <p className="flex items-center gap-2">
                    <Calendar size={18} className="text-blue-400" />
                    {new Date(event.date).toLocaleDateString()}
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-400" />
                    {event.location}
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  {event.status !== "approved" && (
                    <button
                      onClick={() => approveEvent(event._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl flex justify-center items-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                  )}

                  {event.status !== "rejected" && (
                    <button
                      onClick={() => rejectEvent(event._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl flex justify-center items-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <p className="text-gray-400 mt-10">
            No events found.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminEvents;