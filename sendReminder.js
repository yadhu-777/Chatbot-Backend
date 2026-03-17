import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,          // ✅ use 587 instead of 465
  secure: false,      // ✅ false for 587
  auth: {
    user: "yadhuKris12121@gmail.com",
    pass: "upnsyigbfbntsvkv",
  },
  tls: {
    family: 4,        // 🔥 FORCE IPv4 (THIS FIXES YOUR ERROR)
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