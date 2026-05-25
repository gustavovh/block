import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { logger } from "./logger";

let io: SocketIOServer;

export const initSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "New socket connection");

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Socket disconnected");
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
