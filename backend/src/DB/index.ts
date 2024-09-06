import dotenv from "dotenv";
dotenv.config();
import mongoose, { now } from "mongoose";
const dburl=process.env.DB_URL as string;
mongoose.connect(dburl).then(()=>{
  console.log("mongodb connected")
}).catch((e)=>{
    console.log(e)
})
interface IUser{
  name: string;
  email: string;
  mobileno:string
};
const UserSchema=new mongoose.Schema<IUser>({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    require:true,
    unique:true
  },
  mobileno:String
});
interface Ibook{
  name: string;
  Category:string;
  rentperday:Number
};
const BookSchema=new mongoose.Schema<Ibook>({
  name:{
    type:String,
    required:true
  },
  Category:{
    type:String,
    required:true
  },
  rentperday:Number
});
interface ITransection{
    bookid:String,
    userid:String,
    issuedate:Date,
    returndate:Date
}
const TransectionSchema= new mongoose.Schema<ITransection>({
    bookid:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Book',
       required:true
    },
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true,
     },
     issuedate:{
        type:Date,
        required:true,
        default:Date.now()
     },
     returndate:{
        type:Date,
        required:false
     }
});
export const User=mongoose.model("User",UserSchema);
export const Book=mongoose.model("Book",BookSchema);
export const Transection=mongoose.model("Transection",TransectionSchema);