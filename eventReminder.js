import cron from "node-cron";
import Event from "./Schema/Event.js";
import { sendReminder } from "./sendReminder.js";

cron.schedule("* * * * *", async () => {

  console.log("Checking events...");

  const events = await Event.find({});
  const now = new Date();

  events.forEach(async (event) => {

    const eventDate = new Date(event.date);

    const diff = eventDate - now;
    const hours = diff / (1000 * 60 * 60);

    // 1 day reminder
    if (hours <= 24 && hours > 23) {
      await sendReminder(event.email, event.name);
    }

    // 1 hour reminder
    if (hours <= 1 && hours > 0) {
      await sendReminder(event.email, event.name);
    }

  });

});