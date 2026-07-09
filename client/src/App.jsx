import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Events from "./pages/Events";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import EventAttendees from "./pages/EventAttendees";
import EventChat from "./pages/EventChat";
import NetworkingSuggestions from "./pages/NetworkingSuggestions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminUsers from "./pages/AdminUsers";
import AdminOrganizers from "./pages/AdminOrganizers";
import AdminRegistrations from "./pages/AdminRegistrations";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminContacts from "./pages/AdminContacts";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<Events />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/edit-event/:id" element={<EditEvent />} />
      <Route path="/organizer/events/:id/attendees" element={<EventAttendees />} />
      <Route path="/events/:id/chat" element={<EventChat />} />
      <Route path="/events/:id/networking" element={<NetworkingSuggestions />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/organizer" element={<OrganizerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/events" element={<AdminEvents />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/organizers" element={<AdminOrganizers />} />
      <Route path="/admin/registrations" element={<AdminRegistrations />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/contacts" element={<AdminContacts />} />

    </Routes>
  );
}

export default App;