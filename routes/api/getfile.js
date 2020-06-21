const express = require("express");
const router = express.Router();
const path = require("path");
router.get("/:filename", (req, res) => {
  const { filename } = req.params;
  return res.sendFile(path.resolve("./tmp/" + filename));
});
module.exports = router;
