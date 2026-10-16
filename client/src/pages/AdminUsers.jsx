
import { useEffect, useState } from "react";
import { Trash2, Users, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const getUsers = async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const deleteUser = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await API.delete(`/admin/users/${id}`);

      setUsers((previousUsers) =>
        previousUsers.filter((user) => user._id !== id)
      );

      toast.success("User deleted successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              User Management
            </h1>

            <p className="text-gray-400 mt-2">
              View and manage registered users.
            </p>
          </div>

          <button
            onClick={getUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-gray-200 hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                <Users size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Registered Users
                </h2>
                <p className="text-sm text-gray-400">
                  {users.length} {users.length === 1 ? "user" : "users"}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-gray-400">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Users size={32} className="mx-auto text-gray-600" />

              <p className="mt-3 font-medium text-white">
                No users found
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Registered users will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      #
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Name
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Email
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user._id}
                      className="border-b border-slate-800/70 last:border-b-0 hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-medium text-white">
                          {user.name || "Unnamed User"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-300">
                        {user.email || "No email"}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() =>
                            deleteUser(
                              user._id,
                              user.name || "this user"
                            )
                          }
                          disabled={deletingId === user._id}
                          title="Delete user"
                          aria-label={`Delete ${user.name || "user"}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          {deletingId === user._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
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

export default AdminUsers;
