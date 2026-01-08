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
  origin:[
    "https://chatbot-frontend-orcin-ten.vercel.app/"  ],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.delete("/delThread",async(req,res)=>{
 const {userId,idd} = req.body;
 console.log(userId,idd)
  const del = await userThrread.updateOne(
    {userId:userId},
    {
      $pull:{
        thread:{
threadId:idd

        }
      }
    }

  );
  
  res.send({message:"deleted"});
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
  { name,email },        
  process.env.JWT_SECRET, 
  { expiresIn: "7d" }   
);

  res.cookie("auth",token,{
 secure: true,    
  sameSite: "lax",   
  path: "/",     
  })
 res.send({mesage:"ok",name:name,email:email});
 return
}


  const Threds = new userThrread({
    userId:uuidv4(),
    Email:email
  });
  await Threds.save();
  let ids = Threds.userId;
 const token = jwt.sign(
  { name,email },        
  process.env.JWT_SECRET, 
  { expiresIn: "7d" }   
);

  res.cookie("auth",token,{
 secure: true,    
  sameSite: "lax",   
  path: "/",     
  })
 res.send({mesage:"ok",name:name,email:email,thrid:Threds.userId})
  }catch(err){
    console.log(err)
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
  console.log(userId)
  try{
const Threadval = await userThrread.aggregate([
  { $match: { Email: userId } },
  { $unwind: "$thread" },
  { $sort: { "thread.UpdatedAt": -1 } },
 
]);

  console.log(Threadval)
   res.send({threads:Threadval});
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

    const response2 = await client.responses.create({
  model: "gpt-4o-mini",
  input: `generate a short title for ${inp}`,
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


}else{
  


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





}
res.send({message:response.output_text,thrId:th})
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


