import mongoose from "mongoose";


const TeacherSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    department:{
        type:String,
    },
    position:{
        type:String
    }
    ,
    details:{
        type:String
    },
    image:{
         type:String
    }
})

const Teacher  = mongoose.model("Teacher",TeacherSchema);
export default Teacher;