
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Send, X } from "lucide-react";

const socket = io("https://connect-event-backend.onrender.com", {
  autoConnect: false,
});

function EventChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  // Prevent duplicate messages.
  const addMessage = (newMessage) => {
    setMessages((prev) => {
      const alreadyExists = prev.some(
        (msg) => msg._id === newMessage._id
      );

      if (alreadyExists) return prev;

      return [...prev, newMessage];
    });
  };

  // Get previously saved messages.
  const getOldMessages = async () => {
    try {
      const res = await API.get(`/messages/event/${id}`);

      setMessages((prev) => {
        const combined = [...res.data, ...prev];
        const uniqueMessages = Array.from(
          new Map(
            combined.map((msg) => [msg._id, msg])
          ).values()
        );

        return uniqueMessages.sort(
          (a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
    } catch (error) {
      console.error(
        "Unable to load messages:",
        error.response?.data?.message || error.message
      );
    }
  };

  // Send message.
  const sendMessage = () => {
    if (!message.trim() || !user?._id || !socket.connected) {
      return;
    }

    socket.emit("send_message", {
      sender: user._id,
      eventId: id,
      message: message.trim(),
    });

    setMessage("");
  };

  useEffect(() => {
    if (!id || !user?._id) return;

    const handleConnect = () => {
      console.log("Chat connected:", socket.id);

      socket.emit("join_event", id);
    };

    const handleReceiveMessage = (newMessage) => {
      addMessage(newMessage);
    };

    const handleMessageError = (error) => {
      console.error("Message error:", error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_error", handleMessageError);

    socket.connect();

    if (socket.connected) {
      handleConnect();
    }

    getOldMessages();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_error", handleMessageError);

      socket.disconnect();
    };
  }, [id, user?._id]);

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
                  if (user?.role === "admin") {
                    navigate("/admin");
                  } else if (user?.role === "organizer") {
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

            {/* Messages */}
            <div className="h-[65vh] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center mt-20">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((msg) => {
                  const senderId =
                    msg.sender?._id || msg.sender;

                  const isMine =
                    senderId?.toString() === user?._id?.toString();

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-2xl break-words ${
                          isMine
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

            {/* Message Input */}
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
                disabled={!message.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-5 rounded-xl flex items-center gap-2 transition"
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
