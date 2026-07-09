import { Users, Calendar, Globe, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
    return (
        <>
            <Navbar />

            <section className="bg-slate-950 text-white min-h-screen">

                <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl font-bold">
                        About <span className="text-blue-500">ConnectEvent</span>
                    </h1>

                    <p className="text-gray-400 mt-6 max-w-3xl mx-auto text-lg leading-8">
                        ConnectEvent is a modern event networking platform that helps
                        people discover events, register instantly, connect with attendees,
                        and build meaningful professional relationships.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center pb-20">

                    <div>
                        <h2 className="text-4xl font-bold">
                            Our Mission
                        </h2>

                        <p className="text-gray-400 mt-6 leading-8">
                            We believe networking should be simple, accessible and engaging.
                            Our platform connects attendees, organizers and professionals
                            through technology, making every event more interactive and
                            valuable.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">

                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                            <Calendar className="text-blue-500" size={36} />
                            <h3 className="text-xl font-semibold mt-4">
                                Events
                            </h3>
                            <p className="text-gray-400 mt-2">
                                Discover exciting events around you.
                            </p>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                            <Users className="text-blue-500" size={36} />
                            <h3 className="text-xl font-semibold mt-4">
                                Networking
                            </h3>
                            <p className="text-gray-400 mt-2">
                                Connect with professionals and attendees.
                            </p>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                            <Globe className="text-blue-500" size={36} />
                            <h3 className="text-xl font-semibold mt-4">
                                Community
                            </h3>
                            <p className="text-gray-400 mt-2">
                                Build relationships that matter.
                            </p>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                            <ShieldCheck className="text-blue-500" size={36} />
                            <h3 className="text-xl font-semibold mt-4">
                                Secure
                            </h3>
                            <p className="text-gray-400 mt-2">
                                Safe authentication and protected data.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}

export default About;