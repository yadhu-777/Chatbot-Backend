import mongoose, { Schema } from "mongoose";


const complaintSchema = new mongoose.Schema({

subject:String,
description:String

});

const ComplaintModel = mongoose.model("ComplaintModel",complaintSchema);
export default ComplaintModel;