import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { roomManager } from "./room-manager";
import { generateRoomId } from "./utils/generateRoomId";

export function setupSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: ["https://p2p-web-share-web.vercel.app", "http://localhost:3000"],
      methods: ["GET", "POST"],
    },
    transports: ["polling", "websocket"],
    path: "/socket.io"
  });

  io.on("connection", (socket) => {
    console.log("🟢🟢 Connected:", socket.id);

    socket.on("createRoom", () => {
        const roomId = generateRoomId();
        roomManager.createRoom(roomId, socket.id);
        socket.join(roomId);
        socket.emit("roomCreated", roomId);
    });

    socket.on("joinRoom", (roomId: string) => {
        const room = roomManager.joinRoom(roomId, socket.id);

        if (!room) {
            socket.emit("roomNotFound");
            return;
        }

        socket.join(roomId);
        socket.emit("joinedRoom", roomId);
        io.to(room.hostId).emit(
            "userJoined",
             socket.id
        );
    });

    socket.on("peerReady", (roomId, peerId) => {
        const room = roomManager.getRoom(roomId);
        if (!room) return;

        if (socket.id === room.hostId) {
            roomManager.setHostPeerId(roomId, peerId);
        }

        if (socket.id === room.guestId) {
            roomManager.setGuestPeerId(roomId, peerId);
        }

        const updatedRoom = roomManager.getRoom(roomId);
        if (updatedRoom?.hostPeerId && updatedRoom?.guestPeerId) {
            io.to(updatedRoom.hostId).emit(
                "peerReady",
                updatedRoom.guestPeerId
            );

            io.to(updatedRoom.guestId!).emit(
                "peerReady",
                updatedRoom.hostPeerId
            );
        }
    });

    socket.on("disconnect", () => {
        console.log(`🔴🔴 ${socket.id} disconnected`);
    });
  });

  return io;
}