import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema({
    name:String,
    description:String,
    image:String
});

const highlight  = mongoose.model("highlight",highlightSchema);
export default highlight;