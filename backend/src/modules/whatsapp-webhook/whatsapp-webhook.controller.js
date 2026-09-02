const crypto = require("crypto");
const messageLoggingService = require("../../services/messageLoggingService");

const verifySignature = (req) => {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return true;

  const signature = req.get("X-Hub-Signature-256") || "";
  const expected = `sha256=${crypto
    .createHmac("sha256", appSecret)
    .update(req.rawBody || Buffer.from(""))
    .digest("hex")}`;

  return signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

const handleIncomingMessage = (message) => {
  const text = message.text?.body || "";
  console.log("Incoming WhatsApp message:", {
    from: message.from,
    messageId: message.id,
    messageType: message.type,
    messageText: text,
    timestamp: message.timestamp,
  });
};

const handleStatus = async (status) => {
  const statusMap = {
    sent: "SENT",
    delivered: "DELIVERED",
    read: "READ",
    failed: "FAILED",
  };
  const mappedStatus = statusMap[status.status];
  if (!mappedStatus) return;

  const failureReason = status.errors?.map((error) => error.title || error.message || error.code).join(", ") || null;
  await messageLoggingService.updateMessageStatusByMetaId(
    status.id,
    mappedStatus,
    failureReason
  );
};

const processWebhookPayload = async (payload) => {
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};

      for (const message of value.messages || []) {
        handleIncomingMessage(message);
      }

      for (const status of value.statuses || []) {
        try {
          await handleStatus(status);
        } catch (error) {
          console.error("WhatsApp webhook status handling failed:", error.message);
        }
      }
    }
  }
};

exports.verifyWebhook = (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && verifyToken && token === verifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

exports.receiveWebhook = (req, res) => {
  if (!verifySignature(req)) {
    return res.sendStatus(403);
  }

  res.sendStatus(200);
  setImmediate(() => {
    processWebhookPayload(req.body).catch((error) => {
      console.error("WhatsApp webhook processing failed:", error.message);
    });
  });
};