import express, { response } from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import cors from "cors";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import UserPass from "./Schema/Credentials.js";
import userThrread from "./Schema/User.js";
import jwt, { decode } from "jsonwebtoken";
const client = new OpenAI({
  apiKey: process.env.Open_key,
});
import syllabusModel from "./Schema/Syllabus.js";
import streamifier from "streamifier";
import annModel from "./Schema/accouncement.js";
import "./eventReminder.js";
import ComplaintModel from "./Schema/Complaint.js";
import bcrypt from "bcrypt";
import Teacher from "./Schema/Teacher.js";
import { OAuth2Client } from "google-auth-library";
const Client = new OAuth2Client(process.env.CLIENT_ID);
import Event from "./Schema/Event.js";
import multer from "multer";
import highlight from "./Schema/Highlight.js";

import { v2 as cloudinary } from "cloudinary";
import classModel from "./Schema/Class.js";
cloudinary.config({
  cloud_name: process.env.Cloud_nane,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});
import NoticeModel from "./Schema/Notice.js";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
app.set("trust proxy", 1);
const origin = [
  "http://localhost:5173",
  "https://chatbot-frontend-orcin-ten.vercel.app",
];

app.use(
  cors({
    origin,
    credentials: true,

    preflightContinue: false,
  }),
);
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/admin/users-analytics", async (req, res) => {
  try {
    const users = await userThrread.find({});
 
    // Total users
    const totalUsers = users.length;
 
    // Total threads across all users
    const totalThreads = users.reduce((sum, u) => sum + (u.thread?.length || 0), 0);
 
    // Per-user data for table + bar chart
    const userData = users.map((u) => ({
      email: u.Email,
      userId: u.userId,
      threadCount: u.thread?.length || 0,
    }));
 
    // Group users joined by month using _id (ObjectId contains timestamp)
    const monthMap = {};
    users.forEach((u) => {
      const date = u._id.getTimestamp();           // extract date from ObjectId
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
 
    const joinedByMonth = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
 
    return res.json({
      totalUsers,
      totalThreads,
      userData,
      joinedByMonth,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
app.post("/pdf2", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "syllabus",
            resource_type: "raw", // for PDF
            public_id: Date.now().toString(),
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );

        stream.end(req.file.buffer);
      });
    };

    const result = await streamUpload();

    const newAnn = new syllabusModel({
      filename: result.public_id,
      originalname: req.file.originalname,
      url: result.secure_url, // ✅ correct URL
    });

    await newAnn.save();

    res.json({
      message: "Uploaded to Cloudinary ✅",
      url: result.secure_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/syllabus", async (req, res) => {
  try {
    const data = await syllabusModel.find().sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/pdf2/:id", async (req, res) => {
  try {
    const deleted = await syllabusModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ message: "Deleted from DB ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/addNotice", upload.single("image"), async (req, res) => {
  try {
  const {name} = req.body;

    if (!req.file) {
      return res.json({ message: "No file uploaded" });
    }

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "notice" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    await NoticeModel.create({
    
      image: result.secure_url,
    });

    res.json({ message: "Image Added Successfully" });
  } catch (err) {
    res.json({ message: err.message });
  }
});
app.post("/addImage", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;

    if (!req.file) {
      return res.json({ message: "No file uploaded" });
    }

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "college" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    await highlight.create({
      name: name,
      image: result.secure_url,
    });

    res.json({ message: "Image Added Successfully" });
  } catch (err) {
    res.json({ message: err.message });
  }
});
app.post("/getNotice", async (req, res) => {
  try {
    const getHighlight = await NoticeModel.find({});
    if (!getHighlight) {
      return res.json({ message: "Error during fetch" });
    }
    return res.json({ message: getHighlight });
  } catch (err) {
    return res.json({ message: err.message });
  }
});
app.post("/delNotice", async (req, res) => {
  try {
    const { id } = req.body;
    const delHighlight = await NoticeModel.deleteOne({ image: id });
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.json({ message: err.message });
  }
});

app.post("/addclass", upload.single("image"), async (req, res) => {
  const { name } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "college" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(req.file.buffer);
    });

    const add = new classModel({
      course: name,
      url: result.secure_url,
    });

    await add.save();

    res.json({ message: "Image Added", data: add });
  } catch (err) {
    console.error(err); // 🔥 VERY IMPORTANT
    res.status(500).json({ error: err.message });
  }
});

app.delete("/pdf/:id", async (req, res) => {
  try {
    const deleted = await annModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ message: "Deleted from DB ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "announcements",
            resource_type: "raw", // for PDF
            public_id: Date.now().toString(),
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );

        stream.end(req.file.buffer);
      });
    };

    const result = await streamUpload();

    const newAnn = new annModel({
      filename: result.public_id,
      originalname: req.file.originalname,
      url: result.secure_url,
    });

    await newAnn.save();

    res.json({
      message: "Uploaded to Cloudinary ✅",
      url: result.secure_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/announcements", async (req, res) => {
  try {
    const data = await annModel.find().sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/classSpec", async (req, res) => {
  try {
    const { course } = req.body;
    console.log(course);
    const data = await classModel.find({ course: course });
    res.json({ data: data });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/class", async (req, res) => {
  try {
    const data = await classModel.find({});
    res.json({ data: data });
  } catch (err) {
    res.status(500).send("Error fetching news");
  }
});
app.get("/news", async (req, res) => {
  try {
    const response = await fetch(
      "https://news.google.com/rss/search?q=Bengaluru+North+University+OR+Bangalore+college+latest+news&hl=en-IN&gl=IN&ceid=IN:en",
    );
    const text = await response.text();

    res.send(text);
  } catch (err) {
    res.status(500).send("Error fetching news");
  }
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // ✅ use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ✅ app password
  },
  family: 4, // ✅ FORCE IPv4 (fixes ENETUNREACH)
});
transporter.verify((error, success) => {
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Server is ready to send mail");
  }
});
app.post("/complaint", upload.single("image"), async (req, res) => {
  try {
    const { subject, description } = req.body;

    // ✅ Validation
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!subject || !description) {
      return res.status(400).json({
        message: "Subject and description are required",
      });
    }

    // ✅ 1. Upload image to Cloudinary
    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "college" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    // ✅ 2. Save to DB
    const newComplaint = new ComplaintModel({
      subject,
      description,
      image: result.secure_url,
    });

    await newComplaint.save();

    // ✅ 3. Send email in background (Resend)
    resend.emails
      .send({
        from: "onboarding@resend.dev", // 🔥 use this for testing
        to: process.env.EMAIL_USER,
        subject: `New Complaint: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #0d1b2e;">New Complaint Registered</h2>

            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>

            <div style="margin-top: 20px;">
              <p><strong>Image:</strong></p>
              <img src="${result.secure_url}" style="max-width: 100%;" />
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: gray;">
              Auto-generated email
            </p>
          </div>
        `,
      })
      .catch((err) => {
        console.error("Email failed:", err);
      });

    // ✅ 4. Send response ONLY ONCE
    return res.status(200).json({
      message: "Registered Successfully",
      subject,
    });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
});
app.get("/checkAuth", (req, res) => {
  const token = req.cookies.auth2;

  if (!token) {
    return res.json({ logged: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      role: decoded.role,
      email: decoded.email,
    });
  } catch (err) {
    res.json({ logged: false });
  }
});

app.post("/highlightDelete", async (req, res) => {
  try {
    const { id } = req.body;
    const delHighlight = await highlight.deleteOne({ _id: id });
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.json({ message: err.message });
  }
});

app.post("/getHighlight", async (req, res) => {
  try {
    const getHighlight = await highlight.find({});
    if (!getHighlight) {
      return res.json({ message: "Error during fetch" });
    }
    return res.json({ message: getHighlight });
  } catch (err) {
    return res.json({ message: err.message });
  }
});

// app.post("/addImage", upload.single("image"), async (req, res) => {
//   try {
//     const { name } = req.body;

//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: "college",
//     });

//     await highlight.create({
//       name: name,

//       image: result.secure_url,
//     });

//     res.json({ message: "image Added" });
//   } catch (err) {
//     res.json({ message: err.message });
//   }
// });

app.post("/deleteEvent", async (req, res) => {
  try {
    const { id } = req.body;
    const delEvent = await Event.deleteOne({ _id: id });
    if (!delEvent) {
      return res.json({ message: "Error While Deleting" });
    }
    res.json({ message: "Deleted Successfullt" });
  } catch (err) {
    res.json({ message: err.message });
  }
});

app.post("/getEvent", async (req, res) => {
  try {
    const getEvent = await Event.find({});
    if (!getEvent) {
      return res.json({ message: "Error Ocurred" });
    }
    return res.json({ message: getEvent });
  } catch (err) {
    return res.json({ message: err });
  }
});

app.post("/addEvent", upload.single("image"), async (req, res) => {
  try {
    const { name, date, details } = req.body;

    if (!req.file) {
      return res.json({ message: "No file uploaded" });
    }

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "college" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    const addEvent = new Event({
      name,
      date,
      details,
      image: result.secure_url,
    });

    await addEvent.save();

    return res.json({ message: "Event Added Successfully" });
  } catch (err) {
    return res.json({ message: err.message });
  }
});

app.post("/deleteTeacher", async (req, res) => {
  try {
    const { id } = req.body;
    const del = await Teacher.deleteOne({ _id: id });
    if (!del) {
      return res.json({ message: "not found" });
    }
    return res.json({ message: "deleted" });
  } catch (err) {
    return res.json({ message: err.message });
  }
});
app.post("/getTeacher1", async (req, res) => {
  const teacherDetails = await Teacher.find({});
  if (!teacherDetails) {
    return res.json({ message: "No Teacher Added" });
  }
  return res.json({ message: teacherDetails });
});

app.post("/getTeacher", async (req, res) => {
  const { course } = req.body;
  const teacherDetails = await Teacher.find({ department: course });
  if (!teacherDetails) {
    return res.json({ message: "No Teacher Added" });
  }
  return res.json({ message: teacherDetails });
});

app.post("/addTeacher", upload.single("image"), async (req, res) => {
  const { name, position, description, department } = req.body;

  try {
    if (!req.file) {
      return res.json({ message: "No file uploaded" });
    }

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "college" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    const AddTeacher = new Teacher({
      name,
      department,
      position,
      details: description,
      image: result.secure_url,
    });

    await AddTeacher.save();

    res.json({ message: "Added Teacher Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/auth2", async (req, res) => {
  try {
    const token = req.cookies.auth2;

    if (!token) {
      return res.json({ message: "not logged in" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.json({ message: "Authentication success" });
  } catch (err) {
    return res.json({ message: "not logged in" });
  }
});

app.post("/data", async (req, res) => {
  res.clearCookie("auth2", { path: "/" });
  res.clearCookie("auth2", { path: "/admin" });
  res.clearCookie("auth2", { path: "/home" });
  res.clearCookie("auth2", { path: "/student" });
  const { email, password } = req.body.content;
  const find = await UserPass.findOne({ email: email });

  if (!find) {
    return res.status(404).json({ message: "Not Registered" });
  }

  const match = await bcrypt.compare(password, find.password);
  if (match) {
    const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("auth2", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ message: "Authentication Success" });
  } else {
    return res.json({ message: "Email or Password is wrong" });
  }
});

app.delete("/delcookie", async (req, res) => {
  const cookie = req.cookies.auth;
  try {
    res.clearCookie("auth", {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      path: "/",
    });
    return res.json({ message: "logged out" });
  } catch (err) {
    return res.json({ message: err });
  }
});

app.post("/delThread", async (req, res) => {
  const { userId, idd } = req.body;
  console.log(userId, idd);
  if (!userId || !idd) {
    return res.status(400).json({ message: "Missing data" });
  }
  try {
    const user = await userThrread.findOne({ Email: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await userThrread.updateOne(
      { Email: userId },
      { $pull: { thread: { threadId: idd } } },
    );
    return res.status(200).json({ message: "deleted" });
  } catch (err) {
    return res.send({ message: err });
  }
});

app.post("/vauth", async (req, res) => {
  res.clearCookie("auth2", { path: "/" });
  res.clearCookie("auth2", { path: "/admin" });
  res.clearCookie("auth2", { path: "/home" });
  res.clearCookie("auth2", { path: "/student" });
  const { tknId } = req.body;
  const idToken = tknId;
  try {
    const verify = await Client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = verify.getPayload();
    const name = payload.name;
    const email = payload.email;

    const userFind = await userThrread.findOne({ Email: email });
    if (userFind) {
      const token = jwt.sign(
        { email, name, role: "student" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      res.cookie("auth2", token, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.send({ mesage: "ok", name: name, email: email });
    }
    const Threds = new userThrread({
      userId: uuidv4(),
      Email: email,
    });
    await Threds.save();
    let ids = Threds.userId;
    const token = jwt.sign(
      { email, name, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("auth2", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.send({
      mesage: "ok",
      name: name,
      email: email,
      thrid: Threds.userId,
    });
  } catch (err) {
    console.log(err);
  }
});
// app.post("/verify",async(req,res)=>{
//   const cookie = req.cookies.auth;

// try{
//  if(cookie){
//    const decoded = jwt.verify(
//     cookie,
//       process.env.JWT_SECRET
//   )

//   return  res.json({message:`hi ${decoded.name}`,content:decoded})
//  }

//  if(!cookie){
// return res.json({message:"loggin to your account"})
//   }

// }catch(err){
//   return res.send({message:"verification error "})
// }
// })

app.post("/fetchChat", async (req, res) => {
  const { ThreadId, userId } = req.body;
  if (userId) {
    const UserData = await userThrread.findOne(
      { Email: userId, "thread.threadId": ThreadId },
      {
        thread: { $elemMatch: { threadId: ThreadId } },
      },
    );

    res.send({ recData: UserData });
  } else {
    res.status(500);
  }
});

app.post("/threads", async (req, res) => {
  const { userId } = req.body;

  try {
    const Threadval = await userThrread.aggregate([
      { $match: { Email: userId } },
      { $unwind: "$thread" },
      { $sort: { "thread.UpdatedAt": -1 } },
    ]);

    res.json({ threads: Threadval });
  } catch (err) {
    console.log("err", err);
  }
});

app.post("/config", async (req, res) => {
  const { inp, threadID, userId } = req.body;
  console.log("inp:", inp);
  console.log("threadID:", inp);
  console.log("inp:", inp);
  let th = threadID;

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: inp,
  });

  if (threadID && userId) {
    const UplUser = await userThrread.updateOne(
      { Email: userId, "thread.threadId": threadID },

      {
        $push: {
          "thread.$.messages": {
            $each: [
              { role: "User", message: inp },
              { role: "Chatbot", message: response.output_text },
            ],
          },
        },
        $set: {
          "thread.$.UpdatedAt": new Date(),
        },
      },
    );
    return res.json({ message: response.output_text, thrId: th });
  } else {
    const response2 = await client.responses.create({
      model: "gpt-4o-mini",
      input: `Generate a 3–5 word chat title summarizing this message.
No quotes. No punctuation. ${inp}`,
    });

    const UplUser = await userThrread.findOne({ Email: userId });
    const threadId = uuidv4();
    UplUser.thread.push({
      threadId,
      title: response2.output_text,
      messages: [
        { role: "User", message: inp },
        { role: "Chatbot", message: response.output_text },
      ],
      UpdatedAt: new Date(),
    });

    await UplUser.save();

    return res.json({ message: response.output_text, thrId: threadId });
  }
});
function connect() {
  mongoose
    .connect(process.env.mongo)
    .then(() => console.log("connecteed to DB"))
    .catch((err) => console.log(err));
}

app.listen(3000, () => {
  console.log("server started");
  connect();
});
