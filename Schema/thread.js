import mongoose from "mongoose";
import msgSchema from "./msgSchema.js";


const thread = new mongoose.Schema({
    threadId:{
        type:String,
        required:true
    },
    title:{
        type:String,
        default:"new chat"

    },
    messages:[msgSchema],

    createdAt:{
        type:Date,
        default:Date.now
    },
    UpdatedAt:{
    type:Date,
    default:Date.now
}
});

export default thread;
