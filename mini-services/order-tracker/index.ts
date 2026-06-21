import { createServer, IncomingMessage } from "http";
import { Server, Socket } from "socket.io";

// HTTP webhook server on port 3004 — receives POST /broadcast from Next.js API routes
const webhookServer = createServer((req: IncomingMessage, res: any) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { event, room, payload } = data;

        if (room) {
          io.to(room).emit(event, payload);
          console.log(`📡 Broadcasted "${event}" to room "${room}"`);
        } else {
          io.emit(event, payload);
          console.log(`📡 Broadcasted "${event}" to all clients`);
        }

        // Also notify admin dashboards globally
        io.to("admin").emit("admin:order-updated", { event, room, payload });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (e: any) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        connections: io.engine.clientsCount,
        uptime: process.uptime(),
      })
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

const WEBHOOK_PORT = 3004;
webhookServer.listen(WEBHOOK_PORT, "0.0.0.0", () => {
  console.log(`📬 Webhook server: http://0.0.0.0:${WEBHOOK_PORT}`);
});

// Socket.io server on port 3003 — clients connect here via Caddy
const ioServer = createServer();
const io = new Server(ioServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: "/",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on("connection", (socket: Socket) => {
  console.log(`✓ Client connected: ${socket.id}`);

  // Join an order-tracking room
  socket.on("track:order", (orderNumber: string) => {
    socket.join(`order:${orderNumber}`);
    console.log(`📍 Client ${socket.id} now tracking order ${orderNumber}`);
    socket.emit("track:subscribed", { orderNumber });
  });

  // Leave an order-tracking room
  socket.on("untrack:order", (orderNumber: string) => {
    socket.leave(`order:${orderNumber}`);
    console.log(`📍 Client ${socket.id} stopped tracking order ${orderNumber}`);
  });

  // Admin room — receives all order updates
  socket.on("join:admin", () => {
    socket.join("admin");
    console.log(`👑 Admin client ${socket.id} joined admin room`);
    socket.emit("admin:joined", { success: true });
  });

  // Ping/pong for connection health
  socket.on("ping", () => {
    socket.emit("pong", { timestamp: Date.now() });
  });

  socket.on("disconnect", (reason) => {
    console.log(`✗ Client disconnected: ${socket.id} (${reason})`);
  });

  socket.on("error", (error) => {
    console.error(`Socket error (${socket.id}):`, error);
  });
});

const SOCKET_PORT = 3003;
ioServer.listen(SOCKET_PORT, "0.0.0.0", () => {
  console.log(`\n📦 MAISON ÉLÉGANCE Order Tracker`);
  console.log(`   WebSocket: ws://0.0.0.0:${SOCKET_PORT}`);
  console.log(`   Webhook:   http://0.0.0.0:${WEBHOOK_PORT}/broadcast`);
  console.log(`   Health:    http://0.0.0.0:${WEBHOOK_PORT}/health\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM, shutting down...");
  ioServer.close(() => {
    webhookServer.close(() => {
      console.log("Order tracker stopped");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("\nReceived SIGINT, shutting down...");
  ioServer.close(() => {
    webhookServer.close(() => {
      console.log("Order tracker stopped");
      process.exit(0);
    });
  });
});

// Catch uncaught errors so the process doesn't die
process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught exception:", err.message);
});
process.on("unhandledRejection", (err) => {
  console.error("⚠️ Unhandled rejection:", err);
});
