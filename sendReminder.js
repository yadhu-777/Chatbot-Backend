import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yourgmail@gmail.com",
    pass: "your-app-password",
  },
});

export async function sendReminder(email, eventName) {
  try {
    await transporter.sendMail({
      from: "yourgmail@gmail.com",
      to: email,
      subject: "Event Reminder",
      text: `Reminder: ${eventName} is starting soon!`,
    });

    console.log("Reminder email sent to:", email);

  } catch (err) {
    console.log("Email error:", err);
  }
}