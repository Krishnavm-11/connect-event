import { useEffect, useState } from "react";
import { BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,Tooltip,ResponsiveContainer } from "recharts";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

function AdminAnalytics() {
  const [stats, setStats] = useState(null);

  const getStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  const barData = [
    {
      name: "Users",
      value: stats?.totalUsers || 0,
    },
    {
      name: "Organizers",
      value: stats?.totalOrganizers || 0,
    },
    {
      name: "Events",
      value: stats?.totalEvents || 0,
    },
    {
      name: "Pending",
      value: stats?.pendingEvents || 0,
    },
  ];

  const pieData = [
    {
      name: "Approved",
      value: stats?.approvedEvents || 0,
    },
    {
      name: "Pending",
      value: stats?.pendingEvents || 0,
    },
  ];

  return (
    <AdminLayout>
      <h1 className="text-4xl font-bold text-white">
        Analytics
      </h1>

      <p className="text-gray-400 mt-2">
        Visual overview of platform performance.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Platform Overview
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Event Status
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#eab308" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAnalytics;