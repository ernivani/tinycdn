const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 9000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

app.post("/images", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.status(200).json({ url: `images/${req.file.filename}` });
});

app.delete("/images/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: "File not found" });
        }
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                return res.status(500).json({ error: "Failed to delete file" });
            }
            res.status(200).json({ message: "File deleted successfully" });
        });
    });
});

app.use("/images", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => {
    console.log(`CDN Server is running on http://localhost:${port}`);
});
