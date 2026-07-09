import { useEffect, useState } from "react";
import { Search, UserCircle, Mail, Briefcase } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

function AdminOrganizers() {
  const [organizers, setOrganizers] = useState([]);
  const [search, setSearch] = useState("");

  const getOrganizers = async () => {
    try {
      const res = await API.get("/admin/organizers");
      setOrganizers(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await API.put(`/admin/organizers/${id}`);
      alert(res.data.message);
      getOrganizers();
    } catch (error) {
      alert(error.response?.data?.message || "Action failed");
    }
  };

  useEffect(() => {
    getOrganizers();
  }, []);

  const filteredOrganizers = organizers.filter((organizer) =>
    organizer.name.toLowerCase().includes(search.toLowerCase()) ||
    organizer.email.toLowerCase().includes(search.toLowerCase()) ||
    organizer.profession?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-white">
          Organizer Management
        </h1>

        <p className="text-gray-400 mt-2">
          View, monitor and control event organizers.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex items-center max-w-md mt-8">
          <Search className="text-gray-400 ml-4" size={20} />

          <input
            type="text"
            placeholder="Search organizers..."
            className="bg-transparent outline-none text-white px-4 py-3 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
          {filteredOrganizers.map((organizer) => (
            <div
              key={organizer._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-blue-500 transition"
            >
              <div className="flex justify-between items-start">
                <UserCircle className="text-blue-400" size={48} />

                {organizer.isBlocked ? (
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                    Blocked
                  </span>
                ) : (
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                    Active
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-white mt-4">
                {organizer.name}
              </h2>

              <p className="text-gray-400 flex items-center gap-2 mt-3">
                <Mail size={17} />
                {organizer.email}
              </p>

              <p className="text-gray-400 flex items-center gap-2 mt-2">
                <Briefcase size={17} />
                {organizer.profession || "Event Organizer"}
              </p>

              <button
                onClick={() => toggleStatus(organizer._id)}
                className={`w-full mt-6 py-3 rounded-xl font-medium transition ${organizer.isBlocked
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {organizer.isBlocked ? "Unblock Organizer" : "Block Organizer"}
              </button>
            </div>
          ))}
        </div>

        {filteredOrganizers.length === 0 && (
          <p className="text-gray-400 mt-10">
            No organizers found.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminOrganizers;