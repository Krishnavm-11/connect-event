import {
  Search,
  ArrowRight,
  Users,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    navigate(`/events?search=${encodeURIComponent(search)}`);
  };

  return (
    <section className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-24">

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto">

          <p className="inline-block bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 sm:px-5 py-2 rounded-full text-sm mb-6">
            Discover • Connect • Grow
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
            Discover Amazing
            <span className="block text-blue-400">
              Events Near You
            </span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg md:text-xl mt-6 max-w-2xl mx-auto">
            Where great events bring great people together.
          </p>

          {/* Search */}
          <div className="mt-10 flex justify-center">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl flex items-center w-full max-w-xl shadow-xl overflow-hidden">

              <Search
                size={20}
                className="text-gray-400 ml-4 sm:ml-5 flex-shrink-0"
              />

              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="flex-1 min-w-0 bg-transparent px-3 sm:px-4 py-4 outline-none text-white placeholder-gray-500"
              />

              <button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 transition-colors
                px-3 sm:px-5 py-3 mr-1.5 sm:mr-2
                rounded-xl flex items-center justify-center gap-1.5 sm:gap-2
                text-sm sm:text-base font-medium shrink-0"
              >
                <span>Search</span>
                <ArrowRight size={16} />
              </button>

            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-20">

          {/* Card 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <CalendarDays className="text-blue-400" size={32} />

            <h3 className="text-2xl font-bold mt-4">
              Discover Events
            </h3>

            <p className="text-gray-400 mt-2">
              Find tech, business, music, sports and startup events near you.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <Users className="text-blue-400" size={32} />

            <h3 className="text-2xl font-bold mt-4">
              Build Network
            </h3>

            <p className="text-gray-400 mt-2">
              Connect with attendees who share your interests and profession.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <MessageCircle className="text-blue-400" size={32} />

            <h3 className="text-2xl font-bold mt-4">
              Real-Time Chat
            </h3>

            <p className="text-gray-400 mt-2">
              Join event chats and continue conversations after the event.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;