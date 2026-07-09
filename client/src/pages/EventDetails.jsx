import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, Heart, Share2, UserCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const getEventDetails = async () => {
    try {
      const res = await API.get(`/events/${id}`);
      setEvent(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setIsRegistering(true);

      const res = await API.post(`/registrations/${id}`);

      alert(res.data.message);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    getEventDetails();
  }, [id]);

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading event...
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-950 text-white pb-20">
        <div className="relative h-96">
          <img
            src={
              event.banner ||
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

          <div className="absolute bottom-10 left-0 right-0">
            <div className="max-w-7xl mx-auto px-6">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                {event.category}
              </span>

              <h1 className="text-4xl md:text-6xl font-bold mt-5 max-w-4xl">
                {event.title}
              </h1>

              <p className="text-gray-300 mt-4 max-w-2xl">
                Organized by{" "}
                <span className="text-blue-400">
                  {event.organizer?.name || "Organizer"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7">
              <h2 className="text-3xl font-bold">About This Event</h2>

              <p className="text-gray-300 leading-8 mt-5">
                {event.description}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7">
              <h2 className="text-3xl font-bold">Speakers</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                {event.speakers?.length > 0 ? (
                  event.speakers.map((speaker, index) => (
                    <div
                      key={index}
                      className="bg-slate-800 border border-slate-700 p-5 rounded-2xl flex items-center gap-4"
                    >
                      <UserCircle className="text-blue-400" size={42} />

                      <div>
                        <h3 className="text-xl font-semibold">
                          {speaker.name}
                        </h3>
                        <p className="text-gray-400">
                          {speaker.designation}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No speakers added.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 sticky top-24">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-bold text-blue-400">
                  ₹{event.price}
                </h2>

                <div className="flex gap-3">
                  <button className="bg-slate-800 hover:bg-slate-700 p-3 rounded-full">
                    <Heart size={20} />
                  </button>

                  <button className="bg-slate-800 hover:bg-slate-700 p-3 rounded-full">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-7 space-y-4 text-gray-300">
                <p className="flex items-center gap-3">
                  <Calendar className="text-blue-400" size={20} />
                  {new Date(event.date).toLocaleDateString()}
                </p>

                <p className="flex items-center gap-3">
                  <Clock className="text-blue-400" size={20} />
                  {event.time}
                </p>

                <p className="flex items-center gap-3">
                  <MapPin className="text-blue-400" size={20} />
                  {event.venue}, {event.location}
                </p>

                <p className="flex items-center gap-3">
                  <Users className="text-blue-400" size={20} />
                  {event.availableSeats} seats left
                </p>
              </div>

              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 py-4 rounded-2xl mt-8 font-semibold transition"
              >
                {isRegistering ? "Registering..." : "Register Now"}
              </button>

              <button
                onClick={() => navigate(`/events/${id}/chat`)}
                className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl mt-4 font-semibold transition"
              >
                Open Event Chat
              </button>

              <button
                onClick={() => navigate(`/events/${id}/networking`)}
                className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl mt-4 font-semibold transition"
              >
                View Networking Suggestions
              </button>

              <p className="text-gray-500 text-sm text-center mt-4">
                Secure your seat and start networking with attendees.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default EventDetails;