// import { connection } from "mongoose";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


// console.log(process.env.MONGODB_URL)

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST:${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("Mongodb connection error",error);
        throw error
        
    }
}

export default connectDB










































// always use try catch 

// db is always in another content {so this is time consumign 
// so use async await }

