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

    socket.on("disconnect", () => {
        console.log(`🔴🔴 ${socket.id} disconnected`);
    });
  });

  return io;
}