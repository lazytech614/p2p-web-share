"use client";

import { usePeer } from "@/hooks/usePeer";
import { useSocket } from "@/hooks/useSocket";
import { DataConnection } from "peerjs";
import { useState, useEffect } from "react";

export default function Home() {
  const { socket } = useSocket();
  const { peerId, peer } = usePeer();

  const [roomId, setRoomId] = useState("");
  const [receiverConnected, setReceiverConnected] = useState(false);
  const [connection, setConnection] =
  useState<DataConnection | null>(null);

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
    if (!roomId) return;

    if (!peerId) return;

    socket.emit(
      "peerReady",
      roomId,
      peerId
    );
  }, [
    roomId,
    peerId,
    socket,
  ]);

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

  useEffect(() => {
    const handlePeerReady = (
      remotePeerId: string
    ) => {
      const conn =
        peer?.connect(remotePeerId);

      if (!conn) return;

      setConnection(conn);

      conn.on("open", () => {
        console.log(
          "WebRTC Connected"
        );

        conn.send("hello");
      });

      conn.on("data", (data) => {
        console.log(
          "Received:",
          data
        );
      });
    };

    socket.on(
      "peerReady",
      handlePeerReady
    );

    return () => {
      socket.off(
        "peerReady",
        handlePeerReady
      );
    };
  }, [socket, peer]);

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