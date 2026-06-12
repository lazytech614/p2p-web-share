import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("HOST CONNECTED:", socket.id);

  socket.emit("createRoom");
});

socket.on("roomCreated", (roomId) => {
  console.log("ROOM CREATED:", roomId);
});

socket.on("userJoined", (userId) => {
  console.log("USER JOINED:", userId);
});