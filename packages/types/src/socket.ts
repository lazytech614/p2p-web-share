export interface ClientToServerEvents {
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
}

export interface ServerToClientEvents {
  roomCreated: (roomId: string) => void;
  userJoined: (socketId: string) => void;
  roomNotFound: () => void;
}

export interface ClientToServerEvents {
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
}

export interface ServerToClientEvents {
  roomCreated: (roomId: string) => void;
  joinedRoom: (roomId: string) => void;
  roomNotFound: () => void;
  userJoined: (userId: string) => void;
}