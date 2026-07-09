import { useEffect, useState } from "react";
import { Search, User, Calendar } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");

  const getRegistrations = async () => {
    try {
      const res = await API.get("/admin/registrations");
      setRegistrations(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getRegistrations();
  }, []);

  const filtered = registrations.filter((item) =>
    item.user?.name.toLowerCase().includes(search.toLowerCase()) ||
    item.event?.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <h1 className="text-4xl font-bold text-white">
        Registration Management
      </h1>

      <p className="text-gray-400 mt-2">
        View all event registrations.
      </p>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex items-center max-w-md mt-8">
        <Search className="ml-4 text-gray-400" size={18} />

        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none px-4 py-3 text-white w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-10 space-y-5">
        {filtered.map((item) => (
          <div
            key={item._id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center"
          >
            <div>
              <h3 className="text-white text-xl font-semibold flex items-center gap-2">
                <User size={18} />
                {item.user?.name}
              </h3>

              <p className="text-gray-400 mt-2">
                {item.user?.email}
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold">
                {item.event?.title}
              </h3>

              <p className="text-gray-400 flex items-center gap-2 mt-2">
                <Calendar size={16} />
                {item.event?.date
                  ? new Date(item.event.date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-gray-400">
            No registrations found.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminRegistrations;