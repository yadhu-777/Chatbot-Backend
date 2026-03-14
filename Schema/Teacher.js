import mongoose from "mongoose";


const TeacherSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    position:{
        type:String
    }
    ,
    details:{
        type:String
    },
    image:String
})

const Teacher  = mongoose.model("Teacher",TeacherSchema);
export default Teacher;