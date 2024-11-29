const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 9000;

app.use(express.json());

// Update the multer upload function

// Update the multer storage destination function
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { siteId } = req.params;
        if (!siteId) {
            return cb(new Error("siteId is required"));
        }
        const siteDir = path.join(__dirname, "uploads", siteId);
        fs.mkdir(siteDir, { recursive: true }, (err) => {
            if (err) {
                return cb(err);
            }
            cb(null, siteDir);
        });
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

// Update your route to include the siteId parameter
app.post("/images/:siteId", upload.single("file"), (req, res) => {
    const { siteId } = req.params;
    if (!siteId) {
        return res.status(400).json({ error: "siteId is required" });
    }
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.status(200).json({ url: `images/${siteId}/${req.file.filename}` });
});


app.delete("/images/:siteId/:filename", (req, res) => {
    const { siteId, filename } = req.params;
    const filePath = path.join(__dirname, "uploads", siteId, filename);
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
