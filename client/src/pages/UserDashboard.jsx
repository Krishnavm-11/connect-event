import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, Bell, MessageCircle, Ticket, UserCheck, UserX } from "lucide-react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function UserDashboard() {
  const { user } = useAuth();

  const [myEvents, setMyEvents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);

  const getMyEvents = async () => {
    try {
      const res = await API.get("/registrations/my-events");
      setMyEvents(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const getConnections = async () => {
    try {
      const res = await API.get("/connections/my-connections");
      setConnections(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const getRequests = async () => {
    try {
      const res = await API.get("/connections/requests");
      setRequests(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const acceptRequest = async (id) => {
    try {
      await API.put(`/connections/accept/${id}`);
      alert("Connection accepted");
      getRequests();
      getConnections();
    } catch (error) {
      alert(error.response?.data?.message || "Accept failed");
    }
  };

  const rejectRequest = async (id) => {
    try {
      await API.put(`/connections/reject/${id}`);
      alert("Connection rejected");
      getRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Reject failed");
    }
  };

  useEffect(() => {
    getMyEvents();
    getConnections();
    getRequests();
  }, []);

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-slate-800 rounded-3xl p-8">
            <h1 className="text-4xl font-bold">
              Welcome back,{" "}
              <span className="text-blue-400">{user?.name}</span> 👋
            </h1>

            <p className="text-gray-300 mt-3">
              Manage your events, tickets, connections and conversations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <Ticket className="text-blue-400" size={32} />
              <h3 className="text-4xl font-bold mt-4">{myEvents.length}</h3>
              <p className="text-gray-400">Registered Events</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <Users className="text-blue-400" size={32} />
              <h3 className="text-4xl font-bold mt-4">
                {connections.length}
              </h3>
              <p className="text-gray-400">Connections</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <Bell className="text-blue-400" size={32} />
              <h3 className="text-4xl font-bold mt-4">0</h3>
              <p className="text-gray-400">Notifications</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <MessageCircle className="text-blue-400" size={32} />
              <h3 className="text-4xl font-bold mt-4">0</h3>
              <p className="text-gray-400">Chats</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            <div className="bg-slate-900 border border-slate-800 p-7 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-blue-400" />
                <h2 className="text-2xl font-bold">My Events</h2>
              </div>

              {myEvents.length === 0 ? (
                <p className="text-gray-400">No registered events yet.</p>
              ) : (
                <div className="space-y-4">
                  {myEvents.map((item) => (
                    <div
                      key={item._id}
                      className="bg-slate-800 border border-slate-700 p-5 rounded-2xl"
                    >
                      <h3 className="text-xl font-semibold">
                        {item.event?.title}
                      </h3>

                      <p className="text-gray-400 text-sm mt-2">
                        Ticket: {item.ticketNumber}
                      </p>

                      <p className="text-gray-400 text-sm mt-1">
                        Date:{" "}
                        {item.event?.date
                          ? new Date(item.event.date).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <Link
                        to={`/events/${item.event?._id}/chat`}
                        className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl text-sm font-medium"
                      >
                        Open Chat
                      </Link>

                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-7 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-blue-400" />
                <h2 className="text-2xl font-bold">My Connections</h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-7 rounded-3xl mt-8">
                <h2 className="text-2xl font-bold mb-5">Connection Requests</h2>

                {requests.length === 0 ? (
                  <p className="text-gray-400">No pending requests.</p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((item) => (
                      <div
                        key={item._id}
                        className="bg-slate-800 border border-slate-700 p-5 rounded-2xl"
                      >
                        <h3 className="text-xl font-semibold">
                          {item.sender?.name}
                        </h3>

                        <p className="text-gray-400 text-sm mt-1">
                          {item.sender?.profession}
                        </p>

                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => acceptRequest(item._id)}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl flex items-center gap-2"
                          >
                            <UserCheck size={18} />
                            Accept
                          </button>

                          <button
                            onClick={() => rejectRequest(item._id)}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl flex items-center gap-2"
                          >
                            <UserX size={18} />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {connections.length === 0 ? (
                <p className="text-gray-400">No connections yet.</p>
              ) : (
                <div className="space-y-4">
                  {connections.map((item) => {
                    const otherUser =
                      item.sender._id === user._id
                        ? item.receiver
                        : item.sender;

                    return (
                      <div
                        key={item._id}
                        className="bg-slate-800 border border-slate-700 p-5 rounded-2xl"
                      >
                        <h3 className="text-xl font-semibold">
                          {otherUser.name}
                        </h3>

                        <p className="text-gray-400 text-sm mt-1">
                          {otherUser.profession}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default UserDashboard;