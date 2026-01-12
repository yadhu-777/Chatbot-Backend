import express, { response } from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import cookieParser  from"cookie-parser";

import userThrread from "./Schema/User.js";
import jwt from "jsonwebtoken";  
const client = new OpenAI({
    apiKey:process.env.Open_key
});
import { OAuth2Client } from"google-auth-library";
const Client = new OAuth2Client(process.env.CLIENT_ID);

app.use(cors({
  origin:"https://chatbot-frontend-orcin-ten.vercel.app",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended:true}))

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
  

  return  res.json({message:`hii ${decoded.name}`,content:decoded})
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

UplUser.thread.push({
  threadId: uuidv4(),
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


