import mongoose, { Schema } from "mongoose";

const syllabusSchema = new mongoose.Schema({
      filename: String,
      originalname: String,
      url:String,
       date: {
    type: Date,
    default: Date.now
  }
})

const syllabusModel = mongoose.model("syllabusModel",syllabusSchema);


export default syllabusModel;