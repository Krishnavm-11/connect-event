import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

function CreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    venue: "",
    location: "",
    date: "",
    time: "",
    price: "",
    totalSeats: "",
  });

  const [banner, setBanner] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("venue", formData.venue);
      data.append("location", formData.location);
      data.append("date", formData.date);
      data.append("time", formData.time);
      data.append("price", formData.price);
      data.append("totalSeats", formData.totalSeats);

      if (banner) {
        data.append("banner", banner);
      }

      await API.post("/events", data);

      alert("Event created successfully. Waiting for admin approval.");
      navigate("/organizer");
    } catch (error) {
      alert(error.response?.data?.message || "Event creation failed");
    }
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-950 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h1 className="text-4xl font-bold mb-8">Create New Event</h1>

            <form onSubmit={handleCreateEvent} className="space-y-5">
              <input
                name="title"
                placeholder="Event Title"
                className="w-full p-4 rounded-xl bg-slate-800 outline-none"
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Event Description"
                rows="4"
                className="w-full p-4 rounded-xl bg-slate-800 outline-none"
                onChange={handleChange}
              />

              <div className="grid md:grid-cols-2 gap-5">
                <input
                  name="category"
                  placeholder="Category"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                  onChange={handleChange}
                />

                <input
                  name="venue"
                  placeholder="Venue"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                  onChange={handleChange}
                />

                <input
                  name="location"
                  placeholder="Location"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                  onChange={handleChange}
                />

                <input
                  type="date"
                  name="date"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                  onChange={handleChange}
                />

                <input
                  type="time"
                  name="time"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                  onChange={handleChange}
                />

                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                  onChange={handleChange}
                />

                <input
                  type="number"
                  name="totalSeats"
                  placeholder="Total Seats"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                  onChange={handleChange}
                />

                <input
                  type="file"
                  accept="image/*"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                  onChange={(e) => setBanner(e.target.files[0])}
                />
              </div>

              <button className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-xl font-semibold">
                Create Event
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default CreateEvent;