import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Heart, MapPin, Users, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search") || "";

  const getEvents = async () => {
    try {
      const res = await API.get("/events");
      setEvents(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const keyword = searchQuery || search;

    const matchesSearch =
      event.title.toLowerCase().includes(keyword.toLowerCase()) ||
      event.category.toLowerCase().includes(keyword.toLowerCase()) ||
      event.location.toLowerCase().includes(keyword.toLowerCase());

    const matchesCategory = selectedCategory
      ? event.category === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-950 text-white py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-blue-400 font-medium">Explore Events</p>

            <h1 className="text-5xl font-bold mt-3">
              Find Events That Match Your Passion
            </h1>

            <p className="text-gray-400 mt-4">
              Browse upcoming events, register instantly, and connect with people who share your interests.
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl flex items-center w-full max-w-xl">
              <Search className="text-gray-400 ml-5" size={20} />

              <input
                type="text"
                placeholder="Search by title, category or location..."
                className="flex-1 bg-transparent px-4 py-4 outline-none text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            {filteredEvents.map((event) => (
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

          {filteredEvents.length === 0 && (
            <p className="text-center text-gray-400 mt-12">
              No events found.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Events;