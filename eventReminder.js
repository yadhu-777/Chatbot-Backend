import cron from "node-cron";
import Event from "./Schema/Event.js";
import userThrread from "./Schema/User.js";
import { sendReminder } from "./sendReminder.js";
cron.schedule("*/20 * * * *", async () => {
  console.log("Checking events every 20 minutes...");

  const events = await Event.find({});
  const users = await userThrread.find({}); // all users
  const now = new Date();

  for (const event of events) {
    const eventDate = new Date(event.date);
    const diff = eventDate - now;
    const hours = diff / (1000 * 60 * 60);

    // ✅ 1 DAY BEFORE
    if (hours <= 24 && hours > 0 && !event.reminder1DaySent) {
      console.log("Sending 1 day reminder...");

      for (const user of users) {
        await sendReminder(
          user.Email,
          `${event.name} is happening tomorrow!`
        );
      }

      event.reminder1DaySent = true;
      await event.save();
    }

    // ✅ 1 HOUR BEFORE
    if (hours <= 1 && hours > 0 && !event.reminder1HourSent) {
      console.log("Sending 1 hour reminder...");

      for (const user of users) {
        await sendReminder(
          user.Email,
          `${event.name} starts in 1 hour!`
        );
      }

      event.reminder1HourSent = true;
      await event.save();
    }
  }
});