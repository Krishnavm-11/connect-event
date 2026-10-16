import Event from "../models/Event.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const TIME_ZONE = "Asia/Kolkata";

const getDateKey = (date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const getTomorrowKey = () => {
  const todayKey = getDateKey(new Date());
  const [year, month, day] = todayKey.split("-").map(Number);

  const tomorrow = new Date(
    Date.UTC(year, month - 1, day + 1, 12)
  );

  return getDateKey(tomorrow);
};

const createNotificationOnce = async ({
  userId,
  event,
  type,
  title,
  message,
}) => {
  const dedupeKey = `${userId}:${event._id}:${type}`;

  try {
    await Notification.updateOne(
      { dedupeKey },
      {
        $setOnInsert: {
          user: userId,
          event: event._id,
          type,
          title,
          message,
          isRead: false,
          dedupeKey,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    // Concurrent scheduler runs may race on the unique index.
    if (error.code !== 11000) {
      throw error;
    }
  }
};

export const checkEventNotifications = async () => {
  const todayKey = getDateKey(new Date());
  const tomorrowKey = getTomorrowKey();

  const [admins, events] = await Promise.all([
    User.find({ role: "admin" }).select("_id"),
    Event.find({ status: "approved" }).select(
      "_id title date organizer status"
    ),
  ]);

  for (const event of events) {
    if (!event.date) continue;

    const eventDate = new Date(event.date);

    if (Number.isNaN(eventDate.getTime())) continue;

    const eventDayKey = getDateKey(eventDate);

    if (eventDayKey === tomorrowKey) {
      for (const adminUser of admins) {
        await createNotificationOnce({
          userId: adminUser._id,
          event,
          type: "event_reminder",
          title: "Event Tomorrow",
          message: `"${event.title}" is scheduled for tomorrow.`,
        });
      }

      if (event.organizer) {
        await createNotificationOnce({
          userId: event.organizer,
          event,
          type: "event_reminder",
          title: "Your Event Is Tomorrow",
          message: `Your event "${event.title}" is scheduled for tomorrow.`,
        });
      }
    }

    if (eventDayKey < todayKey) {
      for (const adminUser of admins) {
        await createNotificationOnce({
          userId: adminUser._id,
          event,
          type: "event_expired",
          title: "Event Expired",
          message: `The event "${event.title}" has expired.`,
        });
      }

      if (event.organizer) {
        await createNotificationOnce({
          userId: event.organizer,
          event,
          type: "event_expired",
          title: "Your Event Has Expired",
          message: `Your event "${event.title}" has expired.`,
        });
      }
    }
  }
};