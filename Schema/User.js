import mongoose from "mongoose";
import thread from "./thread.js";


const userSchema = new mongoose.Schema({
userId:{
    type:String,
    
},
Email:{
    type:String
},
thread:[thread]

});

const userThrread = mongoose.model("userThrread",userSchema);
export default userThrread;

