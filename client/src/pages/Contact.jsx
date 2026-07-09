import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/contact", formData);

            alert(res.data.message);

            setFormData({
                name: "",
                email: "",
                message: "",
            });
        } catch (error) {
            alert(error.response?.data?.message || "Message failed");
        }
    };

    return (
        <>
            <Navbar />

            <section className="bg-slate-950 text-white min-h-screen">
                <div className="max-w-7xl mx-auto px-6 py-20">

                    <h1 className="text-5xl font-bold text-center">
                        Contact Us
                    </h1>

                    <p className="text-center text-gray-400 mt-5">
                        We'd love to hear from you.
                    </p>

                    <div className="grid lg:grid-cols-2 gap-12 mt-16">

                        <form
                            onSubmit={handleSubmit}
                            className="bg-slate-900 rounded-3xl p-8 border border-slate-800"
                        >
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-slate-800 rounded-xl p-4 outline-none mb-5"
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-800 rounded-xl p-4 outline-none mb-5"
                            />

                            <textarea
                                name="message"
                                rows="6"
                                placeholder="Your Message"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full bg-slate-800 rounded-xl p-4 outline-none"
                            />

                            <button className="mt-6 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold transition">
                                Send Message
                            </button>
                        </form>

                        <div className="space-y-8">

                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex gap-4">
                                <Mail className="text-blue-500" size={30} />

                                <div>
                                    <h3 className="text-xl font-semibold">
                                        Email
                                    </h3>

                                    <p className="text-gray-400 mt-2">
                                        support@connectevent.com
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex gap-4">
                                <Phone className="text-blue-500" size={30} />

                                <div>
                                    <h3 className="text-xl font-semibold">
                                        Phone
                                    </h3>

                                    <p className="text-gray-400 mt-2">
                                        +91 98765 43210
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex gap-4">
                                <MapPin className="text-blue-500" size={30} />

                                <div>
                                    <h3 className="text-xl font-semibold">
                                        Address
                                    </h3>

                                    <p className="text-gray-400 mt-2">
                                        Kerala, India
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </section>

            <Footer />
        </>
    );
}

export default Contact;