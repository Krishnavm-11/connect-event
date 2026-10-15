import crypto from "crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay";

import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import Notification from "../models/Notification.js";
import SeatReservation from "../models/SeatReservation.js";

// Initialize Razorpay only when needed
const getRazorpay = () => {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    throw new Error("Razorpay environment variables are missing");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Generate a unique ticket number
const createTicketNumber = () => {
  return `EVT-${Date.now()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
};

// Get calendar date in India
const getIndiaDateKey = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

// Registration is allowed only before the event date
const isRegistrationOpen = (eventDate) => {
  if (!eventDate) return false;

  const parsedDate = new Date(eventDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return getIndiaDateKey(parsedDate) > getIndiaDateKey();
};

// Release expired reservations and restore inventory
const releaseExpiredReservations = async (eventId = null) => {
  const now = new Date();

  const expiredQuery = {
    status: "pending",
    paymentStatus: "pending",
    reservationExpiresAt: { $lte: now },
  };

  if (eventId) {
    expiredQuery.event = eventId;
  }

  const expiredRegistrations = await Registration.find(
    expiredQuery
  ).select("_id event selectedSeats");

  for (const item of expiredRegistrations) {
    const expiredRegistration = await Registration.findOneAndUpdate(
      {
        _id: item._id,
        status: "pending",
        paymentStatus: "pending",
        reservationExpiresAt: { $lte: now },
      },
      {
        $set: {
          status: "cancelled",
          paymentStatus: "failed",
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!expiredRegistration) continue;

    const deletedSeats = await SeatReservation.deleteMany({
      registration: expiredRegistration._id,
      status: "held",
    });

    if (deletedSeats.deletedCount > 0) {
      await Event.findByIdAndUpdate(expiredRegistration.event, {
        $inc: {
          availableSeats: deletedSeats.deletedCount,
        },
      });
    }
  }
};

// Create notification
const createRegistrationNotification = async (
  userId,
  title,
  message
) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      isRead: false,
    });
  } catch (error) {
    console.error(
      "Registration notification error:",
      error.message
    );
  }
};

// GET /api/registrations/event/:eventId/seats
export const getEventSeats = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    await releaseExpiredReservations(eventId);

    const reservations = await SeatReservation.find({
      event: eventId,
      $or: [
        { status: "booked" },
        {
          status: "held",
          expiresAt: { $gt: new Date() },
        },
      ],
    }).select("seatNumber");

    return res.status(200).json({
      occupiedSeats: reservations.map(
        (reservation) => reservation.seatNumber
      ),
    });
  } catch (error) {
    console.error("Get event seats error:", error);

    return res.status(500).json({
      message: "Failed to load event seats",
    });
  }
};

// POST /api/registrations/:eventId
export const registerForEvent = async (req, res) => {
  let registration = null;
  let seatHoldCreated = false;
  let inventoryReserved = false;

  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const { selectedSeats } = req.body;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    if (
      !Array.isArray(selectedSeats) ||
      selectedSeats.length < 1 ||
      selectedSeats.length > 5
    ) {
      return res.status(400).json({
        message: "Please select between 1 and 5 seats",
      });
    }

    const seats = selectedSeats.map(Number);

    if (
      seats.some(
        (seat) => !Number.isInteger(seat) || seat < 1
      ) ||
      new Set(seats).size !== seats.length
    ) {
      return res.status(400).json({
        message: "Selected seats are invalid or duplicated",
      });
    }

    await releaseExpiredReservations(eventId);

    const event = await Event.findOne({
      _id: eventId,
      status: "approved",
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or not approved",
      });
    }

    // Close registration on the event day in India
    if (!isRegistrationOpen(event.date)) {
      return res.status(400).json({
        message: "Registration is closed for this event.",
      });
    }

    const totalSeats = Number(event.totalSeats);
    const availableSeats = Number(event.availableSeats);
    const price = Number(event.price || 0);

    if (
      !Number.isInteger(totalSeats) ||
      totalSeats < 1 ||
      seats.some((seat) => seat > totalSeats)
    ) {
      return res.status(400).json({
        message: "One or more selected seats are invalid",
      });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: "The event price is invalid",
      });
    }

    // Maximum five active seats per user per event
    const existingRegistrations = await Registration.find({
      user: userId,
      event: eventId,
      status: { $in: ["pending", "registered"] },
    }).select("selectedSeats reservationExpiresAt");

    const now = new Date();

    const existingSeatCount = existingRegistrations.reduce(
      (total, item) => {
        const expired =
          item.reservationExpiresAt &&
          new Date(item.reservationExpiresAt) <= now;

        if (expired) return total;

        return total + (item.selectedSeats || []).length;
      },
      0
    );

    if (existingSeatCount + seats.length > 5) {
      return res.status(400).json({
        message: `You can book a maximum of 5 seats per event. You have already reserved ${existingSeatCount} seat(s).`,
      });
    }

    // Reject seats already held or booked
    const existingSeatReservations = await SeatReservation.find({
      event: eventId,
      seatNumber: { $in: seats },
      $or: [
        { status: "booked" },
        {
          status: "held",
          expiresAt: { $gt: new Date() },
        },
      ],
    }).select("seatNumber");

    if (existingSeatReservations.length > 0) {
      return res.status(409).json({
        message:
          "One or more selected seats are no longer available. Please select different seats.",
        occupiedSeats: existingSeatReservations.map(
          (item) => item.seatNumber
        ),
      });
    }

    if (availableSeats < seats.length) {
      return res.status(409).json({
        message: "Not enough seats are available",
      });
    }

    const amount =
      Math.round(price * seats.length * 100) / 100;

    const isFree = amount === 0;
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    registration = await Registration.create({
      user: userId,
      event: eventId,
      selectedSeats: seats,
      amount,
      status: isFree ? "registered" : "pending",
      paymentStatus: isFree ? "free" : "pending",
      ticketNumber: isFree
        ? createTicketNumber()
        : undefined,
      reservationExpiresAt: isFree
        ? undefined
        : expiresAt,
    });

    await SeatReservation.insertMany(
      seats.map((seatNumber) => ({
        event: eventId,
        seatNumber,
        registration: registration._id,
        status: isFree ? "booked" : "held",
        expiresAt: isFree ? undefined : expiresAt,
      }))
    );

    seatHoldCreated = true;

    // Reserve inventory atomically
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: "approved",
        availableSeats: { $gte: seats.length },
      },
      {
        $inc: {
          availableSeats: -seats.length,
        },
      },
      {
        returnDocument: "after",
      }
    );

    if (!updatedEvent) {
      throw new Error("SEATS_NO_LONGER_AVAILABLE");
    }

    inventoryReserved = true;

    // Free registration: confirm immediately
    if (isFree) {
      await createRegistrationNotification(
        userId,
        "Registration Successful",
        `Your registration for ${event.title} is confirmed.`
      );

      return res.status(201).json({
        message: "Registration successful",
        registration,
        isFree: true,
      });
    }

    // Paid registration: create Razorpay order
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: String(registration._id),
      notes: {
        registrationId: String(registration._id),
        eventId: String(eventId),
        userId: String(userId),
      },
    });

    registration.razorpayOrderId = order.id;
    await registration.save();

    return res.status(201).json({
      message:
        "Seat reservation created. Complete payment within 10 minutes.",
      registration,
      isFree: false,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Register for event error:", error);

    if (registration) {
      const current = await Registration.findById(
        registration._id
      ).catch(() => null);

      if (current && current.status !== "registered") {
        await Registration.findByIdAndUpdate(
          registration._id,
          {
            $set: {
              status: "cancelled",
              paymentStatus: "failed",
            },
          }
        ).catch(() => {});

        const deleted = await SeatReservation.deleteMany({
          registration: registration._id,
          status: { $in: ["held", "booked"] },
        }).catch(() => ({ deletedCount: 0 }));

        if (inventoryReserved && deleted.deletedCount > 0) {
          await Event.findByIdAndUpdate(registration.event, {
            $inc: {
              availableSeats: deleted.deletedCount,
            },
          }).catch(() => {});
        }
      } else if (!current && seatHoldCreated) {
        await SeatReservation.deleteMany({
          registration: registration._id,
        }).catch(() => {});
      }
    }

    if (error.message === "SEATS_NO_LONGER_AVAILABLE") {
      return res.status(409).json({
        message:
          "Seats are no longer available. Please select again.",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "One or more seats have just been reserved. Please select again.",
      });
    }

    return res.status(500).json({
      message:
        "Unable to create registration. Please try again.",
    });
  }
};

// POST /api/registrations/verify-payment
export const verifyRegistrationPayment = async (req, res) => {
  try {
    const {
      registrationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !mongoose.isValidObjectId(registrationId) ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message:
          "Required payment verification details are missing",
      });
    }

    const registration = await Registration.findOne({
      _id: registrationId,
      user: req.user._id,
    });

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    // Allow safe retries after successful payment
    if (
      registration.status === "registered" &&
      registration.paymentStatus === "paid"
    ) {
      return res.status(200).json({
        message: "Payment has already been verified",
        registration,
      });
    }

    if (
      registration.status !== "pending" ||
      registration.paymentStatus !== "pending"
    ) {
      return res.status(400).json({
        message:
          "This registration is no longer awaiting payment",
      });
    }

    if (
      registration.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        message: "Payment order does not match",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return res.status(500).json({
        message: "Payment configuration is incomplete",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const signatureBuffer = Buffer.from(
      razorpay_signature,
      "hex"
    );

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "hex"
    );

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(
        signatureBuffer,
        expectedBuffer
      )
    ) {
      return res.status(400).json({
        message: "Payment signature verification failed",
      });
    }

    // Verify payment directly with Razorpay
    const razorpay = getRazorpay();

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !==
        Math.round(Number(registration.amount) * 100) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        message:
          "Payment is not confirmed as captured. Check payment status before retrying.",
      });
    }

    // Do not confirm a registration after the event registration deadline
    const eventForPayment = await Event.findById(
      registration.event
    ).select("date");

    if (
      !eventForPayment ||
      !isRegistrationOpen(eventForPayment.date)
    ) {
      return res.status(410).json({
        message:
          "Registration has closed for this event. If your payment was charged, please contact support for payment reconciliation.",
      });
    }

    if (
      !registration.reservationExpiresAt ||
      new Date(registration.reservationExpiresAt) <=
        new Date()
    ) {
      await releaseExpiredReservations(registration.event);

      return res.status(410).json({
        message:
          "Your seat reservation expired. If payment was charged, contact support for reconciliation.",
      });
    }

    const heldSeats = await SeatReservation.find({
      registration: registration._id,
      status: "held",
      expiresAt: { $gt: new Date() },
    });

    if (
      heldSeats.length !==
      (registration.selectedSeats || []).length
    ) {
      return res.status(409).json({
        message:
          "Reserved seats could not be confirmed. Contact support if payment was charged.",
      });
    }

    const confirmedRegistration =
      await Registration.findOneAndUpdate(
        {
          _id: registration._id,
          user: req.user._id,
          status: "pending",
          paymentStatus: "pending",
          reservationExpiresAt: { $gt: new Date() },
        },
        {
          $set: {
            status: "registered",
            paymentStatus: "paid",
            ticketNumber: createTicketNumber(),
            razorpayPaymentId: razorpay_payment_id,
            reservationExpiresAt: null,
          },
        },
        {
          returnDocument: "after",
        }
      );

    if (!confirmedRegistration) {
      const latest = await Registration.findById(
        registration._id
      );

      if (
        latest?.status === "registered" &&
        latest?.paymentStatus === "paid"
      ) {
        return res.status(200).json({
          message: "Payment has already been verified",
          registration: latest,
        });
      }

      return res.status(409).json({
        message:
          "Registration could not be confirmed. Check its status before retrying.",
      });
    }

    await SeatReservation.updateMany(
      {
        registration: confirmedRegistration._id,
        status: "held",
      },
      {
        $set: {
          status: "booked",
          expiresAt: null,
        },
      }
    );

    const event = await Event.findById(
      confirmedRegistration.event
    ).select("title");

    await createRegistrationNotification(
      req.user._id,
      "Registration Successful",
      `Your payment was successful and your registration for ${
        event?.title || "the event"
      } is confirmed.`
    );

    return res.status(200).json({
      message:
        "Payment verified and registration confirmed",
      registration: confirmedRegistration,
    });
  } catch (error) {
    console.error(
      "Verify registration payment error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to verify payment right now. Check the payment status before attempting another payment.",
    });
  }
};

// GET /api/registrations/ticket/:registrationId
export const getTicket = async (req, res) => {
  try {
    const { registrationId } = req.params;

    if (!mongoose.isValidObjectId(registrationId)) {
      return res.status(400).json({
        message: "Invalid registration ID",
      });
    }

    const registration = await Registration.findOne({
      _id: registrationId,
      user: req.user._id,
      status: "registered",
      paymentStatus: { $in: ["paid", "free"] },
    }).populate("event");

    if (!registration) {
      return res.status(404).json({
        message: "Confirmed ticket not found",
      });
    }

    return res.status(200).json({
      registration,
    });
  } catch (error) {
    console.error("Get ticket error:", error);

    return res.status(500).json({
      message: "Failed to load ticket",
    });
  }
};

// DELETE /api/registrations/:eventId
export const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const registration = await Registration.findOne({
      user: userId,
      event: eventId,
      status: "registered",
    });

    if (!registration) {
      return res.status(404).json({
        message: "Active registration not found",
      });
    }

    const cancelledRegistration =
      await Registration.findOneAndUpdate(
        {
          _id: registration._id,
          user: userId,
          status: "registered",
        },
        {
          $set: {
            status: "cancelled",
          },
        },
        {
          returnDocument: "after",
        }
      );

    if (!cancelledRegistration) {
      return res.status(409).json({
        message:
          "This registration has already been cancelled",
      });
    }

    const deleted = await SeatReservation.deleteMany({
      registration: registration._id,
      status: "booked",
    });

    if (deleted.deletedCount > 0) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: {
          availableSeats: deleted.deletedCount,
        },
      });
    }

    return res.status(200).json({
      message: "Registration cancelled successfully",
      registration: cancelledRegistration,
    });
  } catch (error) {
    console.error("Cancel registration error:", error);

    return res.status(500).json({
      message: "Unable to cancel registration",
    });
  }
};

// GET /api/registrations/my-events
export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
    })
      .populate("event")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      registrations,
    });
  } catch (error) {
    console.error("Get my registrations error:", error);

    return res.status(500).json({
      message: "Failed to load registrations",
    });
  }
};

// GET /api/registrations/event/:eventId/attendees
export const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const registrations = await Registration.find({
      event: eventId,
      status: "registered",
      paymentStatus: { $in: ["paid", "free"] },
    })
      .populate("user", "name email")
      .select(
        "user selectedSeats ticketNumber amount paymentStatus createdAt"
      );

    return res.status(200).json({
      registrations,
    });
  } catch (error) {
    console.error("Get event attendees error:", error);

    return res.status(500).json({
      message: "Failed to load event attendees",
    });
  }
};