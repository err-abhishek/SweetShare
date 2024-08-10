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

// Middleware setup
app.use(cors());
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
