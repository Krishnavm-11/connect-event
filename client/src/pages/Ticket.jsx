import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Printer,
  Ticket as TicketIcon,
} from "lucide-react";

import Navbar from "../components/Navbar";
import API from "../services/api";

function Ticket() {
  const { registrationId } = useParams();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const response = await API.get(
          `/registrations/ticket/${registrationId}`
        );

        setRegistration(response.data);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "Unable to load the ticket."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [registrationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading your ticket...
      </div>
    );
  }

  if (!registration?.event) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-950 text-white px-6 py-20 text-center">
          <h1 className="text-3xl font-bold">
            Ticket unavailable
          </h1>
          <p className="text-gray-400 mt-4">
            {errorMessage || "A confirmed ticket could not be found."}
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-7 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl"
          >
            Go to Dashboard
          </button>
        </main>
      </>
    );
  }

  const event = registration.event;
  const isPaid = registration.paymentStatus === "paid";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 text-white px-4 py-10 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="print:hidden inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="text-center mb-8 print:hidden">
            <div className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-400 p-4 rounded-full">
              <CheckCircle2 size={36} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mt-5">
              You're registered!
            </h1>

            <p className="text-gray-400 mt-3">
              Your booking is confirmed. Keep your ticket for the event.
            </p>
          </div>

          <article className="ticket-print bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <TicketIcon size={30} className="text-blue-400" />
                  <div>
                    <p className="font-bold text-xl">CONNECT EVENT</p>
                    <p className="text-xs tracking-[0.2em] text-gray-400">
                      ADMISSION TICKET
                    </p>
                  </div>
                </div>

                <span className="text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-1 text-xs font-semibold">
                  CONFIRMED
                </span>
              </div>

              {event.banner && (
                <img
                  src={event.banner}
                  alt={event.title}
                  className="mt-7 w-full h-48 sm:h-64 object-cover rounded-2xl"
                />
              )}

              <h2 className="text-2xl sm:text-3xl font-bold mt-6">
                {event.title}
              </h2>

              <p className="text-gray-400 mt-2">
                Organized by {event.organizer?.name || "Event Organizer"}
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <CalendarDays
                    className="text-blue-500 shrink-0"
                    size={22}
                  />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Event date
                    </p>
                    <p className="font-semibold mt-1">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock
                    className="text-blue-500 shrink-0"
                    size={22}
                  />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Event time
                    </p>
                    <p className="font-semibold mt-1">
                      {event.time}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:col-span-2">
                  <MapPin
                    className="text-blue-500 shrink-0"
                    size={22}
                  />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Venue
                    </p>
                    <p className="font-semibold mt-1">
                      {event.venue}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {event.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-7" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Ticket number
                  </p>
                  <p className="font-bold mt-2 break-all">
                    {registration.ticketNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Payment status
                  </p>
                  <p className="font-bold text-emerald-600 mt-2">
                    {isPaid ? "Paid successfully" : "Free registration"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Your selected seats
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {registration.selectedSeats?.map((seat) => (
                      <span
                        key={seat}
                        className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2 font-semibold"
                      >
                        Seat {seat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 mt-7 flex justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Total amount
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    ₹{Number(registration.amount || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Number of seats
                  </p>
                  <p className="text-xl font-bold mt-1">
                    {registration.selectedSeats?.length || 0}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-6 text-center">
                Please keep your ticket number available when attending
                the event.
              </p>
            </div>
          </article>

          <div className="print:hidden flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 rounded-xl py-4 font-semibold"
            >
              <Printer size={19} />
              Print / Save as PDF
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-slate-800 hover:bg-slate-700 rounded-xl py-4 font-semibold"
            >
              My Dashboard
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @media print {
          body {
            background: white !important;
          }

          nav,
          header,
          footer {
            display: none !important;
          }

          .ticket-print {
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
    </>
  );
}

export default Ticket;