import { useEffect, useState } from "react";
import { Mail, User, Calendar, CheckCircle } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

function AdminContacts() {
    const [messages, setMessages] = useState([]);

    const getMessages = async () => {
        try {
            const res = await API.get("/contact");
            setMessages(res.data);
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
        }
    };

    const markAsRead = async (id) => {
        try {
            await API.put(`/contact/${id}/read`);
            getMessages();
        } catch (error) {
            alert(error.response?.data?.message || "Failed");
        }
    };

    useEffect(() => {
        getMessages();
    }, []);

    return (
        <AdminLayout>
            <div>
                <h1 className="text-4xl font-bold text-white">
                    Contact Messages
                </h1>

                <p className="text-gray-400 mt-2">
                    Messages received from website visitors.
                </p>

                <div className="space-y-6 mt-10">
                    {messages.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
                            <p className="text-gray-400">No messages found.</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message._id}
                                className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
                            >
                                <div className="flex justify-between items-start">

                                    <div>

                                        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                                            <User size={22} />
                                            {message.name}
                                        </h2>

                                        <p className="text-gray-400 mt-2 flex items-center gap-2">
                                            <Mail size={18} />
                                            {message.email}
                                        </p>

                                        <p className="text-gray-400 mt-2 flex items-center gap-2">
                                            <Calendar size={18} />
                                            {new Date(message.createdAt).toLocaleString()}
                                        </p>

                                    </div>

                                    {message.isRead ? (
                                        <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
                                            Read
                                        </span>
                                    ) : (
                                        <span className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full">
                                            New
                                        </span>
                                    )}

                                </div>

                                <div className="mt-6 bg-slate-800 rounded-2xl p-5 text-gray-300 leading-7">
                                    {message.message}
                                </div>

                                {!message.isRead && (
                                    <button
                                        onClick={() => markAsRead(message._id)}
                                        className="mt-6 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl flex items-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        Mark as Read
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminContacts;