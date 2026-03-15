import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yadhuKris12121@gmail.com",
    pass: "upnsyigbfbntsvkv",
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