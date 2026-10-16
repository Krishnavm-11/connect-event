import { useEffect, useState } from "react";
import { Calendar, MapPin, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const getEvents = async () => {
    try {
      const res = await API.get("/admin/events");
      setEvents(res.data);
    } catch (error) {
      console.error(
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  const approveEvent = async (id) => {
    try {
      setProcessingId(id);

      const res = await API.put(`/admin/events/${id}/approve`);

      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          event._id === id
            ? { ...event, ...res.data.event, status: "approved" }
            : event
        )
      );
    } catch (error) {
      window.alert(
        error.response?.data?.message || "Approve failed"
      );
      await getEvents();
    } finally {
      setProcessingId(null);
    }
  };

  const rejectEvent = async (id) => {
    try {
      setProcessingId(id);

      const res = await API.put(`/admin/events/${id}/reject`);

      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          event._id === id
            ? { ...event, ...res.data.event, status: "rejected" }
            : event
        )
      );
    } catch (error) {
      window.alert(
        error.response?.data?.message || "Reject failed"
      );
      await getEvents();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-white">
          Event Management
        </h1>

        <p className="text-gray-400 mt-2">
          Review and manage organizer events.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          {loading ? (
            <p className="text-gray-400">Loading events...</p>
          ) : (
            events.map((event) => (
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
                  <div className="flex justify-between items-center gap-4 flex-wrap">
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

                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "Date not available"}
                    </p>

                    <p className="flex items-center gap-2">
                      <MapPin size={18} className="text-blue-400" />
                      {event.location || "Location not available"}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    {event.status === "pending" && (
                      <>
                        <button
                          onClick={() => approveEvent(event._id)}
                          disabled={processingId === event._id}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl flex justify-center items-center gap-2"
                        >
                          <CheckCircle size={18} />
                          {processingId === event._id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          onClick={() => rejectEvent(event._id)}
                          disabled={processingId === event._id}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl flex justify-center items-center gap-2"
                        >
                          <XCircle size={18} />
                          {processingId === event._id
                            ? "Processing..."
                            : "Reject"}
                        </button>
                      </>
                    )}

                    {event.status === "approved" && (
                      <div className="w-full bg-green-500/10 border border-green-500/20 text-green-400 py-3 rounded-xl flex justify-center items-center gap-2">
                        <CheckCircle size={18} />
                        Event Approved
                      </div>
                    )}

                    {event.status === "rejected" && (
                      <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 py-3 rounded-xl flex justify-center items-center gap-2">
                        <XCircle size={18} />
                        Event Rejected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && events.length === 0 && (
          <p className="text-gray-400 mt-10">
            No events found.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminEvents;