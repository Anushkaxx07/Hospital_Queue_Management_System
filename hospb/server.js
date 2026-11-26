import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import cloudinary from "cloudinary";

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join-queue-room", (room) => {
    socket.join(room || "hospital-queue");
  });
});

const PORT = process.env.PORT || 4000;

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n❌ Port ${PORT} is already in use! Another instance of the backend is running.\nRun: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`
    );
    process.exit(1);
  } else {
    console.error("Server error:", err);
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});

const handleShutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
