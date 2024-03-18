import { Server } from "socket.io";
/**
 * API handler for setting up and managing WebSocket connections using Socket.IO.
 * It ensures that the Socket.IO server is attached to the HTTP server only once
 * and handles various WebSocket events such as connection, joining rooms, and messaging.
 *
 * @param {Object} req - The HTTP request object provided by Next.js API route.
 * @param {Object} res - The HTTP response object provided by Next.js API route.
 *
 * @dev Upon a new connection, it sets up event listeners for:
 * - "join" to manage joining different rooms.
 * - "ready" to signal readiness in a room.
 * - "ice-candidate", "offer", and "answer" for WebRTC signaling.
 * - "leave" to handle a user leaving a room.
 * - "send-message" for chat functionality.
 *
 * Emits events such as "room:created", "room:joined", "full", "ready", "ice-candidate", "offer", "answer", "leave",
 * and "receive-message" based on the actions performed.
 */
const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already attached");
    return res.end();
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log(`User Connected :${socket.id}`);

    socket.on("join", (meetingId) => {
      const { rooms } = io.sockets.adapter;
      const room = rooms.get(meetingId);

      if (room === undefined) {
        socket.join(meetingId);
        socket.emit("room:created");
      } else if (room.size === 1) {
        socket.join(meetingId);
        socket.emit("room:joined");
      } else {
        socket.emit("full");
      }
    });

    socket.on("ready", (meetingId) => {
      socket.broadcast.to(meetingId).emit("ready");
    });

    socket.on("ice-candidate", (candidate, meetingId) => {
      console.log(candidate);
      socket.broadcast.to(meetingId).emit("ice-candidate", candidate);
    });

    socket.on("offer", (offer, meetingId) => {
      socket.broadcast.to(meetingId).emit("offer", offer);
    });

    socket.on("answer", (answer, meetingId) => {
      socket.broadcast.to(meetingId).emit("answer", answer);
    });

    socket.on("leave", (meetingId) => {
      socket.leave(meetingId);
      socket.broadcast.to(meetingId).emit("leave");
    });
    socket.on("send-message", (message, meetingId) => {
      console.log(message);
      socket.broadcast.to(meetingId).emit("receive-message", message);
    });
  });
  return res.end();
};

export default SocketHandler;
