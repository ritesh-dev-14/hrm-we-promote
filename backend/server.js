const app = require("./src/app");
const http = require("http");
const { setupSocketIO } = require("./src/config/socket.config");
const { setupEscalationJobs } = require("./src/jobs/escalationJobs");
const mailService = require("./src/modules/mail/mail.service");

const PORT = process.env.PORT || 8000;

// Create HTTP server for socket.io
const server = http.createServer(app);

// Setup Socket.IO
const io = setupSocketIO(server);

// Setup all escalation jobs
setupEscalationJobs(io);

server.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready at ws://localhost:${PORT}`);

  try {
    const mailStatus = await mailService.checkMailStartup();

    if (mailStatus.status === "ok") {
      console.log(
        `📧 Mail ready (${mailStatus.mode}${mailStatus.sender ? `, sender: ${mailStatus.sender}` : ""})`
      );
    } else {
      console.log(`📧 Mail startup skipped: ${mailStatus.message}`);
    }
  } catch (error) {
    console.warn(`📧 Mail startup check failed: ${error.message}`);
  }

  console.log("");
});