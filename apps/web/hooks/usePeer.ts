"use client";

import Peer from "peerjs";
import { useEffect, useState } from "react";

export function usePeer() {
  const [peer, setPeer] =
    useState<Peer | null>(null);

  const [peerId, setPeerId] =
    useState("");

  useEffect(() => {
    const p = new Peer();

    p.on("open", (id) => setPeerId(id));
    setPeer(p);

    return () => {
      p.destroy();
    };
  }, []);

  return {
    peer,
    peerId,
  };
}