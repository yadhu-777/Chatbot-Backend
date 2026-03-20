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
  family: 4, // 🔥 FORCE IPv4
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
       html: `
      <h2>📅 Event Reminder</h2>
      <p>${eventName} is starting soon!</p>
      
      <img 
        src="https://res.cloudinary.com/dke8pn6li/image/upload/v1773981223/WhatsApp_Image_2026-03-20_at_10.01.23_AM_dmyvxy.jpg" 
        alt="Event Image"
        style="width:300px;border-radius:10px;margin-top:10px;"
      />
    `,
    });

    console.log("Reminder email sent to:", email);

  } catch (err) {
    console.log("Email error:", err);
  }
}