import { RoomData } from "./types/room";

class RoomManager {
  private rooms = new Map<string, RoomData>();

  createRoom(roomId: string, hostId: string) {
    const room: RoomData = {
      roomId,
      hostId,
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);

    return room;
  }

  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId: string, guestId: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return null;
    }

    room.guestId = guestId;

    return room;
  }

  removeRoom(roomId: string) {
    this.rooms.delete(roomId);
  }

  getAllRooms() {
    return [...this.rooms.values()];
  }
}

export const roomManager = new RoomManager();