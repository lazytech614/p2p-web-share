"use client";

import { useFileTransfer } from "@/hooks/useFileTransfer";
import { usePeer } from "@/hooks/usePeer";
import { useSocket } from "@/hooks/useSocket";
import { formatBytes, formatSpeed } from "@/lib/fileChunker";
import { DataConnection } from "peerjs";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Antenna,
  Upload,
  FileText,
  X,
  Copy,
  Check,
  Zap,
  Clock,
  UploadCloud,
  Plus,
  Send,
  ArrowRightLeft,
  Lock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportKey, generateAESKey } from "@/lib/crypto";

export default function Home() {
  const { socket } = useSocket();
  const { peerId, peer } = usePeer();

  const [roomId, setRoomId] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [receiverConnected, setReceiverConnected] = useState(false);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const aesKeyRef = useRef<CryptoKey | null>(null);

  const {
    selectedFile,
    setSelectedFile,
    sendMetadata,
    sendFile,
    sendProgress,
    uploadSpeed,
    uploadETA,
  } = useFileTransfer();

  // ── Socket setup ──────────────────────────────────────────────────────────

  const createRoom = async() => {
    socket.emit("createRoom");
  };

  useEffect(() => {
    socket.on("roomCreated", async roomId => {
      setRoomId(roomId);
      const key = await generateAESKey();
      aesKeyRef.current = key;
      const keyString = await exportKey(key);
      const url = `${window.location.origin}/room/${roomId}#key=${keyString}`;
      setShareUrl(url);
    });

    return () => { socket.off("roomCreated"); };
  }, [socket]);

  useEffect(() => {
    if (!roomId || !peerId) return;
    socket.emit("peerReady", roomId, peerId);
  }, [roomId, peerId, socket]);

  useEffect(() => {
    socket.on("userJoined", () => {
      setReceiverConnected(true);
    });
    return () => { socket.off("userJoined"); };
  }, [socket]);

  useEffect(() => {
    const handlePeerReady = (remotePeerId: string) => {
      const conn = peer?.connect(remotePeerId);
      if (!conn) return;
      setConnection(conn);
    };

    socket.on("peerReady", handlePeerReady);
    return () => { socket.off("peerReady", handlePeerReady); };
  }, [socket, peer]);

  // ── File handling ─────────────────────────────────────────────────────────

  const applyFile = (file: File) => {
    setSelectedFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  }, []);

  // ── Copy helpers ──────────────────────────────────────────────────────────

  const shareLink = shareUrl;

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard?.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 1800);
  };

  // ── Derived display values ────────────────────────────────────────────────

  const etaDisplay = uploadETA;
  const speedDisplay = uploadSpeed > 0 ? formatSpeed(uploadSpeed) : "—";
  const canSend = !!connection && !!selectedFile;

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

        {/* ── Drop zone ── */}
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          className={cn(
            "relative rounded-xl border-2 border-dashed transition-all duration-150 cursor-pointer select-none",
            isDragging
              ? "border-blue-500 bg-blue-950/30"
              : selectedFile
              ? "border-blue-800 bg-blue-950/20 cursor-default"
              : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/60"
          )}
        >
          {!selectedFile ? (
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {isDragging ? "Drop to select" : "Drop your file here"}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  or{" "}
                  <span className="text-blue-400 hover:text-blue-300 transition-colors">
                    browse to upload
                  </span>
                </p>
              </div>
              <p className="text-[11px] text-zinc-600">Any file type · No size limit</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-zinc-100 truncate">
                  {selectedFile.name}
                </p>
                <p className="font-mono text-xs text-zinc-500 mt-0.5">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors shrink-0"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onInputChange}
        />

        {/* ── Transfer stats ── */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">
            Transfer stats
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: Upload, label: "Progress", value: `${sendProgress}`, unit: "%" },
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
            value={sendProgress}
            className="h-1.5 bg-zinc-800 [&>div]:bg-blue-500"
          />
        </div>

        {/* ── Session card ── */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">
            Session
          </p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            {!roomId ? (
              <div className="flex items-center gap-2.5 text-zinc-500">
                <Lock className="w-4 h-4 shrink-0" />
                <span className="text-sm">No active room — create one to get a share link</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Room ID row */}
                <div>
                  <p className="text-[11px] text-zinc-600 mb-1.5">Room ID</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-zinc-100 flex-1 truncate">
                      {roomId}
                    </span>
                    <button
                      onClick={() => copyText(roomId, setCopiedRoomId)}
                      className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-300 transition-colors shrink-0"
                    >
                      {copiedRoomId ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedRoomId ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                {/* Share link row */}
                <div>
                  <p className="text-[11px] text-zinc-600 mb-1.5">Share link</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-400 flex-1 truncate">
                      {shareLink}
                    </span>
                    <button
                      onClick={() => copyText(shareLink, setCopiedLink)}
                      className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-300 transition-colors shrink-0"
                    >
                      {copiedLink ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedLink ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                {/* Receiver status */}
                <div className="flex items-center gap-2.5">
                  {receiverConnected ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                      <span className="text-sm text-green-400">Receiver connected</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin shrink-0" />
                      <span className="text-sm text-zinc-500">Waiting for receiver...</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Button
            variant="outline"
            onClick={createRoom}
            disabled={!!roomId}
            className="bg-transparent border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create room
          </Button>

          <Button
            variant="outline"
            onClick={() => connection && sendMetadata(connection)}
            disabled={!canSend}
            className="bg-transparent border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40"
          >
            <Send className="w-4 h-4 mr-2" />
            Send metadata
          </Button>

          <Button
            onClick={() => connection && sendFile(connection, aesKeyRef.current!)}
            disabled={!canSend}
            className="bg-blue-600 hover:bg-blue-500 text-white border-0 disabled:opacity-40 disabled:bg-blue-900"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Send file
          </Button>
        </div>

      </div>
    </main>
  );
}