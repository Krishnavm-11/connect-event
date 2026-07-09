import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Send, X } from "lucide-react";

const socket = io("https://connect-event-backend.onrender.com");

function EventChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const getOldMessages = async () => {
    try {
      const res = await API.get(`/messages/event/${id}`);
      setMessages(res.data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      sender: user._id,
      event: id,
      message,
    });

    setMessage("");
  };

  useEffect(() => {
    getOldMessages();

    socket.emit("join_event", id);

    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [id]);

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-950 text-white py-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">

            {/* Header */}

            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h1 className="text-2xl font-bold">
                  Event Group Chat
                </h1>

                <p className="text-gray-400 text-sm mt-1">
                  Chat with people attending this event.
                </p>
              </div>

              <button
                onClick={() => {
                  if (user.role === "admin") {
                    navigate("/admin");
                  } else if (user.role === "organizer") {
                    navigate("/organizer");
                  } else {
                    navigate("/dashboard");
                  }
                }}
                className="bg-slate-800 hover:bg-red-600 w-10 h-10 rounded-xl flex items-center justify-center transition duration-300"
                title="Close Chat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="h-[65vh] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center mt-20">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((msg, index) => {
                  const isMine =
                    msg.sender?._id === user._id ||
                    msg.sender === user._id;

                  return (
                    <div
                      key={index}
                      className={`flex ${isMine
                        ? "justify-end"
                        : "justify-start"
                        }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-2xl ${isMine
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 text-gray-200"
                          }`}
                      >
                        {!isMine && (
                          <p className="text-xs text-blue-400 mb-1">
                            {msg.sender?.name || "User"}
                          </p>
                        )}

                        <p>{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-5 border-t border-slate-800 flex gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-slate-800 rounded-xl px-4 py-3 outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={sendMessage}
                className="bg-blue-500 hover:bg-blue-600 px-5 rounded-xl flex items-center gap-2 transition"
              >
                <Send size={18} />
                Send
              </button>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default EventChat;