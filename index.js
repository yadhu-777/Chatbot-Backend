import express, { response } from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import cookieParser  from"cookie-parser";
import UserPass from "./Schema/Credentials.js"; 
import userThrread from "./Schema/User.js";
import jwt, { decode } from "jsonwebtoken";  
const client = new OpenAI({
    apiKey:process.env.Open_key
});
import bcrypt  from "bcrypt";
import Teacher from "./Schema/Teacher.js";
import { OAuth2Client } from"google-auth-library";
const Client = new OAuth2Client(process.env.CLIENT_ID);
import Event from "./Schema/Event.js";
import multer from "multer";
import highlight from "./Schema/Highlight.js";
const upload = multer({ dest: "uploads/",
    limits: { fileSize: 5 * 1024 * 1024 }
 });
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dke8pn6li",
  api_key: "375113638191244",
  api_secret: "a89V5YKQtwu9lpWtyZFKQVojEs8"
});


app.set("trust proxy", 1);
const origin = [
  "http://localhost:5173",
  "https://chatbot-frontend-orcin-ten.vercel.app"
];
app.use(cors({
 origin,
  credentials: true,

  preflightContinue: false,

}));

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.post("/highlightDelete",async(req,res)=>{
 try{
   const{id} = req.body;
  const delHighlight = await highlight.deleteOne({_id:id});
  return res.json({message:"Deleted"});
 }catch(err){
   return res.json({message:err.message});
 }
})


app.post("/getHighlight",async(req,res)=>{
  try{
    const getHighlight = await highlight.find({});
    if(!getHighlight){
      return res.json({message:"Error during fetch"})
    }
    return res.json({message:getHighlight});
  }catch(err){
return res.json({message:err.message})
  }
})


app.post("/addImage", upload.single("image"), async (req,res)=>{
 try{

  const {name} = req.body;

   const result = await cloudinary.uploader.upload(req.file.path,{
    folder:"college"
  });


  await highlight.create({
    name:name,
   
   
    image:result.secure_url
  });

  res.json({message:"image Added"});

 }
 catch(err){
  res.json({message:err.message});
 }
});



app.post("/deleteEvent",async(req,res)=>{
 try{
   const {id}  = req.body;
  const delEvent = await Event.deleteOne({_id:id});
  if(!delEvent){
    return res.json({message:"Error While Deleting"})
  }
  res.json({message:"Deleted Successfullt"});
 }catch(err){
   res.json({message:err.message});
 }
})

app.post("/getEvent",async(req,res)=>{
 try{
   const getEvent = await Event.find({});
  if(!getEvent){
     return res.json({message:"Error Ocurred"});
  }
  return res.json({message:getEvent});
 }catch(err){
   return res.json({message:err});
 }
})


app.post("/addEvent",async(req,res)=>{
 try{
   const{name,date,details} = req.body.data;
 const addEvent = new Event({
  name:name,
  date:date,
  details:details
 });
 await addEvent.save();
 return res.json({message:"Event Added Successfully"})
 }
 catch(err){
  return res.json({message:err});
 }
})

app.post("/deleteTeacher",async(req,res)=>{
 try{
   const {id} = req.body;
  const del = await Teacher.deleteOne({_id:id});
  if(!del){
     return res.json({message:"not found"});
  }
  return res.json({message:"deleted"});
 }
 catch(err){
   return res.json({message:err.message});
 }

})


app.post("/getTeacher",async(req,res)=>{
const teacherDetails = await  Teacher.find({});
if(!teacherDetails){
  return res.json({message:"No Teacher Added"})
}
return res.json({message:teacherDetails})
})

app.post("/addTeacher",upload.single("image"),async(req,res)=>{
  const{name,position,description} = req.body;

  try{
     const result = await cloudinary.uploader.upload(req.file.path,{
    folder:"college"
  });
    const AddTeacher = new Teacher({
    name:name,
    position:position,
    details:description,
    image:result.secure_url
  });
  await AddTeacher.save();
  res.json({message:"added Teacher"})
  }catch(err){
    res.status(401).json({message:err});
  }
})

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

app.post("/data",async(req,res)=>{
 const{email,password} = req.body.content;
const find = await UserPass.findOne({email:email});

if(!find){
 return  res.status(404).json({message:"Not Registered"})
}

  const match = await bcrypt.compare(password, find.password);
  if(match){
    const token = jwt.sign(
   {email} ,        
  process.env.JWT_SECRET, 
  { expiresIn: "7d" }   
);

  res.cookie("auth2", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  partitioned: true
});
 return  res.json({message:"Authentication Success"});

  }else
    {
  return res.json({message:"Email or Password is wrong"})
  

}


 

 
})

app.delete("/delcookie",async(req,res)=>{
  const cookie = req.cookies.auth;
  try{
   
res.clearCookie("auth",{
   secure: true,  
httpOnly:true,
  sameSite: "none", 
    path: "/",
})
return res.json({message:"logged out"})
    
  }catch(err){
    return res.json({message:err})
  }
})

app.post("/delThread",async(req,res)=>{
  
 const {userId,idd} = req.body;
 console.log(userId,idd)
   if (!userId || !idd) {
      return res.status(400).json({ message: "Missing data" });
    }
try {

    const user = await userThrread.findOne({ Email:userId });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await userThrread.updateOne(
      { Email: userId },
      { $pull: { thread: { threadId: idd } } }
    );
    return res.status(200).json({ message: "deleted" });
}catch(err){
   return res.send({message:err});
}
  

})


app.post("/vauth",async(req,res)=>{
  
  const {tknId} = req.body;
  const idToken = tknId;
  try{
const verify = await Client.verifyIdToken({
      idToken,
    audience: process.env.CLIENT_ID
})
  const payload = verify.getPayload();
  const name = payload.name;
  const email = payload.email;
 

const userFind = await userThrread.findOne({Email:email});
if(userFind){
const token = jwt.sign(
   {email,name} ,        
  process.env.JWT_SECRET, 
  { expiresIn: "7d" }   
);

  res.cookie("auth",token,{
 secure: true,  
httpOnly:true,
  sameSite: "none",   
   maxAge: 7 * 24 * 60 * 60 * 1000
  })
return res.send({mesage:"ok",name:name,email:email});
 
}
  const Threds = new userThrread({
    userId:uuidv4(),
    Email:email
  });
  await Threds.save();
  let ids = Threds.userId;
 const token = jwt.sign(
  {email,name} ,        
  process.env.JWT_SECRET, 
  { expiresIn: "7d" }   
);

  res.cookie("auth",token,{
  httpOnly: true,
  secure:true ,
  sameSite: "none",   
       maxAge: 7 * 24 * 60 * 60 * 1000
  })
return res.send({mesage:"ok",name:name,email:email,thrid:Threds.userId})
  }catch(err){
    console.log(err)
  }

})
app.post("/verify",async(req,res)=>{
  const cookie = req.cookies.auth;
  
try{
 if(cookie){
   const decoded = jwt.verify(
    cookie,
      process.env.JWT_SECRET
  )
  

  return  res.json({message:`hi ${decoded.name}`,content:decoded})
 }

 if(!cookie){
return res.json({message:"loggin to your account"})
  }
 
  
}catch(err){
  return res.send({message:"verification error "})
}
})

app.post("/fetchChat",async(req,res)=>{
  const {ThreadId,userId} = req.body;
if(userId){
  

   const UserData = await userThrread.findOne(
    { Email:userId,
       "thread.threadId":ThreadId
    },
     {
    thread: { $elemMatch: { threadId: ThreadId } }
  }
   )
  
res.send({recData:UserData})
}else{
    res.status(500);
}

})

app.post("/threads",async(req,res)=>{
  const{userId} = req.body;
  
  try{
const Threadval = await userThrread.aggregate([
  { $match: { Email: userId } },
  { $unwind: "$thread" },
  { $sort: { "thread.UpdatedAt": -1 } },
 
]);

 
   res.json({threads:Threadval});
  }catch(err){
console.log("err",err)
  }
 
})

app.post("/config",async(req,res)=>{
 const {inp,threadID,userId} = req.body;
 
let th = threadID;

const response = await client.responses.create({
  model: "gpt-4o-mini",
  input: inp,
});


if(threadID && userId){

const UplUser = await userThrread.updateOne(
{ Email:userId,
   "thread.threadId":threadID},
 
   { $push: {
      "thread.$.messages": {
        $each: [
          { role: "User", message: inp },
          { role: "Chatbot", message: response.output_text }
        ]
      }
    },
      $set: {
      "thread.$.UpdatedAt": new Date()
    }
    }
)
return res.json({message:response.output_text,thrId:th})

}else{
  

  
    const response2 = await client.responses.create({
  model: "gpt-4o-mini",
  input: `Generate a 3–5 word chat title summarizing this message.
No quotes. No punctuation. ${inp}`,
});


const UplUser = await userThrread.findOne({Email:userId});
const threadId =  uuidv4();
UplUser.thread.push({
  threadId,
  title:response2.output_text,
  messages: [
    { role: "User", message: inp },
    { role: "Chatbot", message: response.output_text }
  ],
  UpdatedAt: new Date()
});

await UplUser.save();



return res.json({message:response.output_text,thrId:threadId})

}

})
function connect(){
  mongoose.connect(process.env.mongo)
  .then(()=>console.log("connecteed to DB"))
  .catch((err)=>console.log(err))
};



app.listen(3000,()=>{
    console.log("server started");
    connect();
})


