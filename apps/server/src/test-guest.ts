import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// Replace with room ID from host terminal
const ROOM_ID = "5BJX9M";

socket.on("connect", () => {
  console.log("GUEST CONNECTED:", socket.id);

  socket.emit("joinRoom", ROOM_ID);
});

socket.on("joinedRoom", (roomId) => {
  console.log("JOINED ROOM:", roomId);
});

socket.on("roomNotFound", () => {
  console.log("ROOM NOT FOUND");
});