import mongoose, { Schema } from "mongoose";

const announcementSchema = new mongoose.Schema({
      filename: String,
      originalname: String,
      url:String,
       date: {
    type: Date,
    default: Date.now
  }
})

const annModel = mongoose.model("annModel",announcementSchema);


export default annModel;