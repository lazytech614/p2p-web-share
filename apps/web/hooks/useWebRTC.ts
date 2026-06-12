"use client";

import Peer from "peerjs";
import { useState } from "react";
import type { DataConnection } from "peerjs";

export function useWebRTC() {
  const [connection, setConnection] =
    useState<DataConnection | null>(null);

  const [connected, setConnected] =
    useState(false);

  return {
    connection,
    setConnection,
    connected,
    setConnected,
  };
}