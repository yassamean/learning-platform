import multer from "multer";
import path from "path";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define storage for the files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replaceAll(" ", "-")}`);
  },
});

const upload = multer({ storage });

export const uploadFile = (req, res) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  // Upload function to handle single file upload
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.json({
      message: "File uploaded successfully",
      filePath: `${baseUrl}/uploads/${req.file.filename}`,
    });
  });
};

export const deleteFile = (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "File deletion failed.", details: err.message });
    }
    res.json({ message: "File deleted successfully." });
  });
};
