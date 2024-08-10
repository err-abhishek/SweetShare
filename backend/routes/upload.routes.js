import express from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import File from "../models/file.model.js";
import dotenv from "dotenv";
import sendMail from "../services/mailService.js";
import emailTemplate from "../services/emailTemplate.js";

dotenv.config();

const router = express.Router();

// Configure multer storage options
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    // Pass the unique filename to multer's callback function
    cb(null, uniqueName);
  },
});

// Create the upload middleware with the storage options and a file size limit
let upload = multer({
  storage, // Use the defined storage configuration
  limits: { fileSize: 1000000 * 100 }, // Limit the file size to 100 MB
}).single("myfile"); // Expect a single file upload from the form field named "myfile"

// Handle file upload via a POST request to the root route
router.post("/", (req, res) => {
  // Use the upload middleware to handle the file upload
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }
    try {
      // Create a new File document in the database with details about the uploaded file
      const file = new File({
        filename: req.file.filename,
        uuid: uuidv4(),
        path: req.file.path,
        size: req.file.size,
      });
      const response = await file.save();
      // Respond with the file download link, including the unique identifier
      res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
    } catch (error) {
      // If an error occurred while saving the file to the database, respond with a 500 status
      res.status(500).send({ error: "Failed to save file" });
    }
  });
});

router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom, expiresIn } = req.body;
  if (!uuid || !emailTo || !emailFrom) {
    return res
      .status(422)
      .send({ error: "All fields are required except expiry." });
  }
  try {
    const file = await File.findOne({ uuid });
    if (file.sender) {
      return res.status(422).send({ error: "Email already sent once." });
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    await file.save();

    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: "SweetShare file sharing",
      text: `${emailFrom} shared a file with you.`,
      html: emailTemplate({
        emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
        size: parseInt(file.size / 1000) + " KB",
        expires: "24 hours",
      }),
    })
      .then(() => {
        return res.json({ success: true });
      })
      .catch((err) => {
        return res.status(500).json({ error: "Error in email sending." });
      });
  } catch (err) {
    return res.status(500).send({ error: "Something went wrong." });
  }
});

export default router;
