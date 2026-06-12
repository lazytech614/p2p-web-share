export interface RoomData {
  roomId: string;
  hostId: string;
  guestId?: string;
  hostPeerId?: string;
  guestPeerId?: string;
  createdAt: number;
}