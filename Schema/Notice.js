import mongoose, { Schema } from "mongoose";


const NoticeSchema = new mongoose.Schema({
  name:String,
    image:String
})
const NoticeModel = mongoose.model("NoticeModel",NoticeSchema);
export default NoticeModel;