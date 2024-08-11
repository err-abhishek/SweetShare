import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from "cors";
import connectDB from "./config/db.js";
import downloadFile from "./routes/download.routes.js";
import uploadFile from "./routes/upload.routes.js";
import showFile from "./routes/show.routes.js";

// Set up environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedClients = process.env.ALLOWED_CLIENTS;

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedClients.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
// Middleware setup
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(express.json());

// Connect to the database
connectDB();

// Set up __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set view engine and views directory
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

// Route handlers
app.use("/api/files", uploadFile);
app.use("/files", showFile);
app.use("/files/download", downloadFile); 
app.get("/",(req,res)=>{
  res.send("Hi,Abhi");
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
