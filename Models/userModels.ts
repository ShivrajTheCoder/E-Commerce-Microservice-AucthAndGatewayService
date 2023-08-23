import mongoose,{Document,Schema} from "mongoose";

interface IUser extends Document{
    firstName:string;
    lastName:string;
    email:string;
    password:string;
    phoneNumber:string;
    address:string;
    isAdmin:boolean;
}

const userSchema:Schema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        minLenght:5,
    },
    password:{
        type:String,
        required:true,
        minLenght:6
    },
    phoneNumber: {
        type: String,
        minLength: 10,
        kMaxLength: 10,
    },
    address: {
        type: String,
        minLength: 10,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
})

export const User=mongoose.model<IUser>("User",userSchema);

