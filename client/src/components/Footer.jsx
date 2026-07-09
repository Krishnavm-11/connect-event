import { Link } from "react-router-dom";
import { Calendar, Mail, Phone, MapPin } from "lucide-react";

function Footer() {
    return (
        <footer className="bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-6 py-12">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    <div>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-blue-500" size={28} />
                            <h2 className="text-2xl font-bold">
                                Connect<span className="text-blue-500">Event</span>
                            </h2>
                        </div>

                        <p className="text-gray-400 mt-4">
                            Discover events, connect with people, and grow your professional network.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4">
                            Quick Links
                        </h3>

                        <div className="flex flex-col gap-3">
                            <Link to="/" className="text-gray-400 hover:text-blue-400">
                                Home
                            </Link>

                            <Link to="/events" className="text-gray-400 hover:text-blue-400">
                                Events
                            </Link>

                            <Link to="/login" className="text-gray-400 hover:text-blue-400">
                                Login
                            </Link>

                            <Link to="/register" className="text-gray-400 hover:text-blue-400">
                                Register
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4">
                            Contact
                        </h3>

                        <div className="space-y-4 text-gray-400">

                            <div className="flex items-center gap-3">
                                <Mail size={18} />
                                <span>support@connectevent.com</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone size={18} />
                                <span>+91 98765 43210</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin size={18} />
                                <span>Kerala, India</span>
                            </div>

                        </div>
                    </div>

                </div>

                <div className="border-t border-slate-800 mt-10 pt-6 text-center text-gray-500">
                    © {new Date().getFullYear()} ConnectEvent. All Rights Reserved.
                </div>

            </div>
        </footer>
    );
}

export default Footer;