const express = require("express");
const router = express.Router();

router.use("/message", require("./message"));
router.use("/getfile", require("./getfile"));
module.exports = router;
