const express = require("express");
const controller = require("./whatsapp-webhook.controller");

const router = express.Router();

router.get("/", controller.verifyWebhook);
router.post("/", controller.receiveWebhook);

module.exports = router;