const app = require("./src/app");
const http = require("http");
const { setupSocketIO } = require("./src/config/socket.config");
const { setupEscalationJobs } = require("./src/jobs/escalationJobs");

const PORT = process.env.PORT || 8000;

// Create HTTP server for socket.io
const server = http.createServer(app);

// Setup Socket.IO
const io = setupSocketIO(server);

// Setup all escalation jobs
setupEscalationJobs(io);

server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready at ws://localhost:${PORT}\n`);
});