import mongoose from "mongoose";



const msgSchema = new mongoose.Schema({

role:{
    type:String,
    enum:["User","Chatbot"],
    required:true
},
message:{
    type:String
},

UpdatedAt:{
    type:Date,
    default:Date.now
}


});

export default msgSchema;

