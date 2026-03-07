import mongoose from "mongoose";


const CredentialSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})


 const UserPass = mongoose.model("UserPass",CredentialSchema);
 export default UserPass;