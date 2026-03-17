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
   image:{
    type:String
   }
   , reminder1DaySent: {
    type: Boolean,
    default: false,
  },

  reminder1HourSent: {
    type: Boolean,
    default: false,
  },
})

const Event  = mongoose.model("Event",EventSchema);
export default Event;