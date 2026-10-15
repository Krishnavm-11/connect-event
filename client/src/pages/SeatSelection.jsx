import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Armchair,
    CheckCircle2,
    CreditCard,
    LoaderCircle,
    Ticket,
} from "lucide-react";

import Navbar from "../components/Navbar";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const loadRazorpay = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });

function SeatSelection() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const loadPage = async () => {
            try {
                const [eventResponse, seatsResponse] = await Promise.all([
                    API.get(`/events/${id}`),
                    API.get(`/registrations/event/${id}/seats`),
                ]);

                setEvent(eventResponse.data);
                setOccupiedSeats(seatsResponse.data.occupiedSeats || []);
            } catch (error) {
                setMessage(
                    error.response?.data?.message ||
                    "Unable to load the event seats."
                );
            } finally {
                setLoading(false);
            }
        };

        loadPage();
    }, [id, user, navigate]);

    const seatNumbers = useMemo(() => {
        const count = Math.max(
            0,
            Math.floor(Number(event?.totalSeats || 0))
        );

        return Array.from({ length: count }, (_, index) => index + 1);
    }, [event]);

    const price = Number(event?.price || 0);
    const total = price * selectedSeats.length;

    const toggleSeat = (seatNumber) => {
        setMessage("");

        if (occupiedSeats.includes(seatNumber)) {
            return;
        }

        setSelectedSeats((current) => {
            if (current.includes(seatNumber)) {
                return current.filter((seat) => seat !== seatNumber);
            }

            if (current.length >= 5) {
                setMessage("You can select a maximum of 5 seats.");
                return current;
            }

            return [...current, seatNumber].sort((a, b) => a - b);
        });
    };

    const finishBooking = (registrationId) => {
        navigate(`/ticket/${registrationId}`);
    };

    const handleBooking = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (selectedSeats.length === 0) {
            setMessage("Please select at least one seat.");
            return;
        }

        setSubmitting(true);
        setMessage("");

        try {
            const response = await API.post(`/registrations/${id}`, {
                selectedSeats,
            });

            const { registration, order, keyId } = response.data;

            if (registration?.paymentStatus === "free") {
                finishBooking(registration._id);
                return;
            }

            if (!order?.id || !keyId || !window.Razorpay) {
                const loaded = await loadRazorpay();

                if (!loaded) {
                    setMessage("Unable to load Razorpay. Please try again.");
                    return;
                }
            }

            if (!order?.id || !keyId) {
                setMessage("The payment order could not be created.");
                return;
            }

            const checkout = new window.Razorpay({
                key: keyId,
                order_id: order.id,
                amount: order.amount,
                currency: order.currency || "INR",
                name: "Connect Event",
                description: event.title,
                prefill: {
                    name: user.name || "",
                    email: user.email || "",
                },
                theme: {
                    color: "#3b82f6",
                },
                handler: async (paymentResponse) => {
                    try {
                        const verification = await API.post(
                            "/registrations/verify-payment",
                            {
                                registrationId: registration._id,
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                            }
                        );

                        if (
                            verification.data.registration?.status === "registered" &&
                            verification.data.registration?.paymentStatus === "paid"
                        ) {
                            finishBooking(registration._id);
                        } else {
                            setMessage(
                                "Payment is not confirmed yet. Please check your registrations."
                            );
                        }
                    } catch (error) {
                        setMessage(
                            error.response?.data?.message ||
                            "Payment verification failed. Do not pay again until you check your booking status."
                        );
                    } finally {
                        setSubmitting(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setSubmitting(false);
                        setMessage(
                            "Checkout was closed. Your seat hold may expire automatically."
                        );
                    },
                },
            });

            checkout.on("payment.failed", (paymentError) => {
                setSubmitting(false);
                setMessage(
                    paymentError.error?.description ||
                    "Payment failed. Please try again."
                );
            });

            checkout.open();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to start registration. Please try again."
            );
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <LoaderCircle className="animate-spin mr-3" />
                Loading seats...
            </div>
        );
    }

    if (!event) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-slate-950 text-white p-8 text-center">
                    <p>{message || "Event could not be loaded."}</p>
                    <button
                        onClick={() => navigate("/events")}
                        className="mt-5 bg-blue-500 px-5 py-3 rounded-xl"
                    >
                        Browse Events
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-slate-950 text-white px-4 py-10 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => navigate(`/events/${id}`)}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
                    >
                        <ArrowLeft size={18} />
                        Back to event
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
                        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8">
                            <div className="mb-8">
                                <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest">
                                    Step 1 of 2
                                </p>

                                <h1 className="text-3xl sm:text-4xl font-bold mt-3">
                                    Choose your seats
                                </h1>

                                <p className="text-gray-400 mt-3">
                                    {event.title}
                                </p>

                                <p className="text-gray-500 text-sm mt-2">
                                    Select up to 5 seats per booking. Already booked or
                                    temporarily reserved seats are disabled.
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-800 py-3 text-center text-xs sm:text-sm tracking-[0.25em] text-gray-300 mb-8">
                                STAGE / EVENT AREA
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
                                <span className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="w-3 h-3 rounded bg-slate-700" />
                                    Available
                                </span>

                                <span className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="w-3 h-3 rounded bg-blue-500" />
                                    Selected
                                </span>

                                <span className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="w-3 h-3 rounded bg-gray-500" />
                                    Unavailable
                                </span>
                            </div>

                            {seatNumbers.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">
                                    No seats are configured for this event.
                                </p>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
                                    {seatNumbers.map((seatNumber) => {
                                        const selected = selectedSeats.includes(seatNumber);
                                        const occupied = occupiedSeats.includes(seatNumber);

                                        return (
                                            <button
                                                type="button"
                                                key={seatNumber}
                                                disabled={occupied || submitting}
                                                onClick={() => toggleSeat(seatNumber)}
                                                aria-pressed={selected}
                                                aria-label={`Seat ${seatNumber}${occupied
                                                        ? ", unavailable"
                                                        : selected
                                                            ? ", selected"
                                                            : ", available"
                                                    }`}
                                                className={`min-h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition disabled:cursor-not-allowed ${selected
                                                        ? "bg-blue-500 border-blue-400 text-white"
                                                        : occupied
                                                            ? "bg-gray-600/40 border-gray-700 text-gray-500"
                                                            : "bg-slate-800 border-slate-700 hover:border-blue-400 hover:bg-slate-700"
                                                    }`}
                                            >
                                                {selected ? (
                                                    <CheckCircle2 size={19} />
                                                ) : (
                                                    <Armchair size={19} />
                                                )}
                                                <span className="text-xs">{seatNumber}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {message && (
                                <div
                                    role="status"
                                    className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 p-4 text-sm"
                                >
                                    {message}
                                </div>
                            )}
                        </section>

                        <aside className="h-fit bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:sticky lg:top-24">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                    <Ticket size={24} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold">Booking summary</h2>
                                    <p className="text-sm text-gray-400">
                                        Review your selection
                                    </p>
                                </div>
                            </div>

                            <h3 className="font-semibold text-lg">{event.title}</h3>

                            <p className="text-sm text-gray-400 mt-2">
                                {new Date(event.date).toLocaleDateString()} · {event.time}
                            </p>

                            <p className="text-sm text-gray-400 mt-2">
                                {event.venue}, {event.location}
                            </p>

                            <div className="border-t border-slate-800 my-6" />

                            <div className="flex justify-between text-sm mb-4">
                                <span className="text-gray-400">Price per seat</span>
                                <span>₹{price.toLocaleString("en-IN")}</span>
                            </div>

                            <div className="flex justify-between text-sm mb-4">
                                <span className="text-gray-400">
                                    Selected seats ({selectedSeats.length})
                                </span>
                                <span className="text-right">
                                    {selectedSeats.length
                                        ? selectedSeats.map((seat) => `Seat ${seat}`).join(", ")
                                        : "None"}
                                </span>
                            </div>

                            <div className="border-t border-slate-800 my-6" />

                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Total</span>
                                <span className="text-2xl font-bold text-blue-400">
                                    ₹{total.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={submitting || selectedSeats.length === 0}
                                className="w-full mt-7 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-4 font-semibold"
                            >
                                {submitting ? (
                                    <>
                                        <LoaderCircle className="animate-spin" size={19} />
                                        Processing...
                                    </>
                                ) : price > 0 ? (
                                    <>
                                        <CreditCard size={19} />
                                        Continue to Payment
                                    </>
                                ) : (
                                    <>
                                        <Ticket size={19} />
                                        Confirm Free Booking
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                Maximum 5 seats per booking. Tickets are available after
                                confirmation.
                            </p>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}

export default SeatSelection;