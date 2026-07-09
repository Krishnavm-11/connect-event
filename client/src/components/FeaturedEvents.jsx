import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Heart, MapPin, Users } from "lucide-react";
import API from "../services/api";

function FeaturedEvents() {
  const [events, setEvents] = useState([]);

  const getEvents = async () => {
    try {
      const res = await API.get("/events");
      setEvents(res.data.slice(0, 3));
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  return (
    <section className="bg-slate-950 text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-blue-400 font-medium">Featured Events</p>
            <h2 className="text-4xl font-bold mt-2">
              Events You Shouldn’t Miss
            </h2>
          </div>

          <Link
            to="/events"
            className="hidden md:block border border-slate-700 hover:border-blue-400 px-5 py-2 rounded-full text-gray-300 hover:text-blue-400 transition"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event._id}
              className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:-translate-y-2 hover:border-blue-500/50 transition duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={
                    event.banner ||
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
                  }
                  alt={event.title}
                  className="h-56 w-full object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute top-4 left-4 bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                  {event.category}
                </div>

                <button className="absolute top-4 right-4 bg-white/90 text-slate-900 p-2 rounded-full hover:bg-red-500 hover:text-white transition">
                  <Heart size={18} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-400">
                  Organized by{" "}
                  <span className="text-blue-400">
                    {event.organizer?.name || "Organizer"}
                  </span>
                </p>

                <h3 className="text-2xl font-bold mt-3 group-hover:text-blue-400 transition">
                  {event.title}
                </h3>

                <div className="mt-5 space-y-3 text-gray-300">
                  <p className="flex items-center gap-2">
                    <Calendar size={18} className="text-blue-400" />
                    {new Date(event.date).toLocaleDateString()}
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-400" />
                    {event.location}
                  </p>

                  <p className="flex items-center gap-2">
                    <Users size={18} className="text-blue-400" />
                    {event.availableSeats} seats left
                  </p>
                </div>

                <div className="flex justify-between items-center mt-7">
                  <h4 className="text-3xl font-bold text-white">
                    ₹{event.price}
                  </h4>

                  <Link
                    to={`/events/${event._id}`}
                    className="bg-blue-500 hover:bg-blue-600 px-5 py-3 rounded-xl font-medium transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <p className="text-gray-400 text-center mt-10">
            No featured events available.
          </p>
        )}
      </div>
    </section>
  );
}

export default FeaturedEvents;