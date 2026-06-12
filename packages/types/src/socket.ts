export interface ClientToServerEvents {
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  peerReady: (roomId: string, peerId: string) => void;
}

export interface ServerToClientEvents {
  roomCreated: (roomId: string) => void;
  joinedRoom: (roomId: string) => void;
  roomNotFound: () => void;
  userJoined: (userId: string) => void;
  peerReady: (peerId: string) => void;
}