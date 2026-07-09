import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

function EditEvent() {
  const { id } = useParams();
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
    availableSeats: "",
  });

  const getEvent = async () => {
    try {
      const res = await API.get(`/events/${id}`);

      setFormData({
        title: res.data.title || "",
        description: res.data.description || "",
        category: res.data.category || "",
        venue: res.data.venue || "",
        location: res.data.location || "",
        date: res.data.date
          ? res.data.date.split("T")[0]
          : "",
        time: res.data.time || "",
        price: res.data.price || "",
        availableSeats: res.data.availableSeats || "",
      });
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getEvent();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/events/${id}`, formData);

      alert("Event Updated Successfully");

      navigate("/organizer");
    } catch (error) {
      alert(error.response?.data?.message || "Update Failed");
    }
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-950 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

            <h1 className="text-4xl font-bold mb-8">
              Edit Event
            </h1>

            <form
              onSubmit={handleUpdate}
              className="space-y-5"
            >
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full p-4 rounded-xl bg-slate-800 outline-none"
              />

              <textarea
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full p-4 rounded-xl bg-slate-800 outline-none"
              />

              <div className="grid md:grid-cols-2 gap-5">

                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Category"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                />

                <input
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="Venue"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                />

                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                />

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                />

                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                />

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Price"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                />

                <input
                  type="number"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  placeholder="Seats"
                  className="p-4 rounded-xl bg-slate-800 outline-none"
                />

              </div>

              <button className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-xl font-semibold">
                Update Event
              </button>

            </form>

          </div>
        </div>
      </section>
    </>
  );
}

export default EditEvent;