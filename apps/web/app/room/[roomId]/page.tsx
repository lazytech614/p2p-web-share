"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

export default function RoomPage() {
  const { socket } = useSocket();
  const [joined, setJoined] = useState(false);

  const params = useParams();

  const roomId =
    params.roomId as string;

  useEffect(() => {
    if (!roomId) return;

    socket.emit(
      "joinRoom",
      roomId
    );
  }, [roomId, socket]);

  useEffect(() => {
  socket.on(
    "joinedRoom",
    () => {
      setJoined(true);
    }
  );

  socket.on(
    "roomNotFound",
    () => {
      alert("Room not found");
    }
  );

  return () => {
    socket.off("joinedRoom");
    socket.off("roomNotFound");
  };
}, [socket]);

  return (
    <div className="p-10">
      {joined
        ? "Connected"
        : "Joining..."}
    </div>
  );
}