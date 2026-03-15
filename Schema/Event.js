import mongoose from "mongoose";


const EventSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    date:{
        type:Date
    }
    ,
    details:{
        type:String
    },
    email:String
})

const Event  = mongoose.model("Event",EventSchema);
export default Event;