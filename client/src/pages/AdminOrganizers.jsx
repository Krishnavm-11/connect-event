import { useEffect, useState } from "react";
import { Search, Trash2, RefreshCw, Users } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

function AdminOrganizers() {
  const [organizers, setOrganizers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  const getOrganizers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/admin/organizers");
      setOrganizers(res.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load organizers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrganizers();
  }, []);

  const toggleStatus = async (id) => {
    try {
      setProcessingId(id);
      setError("");

      const res = await API.put(`/admin/organizers/${id}`);

      setOrganizers((previous) =>
        previous.map((organizer) =>
          organizer._id === id
            ? {
                ...organizer,
                isBlocked: res.data.isBlocked,
              }
            : organizer
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to update organizer."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const deleteOrganizer = async (organizer) => {
    const confirmed = window.confirm(
      `Delete organizer "${organizer.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(organizer._id);
      setError("");

      await API.delete(`/admin/organizers/${organizer._id}`);

      setOrganizers((previous) =>
        previous.filter((item) => item._id !== organizer._id)
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete organizer."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrganizers = organizers.filter((organizer) => {
    const name = organizer.name || "";
    const email = organizer.email || "";

    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Organizer Management
            </h1>

            <p className="text-gray-400 mt-2">
              View, monitor and manage event organizers.
            </p>
          </div>

          <button
            onClick={getOrganizers}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-gray-200 hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-3 max-w-md bg-slate-900 border border-slate-800 rounded-xl px-4">
          <Search size={19} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-white py-3 w-full"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-slate-800">
            <Users size={22} className="text-blue-400" />

            <div>
              <h2 className="text-white font-semibold">
                Registered Organizers
              </h2>
              <p className="text-sm text-gray-400">
                {filteredOrganizers.length} organizers
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-12">
              Loading organizers...
            </p>
          ) : filteredOrganizers.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No organizers found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-950/60">
                  <tr className="text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrganizers.map((organizer, index) => (
                    <tr
                      key={organizer._id}
                      className="border-t border-slate-800 hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-5 text-sm text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-5 font-medium text-white">
                        {organizer.name || "Unnamed Organizer"}
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-300">
                        {organizer.email}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs ${
                            organizer.isBlocked
                              ? "bg-red-500/10 text-red-400"
                              : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {organizer.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleStatus(organizer._id)}
                            disabled={processingId === organizer._id}
                            className={`px-3 py-2 rounded-lg text-sm disabled:opacity-50 ${
                              organizer.isBlocked
                                ? "bg-green-600/10 text-green-400 hover:bg-green-600/20"
                                : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                            }`}
                          >
                            {processingId === organizer._id
                              ? "Please wait..."
                              : organizer.isBlocked
                                ? "Unblock"
                                : "Block"}
                          </button>

                          <button
                            onClick={() => deleteOrganizer(organizer)}
                            disabled={processingId === organizer._id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminOrganizers;