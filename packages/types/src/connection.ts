export type ConnectionStatus =
  | "idle"
  | "waiting"
  | "connecting"
  | "connected"
  | "transferring"
  | "completed"
  | "disconnected"
  | "error";