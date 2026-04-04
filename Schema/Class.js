import mongoose, { Schema } from "mongoose";


const classSChema = new mongoose.Schema({
    course:String,
    url:String
})
const classModel = mongoose.model("classModel",classSChema);
export default classModel;