import { useEffect, useState } from "react";
import { Search, UserCircle, Mail, Briefcase } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const getUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.profession?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-white">User Management</h1>

        <p className="text-gray-400 mt-2">
          View and manage all registered users.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex items-center max-w-md mt-8">
          <Search className="text-gray-400 ml-4" size={20} />

          <input
            type="text"
            placeholder="Search users..."
            className="bg-transparent outline-none text-white px-4 py-3 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-blue-500 transition"
            >
              <UserCircle className="text-blue-400" size={48} />

              <h2 className="text-2xl font-bold text-white mt-4">
                {user.name}
              </h2>

              <p className="text-gray-400 flex items-center gap-2 mt-3">
                <Mail size={17} />
                {user.email}
              </p>

              <p className="text-gray-400 flex items-center gap-2 mt-2">
                <Briefcase size={17} />
                {user.profession || "No profession added"}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {user.interests?.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <p className="text-gray-400 mt-10">No users found.</p>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;