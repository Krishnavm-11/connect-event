import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";

function EventAttendees() {
  const { id } = useParams();
  const [attendees, setAttendees] = useState([]);

  const getAttendees = async () => {
    try {
      const res = await API.get(`/registrations/event/${id}/attendees`);
      setAttendees(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getAttendees();
  }, [id]);

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-950 text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8">Event Attendees</h1>

          {attendees.length === 0 ? (
            <p className="text-gray-400">No attendees registered yet.</p>
          ) : (
            <div className="space-y-4">
              {attendees.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-900 border border-slate-800 p-5 rounded-2xl"
                >
                  <h3 className="text-xl font-semibold">
                    {item.user?.name}
                  </h3>

                  <p className="text-gray-400">
                    {item.user?.profession}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default EventAttendees;