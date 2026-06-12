"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { usePeer } from "@/hooks/usePeer";
import type { DataConnection } from "peerjs";
import { formatSpeed, formatBytes } from "@/lib/fileChunker";
import { triggerDownload } from "@/lib/download";
import { useFileTransfer } from "@/hooks/useFileTransfer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Antenna,
  Download,
  FileText,
  Zap,
  Clock,
  ArrowRightLeft,
  Loader2,
  WifiOff,
  CheckCircle2,
} from "lucide-react";

export default function RoomPage() {
  const { socket } = useSocket();
  const { peer, peerId } = usePeer();

  const [joined, setJoined] = useState(false);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [connectionLost, setConnectionLost] = useState(false);

  const params = useParams();
  const roomId = params.roomId as string;

  const {
    incomingFile,
    receivedBlob,
    receiveProgress,
    downloadSpeed,
    downloadETA,
    handleIncomingData,
    verified
  } = useFileTransfer();

  // Join room
  useEffect(() => {
    if (!roomId) return;
    socket.emit("joinRoom", roomId);
  }, [roomId, socket]);

  // Room events
  useEffect(() => {
    socket.on("joinedRoom", () => setJoined(true));
    socket.on("roomNotFound", () => alert("Room not found"));
    return () => {
      socket.off("joinedRoom");
      socket.off("roomNotFound");
    };
  }, [socket]);

  // Send Peer ID to server
  useEffect(() => {
    if (!roomId || !peerId) return;
    socket.emit("peerReady", roomId, peerId);
  }, [roomId, peerId, socket]);

  // Accept WebRTC connections
  useEffect(() => {
    if (!peer) return;

    const handleConnection = (conn: DataConnection) => {
      setConnection(conn);
      conn.on("data", (rawData) => handleIncomingData(rawData));
      conn.on("close", () => setConnectionLost(true));
    };

    peer.on("connection", handleConnection);

    return () => { peer.off("connection", handleConnection); };
  }, [peer]);

  // ── Derived display values ────────────────────────────────────────────────

  const etaDisplay = downloadETA;
  const speedDisplay = downloadSpeed > 0 ? formatSpeed(downloadSpeed) : "—";
  const isComplete = receiveProgress === 100 && !!receivedBlob;

  // ── Connection lost screen ────────────────────────────────────────────────

  if (connectionLost) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center">
            <WifiOff className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">Connection lost</p>
            <p className="text-xs text-zinc-500 mt-1">The sender disconnected. Close this tab and try again.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-start justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-lg flex flex-col gap-6">

        {/* ── Wordmark ── */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center">
            <Antenna className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-zinc-100">WebShare</span>
          <Badge
            variant="outline"
            className="font-mono text-[10px] text-zinc-500 border-zinc-700 px-1.5 py-0"
          >
            P2P
          </Badge>
        </div>

        {/* ── File card ── */}
        <div className="rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900">
          {!incomingFile ? (
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                <Download className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Waiting for file</p>
                <p className="text-xs text-zinc-500 mt-1">
                  The sender will push the file once connected
                </p>
              </div>
              <p className="text-[11px] text-zinc-600">Room · {roomId}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-zinc-100 truncate">
                  {incomingFile.name}
                </p>
                <p className="font-mono text-xs text-zinc-500 mt-0.5">
                  {formatBytes(incomingFile.size)}
                  {incomingFile.type && (
                    <span className="ml-2 text-zinc-600">{incomingFile.type}</span>
                  )}
                </p>
              </div>
              {isComplete && (
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              )}
            </div>
          )}
        </div>

        {/* ── Transfer stats ── */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">
            Transfer stats
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: Download, label: "Progress", value: `${receiveProgress}`, unit: "%" },
              { icon: Zap, label: "Speed", value: speedDisplay, unit: "" },
              { icon: Clock, label: "ETA", value: etaDisplay, unit: "" },
            ].map(({ icon: Icon, label, value, unit }) => (
              <div
                key={label}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className="w-3 h-3 text-zinc-500" />
                  <span className="text-[11px] text-zinc-500">{label}</span>
                </div>
                <p className="font-mono text-lg font-medium text-zinc-100 leading-none">
                  {value}
                  {unit && (
                    <span className="text-sm font-normal text-zinc-500 ml-0.5">
                      {unit}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
          <Progress
            value={receiveProgress}
            className="h-1.5 bg-zinc-800 [&>div]:bg-blue-500"
          />
        </div>

        {/* ── Session card ── */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">
            Session
          </p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex flex-col gap-3">
              {/* Room ID row */}
              <div>
                <p className="text-[11px] text-zinc-600 mb-1.5">Room ID</p>
                <span className="font-mono text-sm font-medium text-zinc-100">
                  {roomId}
                </span>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Connection status */}
              <div className="flex items-center gap-2.5">
                {!joined ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin shrink-0" />
                    <span className="text-sm text-zinc-500">Joining room...</span>
                  </>
                ) : !connection ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin shrink-0" />
                    <span className="text-sm text-zinc-500">Waiting for sender...</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    <span className="text-sm text-green-400">Sender connected</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Download action ── */}
        <div className="grid grid-cols-1 gap-2.5">
          <Button
            onClick={() =>
              receivedBlob && incomingFile && verified &&
              triggerDownload(receivedBlob, incomingFile.name)
            }
            disabled={!receivedBlob || !incomingFile || !verified}
            className="bg-blue-600 hover:bg-blue-500 text-white border-0 disabled:opacity-40 disabled:bg-blue-900"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Download file
          </Button>
        </div>

      </div>
    </main>
  );
}