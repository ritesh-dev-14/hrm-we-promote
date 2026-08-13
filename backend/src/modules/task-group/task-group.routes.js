const express = require("express");
const router = express.Router();

// Task Group module — placeholder (not yet implemented)
router.use((req, res) => {
  res.status(501).json({
    success: false,
    message: "Task Group module is not yet implemented.",
  });
});

module.exports = router;
