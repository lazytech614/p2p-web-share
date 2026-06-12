"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { usePeer } from "@/hooks/usePeer";
import type { DataConnection } from "peerjs";

export default function RoomPage() {
  const { socket } = useSocket();
  const { peer, peerId } = usePeer();

  const [joined, setJoined] = useState(false);
  const [connection, setConnection] =
    useState<DataConnection | null>(null);

  const params = useParams();

  const roomId =
    params.roomId as string;

  // Join room
  useEffect(() => {
    if (!roomId) return;

    socket.emit(
      "joinRoom",
      roomId
    );
  }, [roomId, socket]);

  // Room events
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

  // Send Peer ID to server
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

  // Receive remote peer id (debug)
  useEffect(() => {
    const handlePeerReady = (
      remotePeerId: string
    ) => {
      console.log(
        "Remote Peer:",
        remotePeerId
      );
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
  }, [socket]);

  // Accept WebRTC connections
  useEffect(() => {
    if (!peer) return;

    const handleConnection = (
      conn: DataConnection
    ) => {
      console.log(
        "Incoming WebRTC connection"
      );

      setConnection(conn);

      conn.on("open", () => {
        console.log(
          "WebRTC Connected"
        );

        conn.send(
          "hello from receiver"
        );
      });

      conn.on("data", (data) => {
        console.log(
          "Received:",
          data
        );
      });
    };

    peer.on(
      "connection",
      handleConnection
    );

    return () => {
      peer.off(
        "connection",
        handleConnection
      );
    };
  }, [peer]);

  return (
    <div className="p-10">
      {joined
        ? "Connected"
        : "Joining..."}

      {connection && (
        <p>
          WebRTC Connected ✅
        </p>
      )}
    </div>
  );
}