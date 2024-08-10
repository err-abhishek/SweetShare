import express from "express";
import File from "../models/file.model.js";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.render("download", { error: "Link has been expired" });
    }
    const filePath = path.join(__dirname, "..", file.path);
    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

export default router;

/*fileURLToPath is a function from the url module in Node.js that converts a file URL to a file system path.

Here's a breakdown:

- fileURL: A URL that starts with file://, representing a file on the local file system.
- ToPath: Converts the file URL to a file system path, which can be used with Node.js file system functions.

Example:

import { fileURLToPath } from "url";
const fileUrl = new URL('file:///Users/username/Documents/file.txt');
const filePath = fileURLToPath(fileUrl);
console.log(filePath); // Output: /Users/username/Documents/file.txt*/
