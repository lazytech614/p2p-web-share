import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { roomManager } from "./room-manager";
import { generateRoomId } from "./utils/generateRoomId";

export function setupSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢🟢 Connected:", socket.id);

    socket.on("createRoom", () => {
        const roomId = generateRoomId();

        roomManager.createRoom(
            roomId,
            socket.id
        );

        socket.join(roomId);

        socket.emit(
            "roomCreated",
            roomId
        );

        console.log(
            `Room ${roomId} created by ${socket.id}`
        );
    });

    socket.on("joinRoom", (roomId: string) => {
        const room =
        roomManager.joinRoom(
            roomId,
            socket.id
        );

        if (!room) {
            socket.emit(
                "roomNotFound"
            );
            return;
        }

        socket.join(roomId);

        socket.emit(
        "joinedRoom",
        roomId
        );

        io.to(room.hostId).emit(
        "userJoined",
        socket.id
        );

        console.log(
        `${socket.id} joined ${roomId}`
        );
    });

    socket.on("peerReady", (roomId, peerId) => {
        //TODO: debug logs (remove later)
        console.log(
        "Received peerReady:",
        {
            roomId,
            peerId,
            socketId: socket.id,
        }
        );
        const room = roomManager.getRoom(roomId);

        if (!room) return;

        if (
        socket.id === room.hostId
        ) {
        roomManager.setHostPeerId(
            roomId,
            peerId
        );
        }

        if (
        socket.id === room.guestId
        ) {
        roomManager.setGuestPeerId(
            roomId,
            peerId
        );
        }

        const updatedRoom =
        roomManager.getRoom(roomId);

        //TODO: debug logs (remove later)
        console.log(
        "Host Peer:",
        updatedRoom?.hostPeerId
        );

        console.log(
        "Guest Peer:",
        updatedRoom?.guestPeerId
        );

        if (
        updatedRoom?.hostPeerId &&
        updatedRoom?.guestPeerId
        ) {
        io.to(
            updatedRoom.hostId
        ).emit(
            "peerReady",
            updatedRoom.guestPeerId
        );

        io.to(
            updatedRoom.guestId!
        ).emit(
            "peerReady",
            updatedRoom.hostPeerId
        );
        }
    }
    );

    socket.on("disconnect", () => {
        console.log(`🔴🔴 ${socket.id} disconnected`);
    });
  });

  return io;
}