
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Clock3,
  Users,
  ImagePlus,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import Navbar from "../components/Navbar";
import API from "../services/api";
import notify from "../utils/toast";

function getMinimumEventDate() {
  const date = new Date();
  date.setDate(date.getDate() + 5);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function CreateEvent() {
  const navigate = useNavigate();
  const minimumDate = useMemo(() => getMinimumEventDate(), []);

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    venue: "",
    location: "",
    date: "",
    time: "",
    price: "0",
    totalSeats: "",
    speakers: [{ name: "", designation: "" }],
  });

  const [banner, setBanner] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSpeakerChange = (index, e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      speakers: previous.speakers.map((speaker, speakerIndex) =>
        speakerIndex === index
          ? { ...speaker, [name]: value }
          : speaker
      ),
    }));
  };

  const addSpeaker = () => {
    setFormData((previous) => ({
      ...previous,
      speakers: [
        ...previous.speakers,
        { name: "", designation: "" },
      ],
    }));
  };

  const removeSpeaker = (index) => {
    setFormData((previous) => ({
      ...previous,
      speakers: previous.speakers.filter(
        (_, speakerIndex) => speakerIndex !== index
      ),
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (formData.date < minimumDate) {
      notify.error("Choose an event date at least 5 days from today.");
      return;
    }

    if (Number(formData.price) < 0) {
      notify.error("Event price cannot be negative.");
      return;
    }

    if (
      !Number.isInteger(Number(formData.totalSeats)) ||
      Number(formData.totalSeats) < 1
    ) {
      notify.error("Enter a valid number of seats.");
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();

      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("category", formData.category.trim());
      data.append("venue", formData.venue.trim());
      data.append("location", formData.location.trim());
      data.append("date", formData.date);
      data.append("time", formData.time);
      data.append("price", formData.price);
      data.append("totalSeats", formData.totalSeats);

      data.append(
        "speakers",
        JSON.stringify(
          formData.speakers.filter(
            (speaker) =>
              speaker.name.trim() || speaker.designation.trim()
          )
        )
      );

      if (banner) {
        data.append("banner", banner);
      }

      await API.post("/events", data);

      notify.success(
        "Event created successfully! Waiting for admin approval."
      );

      navigate("/organizer");
    } catch (error) {
      notify.error(
        error.response?.data?.message || "Event creation failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  const labelClass = "mb-2 block text-sm font-medium text-slate-300";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/organizer")}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </button>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/20">
            <div className="border-b border-slate-800 bg-gradient-to-r from-blue-600/15 to-purple-600/10 px-6 py-8 sm:px-9">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-3 text-blue-300">
                  <CalendarDays size={27} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                    Organizer workspace
                  </p>

                  <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                    Create a new event
                  </h1>

                  <p className="mt-2 text-sm text-slate-400">
                    Add your event details and submit them for approval.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleCreateEvent}
              className="space-y-8 p-6 sm:p-9"
            >
              <section>
                <h2 className="text-lg font-semibold">
                  Event information
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Give attendees the essential details.
                </p>

                <div className="mt-5 space-y-5">
                  <div>
                    <label className={labelClass}>
                      Event title *
                    </label>

                    <input
                      required
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      maxLength={150}
                      placeholder="e.g. Kerala Tech Summit"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Description *
                    </label>

                    <textarea
                      required
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe what attendees can expect..."
                      className={`${inputClass} resize-y`}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Category *
                      </label>

                      <input
                        required
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Technology, music, business..."
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Venue *
                      </label>

                      <input
                        required
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        placeholder="Venue name"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Location *
                      </label>

                      <div className="relative">
                        <MapPin
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                          required
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="City or address"
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Event date *
                      </label>

                      <div className="relative">
                        <CalendarDays
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                          required
                          type="date"
                          name="date"
                          min={minimumDate}
                          value={formData.date}
                          onChange={handleChange}
                          className={`${inputClass} pl-11 [color-scheme:dark]`}
                        />
                      </div>

                      <p className="mt-2 text-xs leading-5 text-blue-300">
                        Schedule your event at least 5 days in advance.
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Start time *
                      </label>

                      <div className="relative">
                        <Clock3
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                          required
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          className={`${inputClass} pl-11 [color-scheme:dark]`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Price (₹) *
                      </label>

                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Total seats *
                      </label>

                      <div className="relative">
                        <Users
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                          required
                          type="number"
                          min="1"
                          step="1"
                          name="totalSeats"
                          value={formData.totalSeats}
                          onChange={handleChange}
                          placeholder="e.g. 100"
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="border-t border-slate-800 pt-7">
                <h2 className="text-lg font-semibold">
                  Event banner
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Choose an image to represent your event.
                </p>

                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-5 py-8 text-center transition hover:border-blue-500/60">
                  <ImagePlus size={30} className="text-blue-400" />

                  <span className="mt-3 text-sm font-medium">
                    {banner ? banner.name : "Choose a banner image"}
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    Select an image from your device
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) =>
                      setBanner(e.target.files?.[0] || null)
                    }
                  />
                </label>

                {banner && (
                  <button
                    type="button"
                    onClick={() => setBanner(null)}
                    className="mt-3 text-sm text-rose-400 hover:text-rose-300"
                  >
                    Remove selected image
                  </button>
                )}
              </section>

              <section className="border-t border-slate-800 pt-7">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Speakers
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Add speakers participating in your event.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addSpeaker}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-800"
                  >
                    <Plus size={16} />
                    Add speaker
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {formData.speakers.map((speaker, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-300">
                          Speaker {index + 1}
                        </p>

                        {formData.speakers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpeaker(index)}
                            className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>
                            Speaker name
                          </label>

                          <input
                            name="name"
                            value={speaker.name}
                            onChange={(e) =>
                              handleSpeakerChange(index, e)
                            }
                            placeholder="Full name"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Designation
                          </label>

                          <input
                            name="designation"
                            value={speaker.designation}
                            onChange={(e) =>
                              handleSpeakerChange(index, e)
                            }
                            placeholder="Job title or role"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm leading-6 text-slate-300">
                <p className="font-semibold text-blue-300">
                  What happens next?
                </p>

                Your event will be submitted for admin approval. It will
                become available to attendees once approved and open for
                registration.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={19} />
                {submitting
                  ? "Submitting event..."
                  : "Submit event for approval"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default CreateEvent;
