const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./tmp";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + Date.now() + "." + ext);
  },
});
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    return res.json({ file: file.filename });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
