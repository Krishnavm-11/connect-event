import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Armchair,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  Ticket,
  X,
  XCircle,
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
  const [existingSeatCount, setExistingSeatCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Toast is implemented here; no separate toast file.
  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });

    window.setTimeout(() => {
      setToast((current) =>
        current?.message === message ? null : current
      );
    }, 4000);
  }, []);

  const loadPage = useCallback(async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const [eventResponse, seatsResponse, registrationsResponse] =
        await Promise.all([
          API.get(`/events/${id}`),
          API.get(`/registrations/event/${id}/seats`),
          API.get("/registrations/my-events"),
        ]);

      // Support either a direct event or { event: ... } response.
      setEvent(eventResponse.data?.event || eventResponse.data);

      setOccupiedSeats(
        (seatsResponse.data?.occupiedSeats || []).map(Number)
      );

      const registrations = Array.isArray(registrationsResponse.data)
        ? registrationsResponse.data
        : registrationsResponse.data?.registrations || [];

      // Count seats already booked or actively held for this same event.
      // Expired pending reservations are excluded.
      const now = Date.now();

      const activeRegistrations = registrations.filter((item) => {
        const registeredEventId =
          item.event?._id || item.event || item.eventId;

        if (String(registeredEventId) !== String(id)) {
          return false;
        }

        if (item.status === "registered") {
          return ["paid", "free"].includes(item.paymentStatus);
        }

        if (
          item.status === "pending" &&
          item.paymentStatus === "pending" &&
          item.reservationExpiresAt
        ) {
          return new Date(item.reservationExpiresAt).getTime() > now;
        }

        return false;
      });

      const bookedCount = activeRegistrations.reduce(
        (total, item) => total + (item.selectedSeats || []).length,
        0
      );

      setExistingSeatCount(bookedCount);
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Unable to load the event and seat details.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate, showToast]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const seatNumbers = useMemo(() => {
    const count = Math.max(0, Math.floor(Number(event?.totalSeats || 0)));
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [event]);

  const price = Number(event?.price || 0);
  const total = price * selectedSeats.length;
  const remainingSeats = Math.max(0, 5 - existingSeatCount);
  const limitReached = remainingSeats === 0;

  const toggleSeat = (seatNumber) => {
    setToast(null);

    if (occupiedSeats.includes(seatNumber)) {
      showToast("This seat is already booked or temporarily reserved.");
      return;
    }

    setSelectedSeats((current) => {
      if (current.includes(seatNumber)) {
        return current.filter((seat) => seat !== seatNumber);
      }

      if (current.length >= remainingSeats) {
        showToast(
          remainingSeats === 0
            ? "You have already reached the 5-seat limit for this event."
            : `You can select only ${remainingSeats} more seat${
                remainingSeats === 1 ? "" : "s"
              } for this event.`
        );
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

    if (limitReached) {
      showToast("You have already booked the maximum of 5 seats for this event.");
      return;
    }

    if (selectedSeats.length === 0) {
      showToast("Please select at least one seat.");
      return;
    }

    if (selectedSeats.length > remainingSeats) {
      showToast(`You can book only ${remainingSeats} more seat(s).`);
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      const response = await API.post(`/registrations/${id}`, {
        selectedSeats,
      });

      const { registration, order, keyId, isFree } = response.data;

      if (isFree || registration?.paymentStatus === "free") {
        showToast("Your free booking is confirmed.", "success");
        finishBooking(registration._id);
        return;
      }

      const loaded = await loadRazorpay();

      if (!loaded) {
        showToast(
          "Unable to load the payment window. Your seat reservation may expire automatically."
        );
        setSubmitting(false);
        return;
      }

      if (!order?.id || !keyId) {
        showToast("The payment order could not be created.");
        setSubmitting(false);
        return;
      }

      const checkout = new window.Razorpay({
        key: keyId,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Connect Event",
        description: event?.title || "Event booking",
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: { color: "#3b82f6" },

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

            const confirmed = verification.data?.registration;

            if (
              confirmed?.status === "registered" &&
              confirmed?.paymentStatus === "paid"
            ) {
              finishBooking(confirmed._id);
              return;
            }

            showToast(
              "Payment verification is not complete. Check your dashboard before trying to pay again."
            );
            setSubmitting(false);
          } catch (error) {
            showToast(
              error.response?.data?.message ||
                "Payment verification failed. Check your booking status before paying again."
            );
            setSubmitting(false);
          }
        },

        modal: {
          ondismiss: () => {
            setSubmitting(false);
            showToast(
              "Payment window closed. Check your booking status before trying again."
            );
          },
        },
      });

      checkout.on("payment.failed", (paymentError) => {
        setSubmitting(false);
        showToast(
          paymentError.error?.description ||
            "Payment failed. Please check your booking status before trying again."
        );
      });

      checkout.open();
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Unable to start your booking. Please try again."
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
        <main className="min-h-screen bg-slate-950 text-white p-8 text-center">
          <p>Event could not be loaded.</p>
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="mt-5 bg-blue-500 px-5 py-3 rounded-xl"
          >
            Browse Events
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Toast message displayed directly in this file */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-4 z-[100] max-w-sm w-[calc(100%-2rem)] rounded-2xl border p-4 shadow-2xl flex items-start gap-3 ${
            toast.type === "success"
              ? "bg-emerald-950 border-emerald-500/40 text-emerald-100"
              : "bg-red-950 border-red-500/40 text-red-100"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="shrink-0 text-emerald-400" size={22} />
          ) : (
            <XCircle className="shrink-0 text-red-400" size={22} />
          )}

          <p className="text-sm flex-1">{toast.message}</p>

          <button
            type="button"
            aria-label="Close message"
            onClick={() => setToast(null)}
            className="opacity-70 hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <main className="min-h-screen bg-slate-950 text-white px-4 py-10 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(`/events/${id}`)}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft size={18} />
            Back to event
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8">
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest">
                Step 1 of 2
              </p>

              <h1 className="text-3xl sm:text-4xl font-bold mt-3">
                Choose your seats
              </h1>

              <p className="text-gray-400 mt-3">{event.title}</p>

              <div className="mt-5 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                <p className="font-semibold text-blue-200">
                  Your event seat limit
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  Already booked or reserved: {existingSeatCount} / 5
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  You can select {remainingSeats} more seat
                  {remainingSeats === 1 ? "" : "s"} for this event.
                </p>
              </div>

              {limitReached && (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 text-sm">
                  You have reached the maximum of 5 seats for this event.
                  You cannot book additional seats.
                </div>
              )}

              <div className="rounded-xl bg-slate-800 py-3 text-center text-xs sm:text-sm tracking-[0.25em] text-gray-300 my-8">
                STAGE / EVENT AREA
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
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
                        disabled={
                          occupied ||
                          submitting ||
                          limitReached ||
                          (!selected &&
                            selectedSeats.length >= remainingSeats)
                        }
                        onClick={() => toggleSeat(seatNumber)}
                        aria-pressed={selected}
                        aria-label={`Seat ${seatNumber}${
                          occupied
                            ? ", unavailable"
                            : selected
                              ? ", selected"
                              : ", available"
                        }`}
                        className={`min-h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition disabled:cursor-not-allowed ${
                          selected
                            ? "bg-blue-500 border-blue-400 text-white"
                            : occupied
                              ? "bg-gray-600/40 border-gray-700 text-gray-500"
                              : "bg-slate-800 border-slate-700 hover:border-blue-400 hover:bg-slate-700 disabled:opacity-40"
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
                {new Date(event.date).toLocaleDateString("en-IN")} ·{" "}
                {event.time}
              </p>

              <p className="text-sm text-gray-400 mt-2">
                {event.venue}, {event.location}
              </p>

              <div className="border-t border-slate-800 my-6" />

              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-400">Price per seat</span>
                <span>₹{price.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-sm mb-4 gap-4">
                <span className="text-gray-400">
                  Selected ({selectedSeats.length})
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
                type="button"
                onClick={handleBooking}
                disabled={
                  submitting ||
                  selectedSeats.length === 0 ||
                  limitReached
                }
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
                Maximum 5 seats per event, across all your bookings.
              </p>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default SeatSelection;