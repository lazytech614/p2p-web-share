"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export function useSocket() {
  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off(
        "disconnect",
        onDisconnect
      );
    };
  }, []);

  return {
    socket,
    connected,
  };
}