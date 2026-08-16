import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Users, UserCheck, ClipboardList, BarChart3, Mail } from "lucide-react";

function AdminSidebar() {
  const location = useLocation();

  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      name: "Events",
      icon: CalendarDays,
      path: "/admin/events",
    },
    {
      name: "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      name: "Organizers",
      icon: UserCheck,
      path: "/admin/organizers",
    },
    {
      name: "Registrations",
      icon: ClipboardList,
      path: "/admin/registrations",
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
    },
    {
      name: "Contact Messages",
      icon: Mail,
      path: "/admin/contacts",
    },
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-white mb-10">
        Connect<span className="text-blue-400">Event</span>
      </h1>

      <nav className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${location.pathname === item.path
                  ? "bg-blue-500 text-white"
                  : "text-gray-300 hover:bg-slate-800"
                }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default AdminSidebar;