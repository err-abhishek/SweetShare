import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION_URL);
        console.log('Database connected !!!');
    } catch (err) {
        console.log('Connection failed !!!');
    }
}

export default connectDB;
