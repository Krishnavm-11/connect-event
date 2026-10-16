import User from "../models/User.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Notification from "../models/Notification.js";

// ==============================
// ADMIN DASHBOARD STATS
// ==============================
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrganizers,
      totalEvents,
      pendingEvents,
      approvedEvents,
      rejectedEvents,
      totalRegistrations,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "organizer" }),
      Event.countDocuments(),
      Event.countDocuments({ status: "pending" }),
      Event.countDocuments({ status: "approved" }),
      Event.countDocuments({ status: "rejected" }),
      Registration.countDocuments(),
    ]);

    res.status(200).json({
      totalUsers,
      totalOrganizers,
      totalEvents,
      pendingEvents,
      approvedEvents,
      rejectedEvents,
      totalRegistrations,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: "Failed to fetch admin statistics" });
  }
};

// ==============================
// GET ALL EVENTS
// ==============================
export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(events);
  } catch (error) {
    console.error("Get admin events error:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// ==============================
// APPROVE EVENT
// Only pending events can be approved
// ==============================
export const approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status !== "pending") {
      return res.status(400).json({
        message: "Only pending events can be approved",
      });
    }

    event.status = "approved";
    await event.save();

    await Notification.create({
      user: event.organizer,
      title: "Event Approved",
      message: `Your event "${event.title}" has been approved by the admin.`,
    });

    res.status(200).json({
      message: "Event approved successfully",
      event,
    });
  } catch (error) {
    console.error("Approve event error:", error);
    res.status(500).json({ message: "Failed to approve event" });
  }
};

// ==============================
// REJECT EVENT
// Only pending events can be rejected
// ==============================
export const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status !== "pending") {
      return res.status(400).json({
        message: "Only pending events can be rejected",
      });
    }

    event.status = "rejected";
    await event.save();

    await Notification.create({
      user: event.organizer,
      title: "Event Rejected",
      message: `Your event "${event.title}" has been rejected by the admin.`,
    });

    res.status(200).json({
      message: "Event rejected successfully",
      event,
    });
  } catch (error) {
    console.error("Reject event error:", error);
    res.status(500).json({ message: "Failed to reject event" });
  }
};

// ==============================
// GET ALL USERS
// ==============================
export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Get admin users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ==============================
// DELETE USER
// ==============================
export const deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// ==============================
// GET ALL ORGANIZERS
// ==============================
export const getAllOrganizersAdmin = async (req, res) => {
  try {
    const organizers = await User.find({ role: "organizer" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(organizers);
  } catch (error) {
    console.error("Get organizers error:", error);
    res.status(500).json({ message: "Failed to fetch organizers" });
  }
};

// ==============================
// BLOCK / UNBLOCK ORGANIZER
// ==============================
export const toggleOrganizerStatus = async (req, res) => {
  try {
    const organizer = await User.findOne({
      _id: req.params.id,
      role: "organizer",
    });

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    organizer.isBlocked = !organizer.isBlocked;
    await organizer.save();

    res.status(200).json({
      message: organizer.isBlocked
        ? "Organizer blocked successfully"
        : "Organizer unblocked successfully",
      isBlocked: organizer.isBlocked,
      organizer: {
        _id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        isBlocked: organizer.isBlocked,
      },
    });
  } catch (error) {
    console.error("Toggle organizer status error:", error);
    res.status(500).json({
      message: "Failed to update organizer status",
    });
  }
};

// ==============================
// DELETE ORGANIZER
// ==============================
export const deleteOrganizerAdmin = async (req, res) => {
  try {
    const organizer = await User.findOne({
      _id: req.params.id,
      role: "organizer",
    });

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    await User.findByIdAndDelete(organizer._id);

    res.status(200).json({
      message: "Organizer deleted successfully",
    });
  } catch (error) {
    console.error("Delete organizer error:", error);
    res.status(500).json({
      message: "Failed to delete organizer",
    });
  }
};

// ==============================
// GET ALL REGISTRATIONS
// ==============================
export const getAllRegistrationsAdmin = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("user", "name email")
      .populate("event", "title date location")
      .sort({ createdAt: -1 });

    res.status(200).json(registrations);
  } catch (error) {
    console.error("Get registrations error:", error);
    res.status(500).json({
      message: "Failed to fetch registrations",
    });
  }
};