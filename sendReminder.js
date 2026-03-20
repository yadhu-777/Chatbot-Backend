import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,         
  secure: false,     
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    family: 4,     
  },
});
// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "yadhuKris12121@gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "yadhuKris12121@gmail.com",
//     pass: "upnsyigbfbntsvkv"
//   }
// });

export async function sendReminder(email, eventName) {
  try {
    await transporter.sendMail({
      from: "yadhuKris12121@gmail.com",
      to: email,
      subject: "Event Reminder",
      text: `Reminder: ${eventName} is starting soon!`,
    });

    console.log("Reminder email sent to:", email);

  } catch (err) {
    console.log("Email error:", err);
  }
}