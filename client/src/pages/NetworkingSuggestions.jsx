import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { UserPlus, Briefcase } from "lucide-react";

function NetworkingSuggestions() {
  const { id } = useParams();

  const [suggestions, setSuggestions] = useState([]);

  const getSuggestions = async () => {
    try {
      const res = await API.get(`/connections/suggestions/${id}`);
      setSuggestions(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const sendRequest = async (receiverId) => {
    try {
      const res = await API.post(`/connections/send/${receiverId}`);
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Request failed");
    }
  };

  useEffect(() => {
    getSuggestions();
  }, [id]);

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-950 text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold">Networking Suggestions</h1>

          <p className="text-gray-400 mt-2">
            Connect with people attending this event.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            {suggestions.map((person) => (
              <div
                key={person._id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
              >
                <h3 className="text-2xl font-bold">{person.name}</h3>

                <p className="text-gray-400 flex items-center gap-2 mt-2">
                  <Briefcase size={18} />
                  {person.profession || "Attendee"}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {person.interests?.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => sendRequest(person._id)}
                  className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-xl mt-6 flex justify-center items-center gap-2"
                >
                  <UserPlus size={18} />
                  Connect
                </button>
              </div>
            ))}
          </div>

          {suggestions.length === 0 && (
            <p className="text-gray-400 mt-10">
              No networking suggestions available yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
}

export default NetworkingSuggestions;