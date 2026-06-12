"use client";

import { useSocket } from "@/hooks/useSocket";
import { useState, useEffect } from "react";

export default function Home() {
  const { socket } = useSocket();

  const [roomId, setRoomId] = useState("");
  const [receiverConnected, setReceiverConnected] = useState(false);

  const createRoom = () => {
    socket.emit("createRoom");
  };

  useEffect(() => {
    socket.on(
      "roomCreated",
      (roomId) => {
        setRoomId(roomId);
      }
    );

    return () => {
      socket.off("roomCreated");
    };
  }, [socket]);

  useEffect(() => {
    socket.on(
      "userJoined",
      () => {
        setReceiverConnected(true);
      }
    );

    return () => {
      socket.off("userJoined");
    };
  }, [socket]);

  return (
    <main className="p-10 flex flex-col gap-4">
      <button
        onClick={createRoom}
      >
        Create Room
      </button>

      {roomId && (
        <div>
          <p>Room ID: {roomId}</p>

          <p>
            Link:
            {window.location.origin}
            /room/{roomId}
          </p>
        </div>
      )}

      {
        receiverConnected
          ? "Receiver Connected ✅"
          : "Waiting For Receiver..."
      }
    </main>
  );
}