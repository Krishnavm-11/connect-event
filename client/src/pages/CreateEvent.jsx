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
  speakers: [
    {
      name: "",
      designation: "",
    },
  ],
});

  const [banner, setBanner] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSpeakerChange = (index, e) => {
  const updatedSpeakers = [...formData.speakers];

  updatedSpeakers[index][e.target.name] = e.target.value;

  setFormData({
    ...formData,
    speakers: updatedSpeakers,
  });
};

const addSpeaker = () => {
  setFormData({
    ...formData,
    speakers: [
      ...formData.speakers,
      {
        name: "",
        designation: "",
      },
    ],
  });
};

const removeSpeaker = (index) => {
  const updatedSpeakers = formData.speakers.filter(
    (_, speakerIndex) => speakerIndex !== index
  );

  setFormData({
    ...formData,
    speakers: updatedSpeakers,
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
data.append("speakers", JSON.stringify(formData.speakers));

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
              <div className="border-t border-slate-700 pt-7">
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-2xl font-bold">
        Speakers
      </h2>

      <p className="text-gray-400 text-sm mt-1">
        Add the speakers attending this event.
      </p>
    </div>

    <button
      type="button"
      onClick={addSpeaker}
      className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl"
    >
      + Add Speaker
    </button>
  </div>

  <div className="space-y-4">
    {formData.speakers.map((speaker, index) => (
      <div
        key={index}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Speaker Name"
            value={speaker.name}
            onChange={(e) => handleSpeakerChange(index, e)}
            className="p-4 rounded-xl bg-slate-900 outline-none"
          />

          <input
            type="text"
            name="designation"
            placeholder="Designation"
            value={speaker.designation}
            onChange={(e) => handleSpeakerChange(index, e)}
            className="p-4 rounded-xl bg-slate-900 outline-none"
          />
        </div>

        {formData.speakers.length > 1 && (
          <button
            type="button"
            onClick={() => removeSpeaker(index)}
            className="mt-4 text-red-400 hover:text-red-300"
          >
            Remove Speaker
          </button>
        )}
      </div>
    ))}
  </div>
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