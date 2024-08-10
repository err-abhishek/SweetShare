import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_URL);
    console.log("Database connected !!!");
  } catch (err) {
    console.log("Connection failed !!!");
  }
}

export default connectDB; /*Using export default allows another module to import the main exported
 value without needing to know its exact name, making it a convenient and flexible way to share code.*/

/* Asynchronous operations are tasks that take time to complete and don't block the execution of other tasks. 
They allow your code to continue running while waiting for the operation to finish.*/
