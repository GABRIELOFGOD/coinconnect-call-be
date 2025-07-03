// import { MediaState, Room, User } from '../types/room';
// import { v4 as uuidv4 } from 'uuid';

// export class RoomService {
//   private rooms: Map<string, Room> = new Map();
//   private userRoomMap: Map<string, string> = new Map(); // socketId -> roomId

//   createRoom(roomId: string, maxParticipants: number = 10): Room {
//     if (this.rooms.has(roomId)) {
//       return this.rooms.get(roomId)!;
//     }

//     const room: Room = {
//       id: roomId,
//       participants: new Map(),
//       createdAt: new Date(),
//       maxParticipants,
//       isActive: true
//     };

//     this.rooms.set(roomId, room);
//     return room;
//   }

//   joinRoom(roomId: string, user: User): { success: boolean; room?: Room; error?: string } {
//     let room = this.rooms.get(roomId);
    
//     if (!room) {
//       // Auto-create room if it doesn't exist
//       room = this.createRoom(roomId);
//     }

//     if (!room.isActive) {
//       return { success: false, error: 'Room is not active' };
//     }

//     if (room.participants.size >= room.maxParticipants) {
//       return { success: false, error: 'Room is full' };
//     }

//     // Remove user from previous room if exists
//     this.leaveRoom(user.socketId);

//     // Add user to room
//     room.participants.set(user.id, user);
//     this.userRoomMap.set(user.socketId, roomId);

//     return { success: true, room };
//   }

//   leaveRoom(socketId: string): { roomId?: string; room?: Room } {
//     const roomId = this.userRoomMap.get(socketId);
//     if (!roomId) {
//       return {};
//     }

//     const room = this.rooms.get(roomId);
//     if (!room) {
//       return {};
//     }

//     // Find and remove user
//     let userToRemove: User | undefined;
//     for (const [userId, user] of room.participants) {
//       if (user.socketId === socketId) {
//         userToRemove = user;
//         room.participants.delete(userId);
//         break;
//       }
//     }

//     this.userRoomMap.delete(socketId);

//     // Clean up empty rooms
//     if (room.participants.size === 0) {
//       this.rooms.delete(roomId);
//     }

//     return { roomId, room };
//   }

//   getRoom(roomId: string): Room | undefined {
//     return this.rooms.get(roomId);
//   }

//   getRoomBySocketId(socketId: string): Room | undefined {
//     const roomId = this.userRoomMap.get(socketId);
//     return roomId ? this.rooms.get(roomId) : undefined;
//   }

//   getAllRooms(): Room[] {
//     return Array.from(this.rooms.values());
//   }

//   validateRoomId(roomId: string): boolean {
//     // Basic validation - you can extend this
//     return !!roomId && 
//            typeof roomId === 'string' && 
//            roomId.length >= 3 && 
//            roomId.length <= 50 &&
//            /^[a-zA-Z0-9-_]+$/.test(roomId);
//   }

//   updateUserMediaState(socketId: string, mediaState: Partial<MediaState>): boolean {
//     const room = this.getRoomBySocketId(socketId);
//     if (!room) return false;

//     for (const [userId, user] of room.participants) {
//       if (user.socketId === socketId) {
//         user.mediaState = { ...user.mediaState, ...mediaState };
//         return true;
//       }
//     }
//     return false;
//   }
// }


import { MediaState, Room, User } from '../types/room';
import { v4 as uuidv4 } from 'uuid';

export class RoomService {
  private rooms: Map<string, Room> = new Map();
  private userRoomMap: Map<string, string> = new Map(); // socketId -> roomId

  createRoom(roomId: string, maxParticipants: number = 10): Room {
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId)!;
    }

    const room: Room = {
      id: roomId,
      participants: new Map(),
      createdAt: new Date(),
      maxParticipants,
      isActive: true
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, user: User): { success: boolean; room?: Room; error?: string } {
    let room = this.rooms.get(roomId);
    
    if (!room) {
      // Auto-create room if it doesn't exist
      room = this.createRoom(roomId);
    }

    if (!room.isActive) {
      return { success: false, error: 'Room is not active' };
    }

    if (room.participants.size >= room.maxParticipants) {
      return { success: false, error: 'Room is full' };
    }

    // Remove user from previous room if exists
    this.leaveRoom(user.socketId);

    // Add user to room
    room.participants.set(user.id, user);
    this.userRoomMap.set(user.socketId, roomId);

    return { success: true, room };
  }

  leaveRoom(socketId: string): { roomId?: string; room?: Room } {
    const roomId = this.userRoomMap.get(socketId);
    if (!roomId) {
      return {};
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      return {};
    }

    // Find and remove user
    let userToRemove: User | undefined;
    for (const [userId, user] of room.participants) {
      if (user.socketId === socketId) {
        userToRemove = user;
        room.participants.delete(userId);
        break;
      }
    }

    this.userRoomMap.delete(socketId);

    // Clean up empty rooms
    if (room.participants.size === 0) {
      this.rooms.delete(roomId);
    }

    return { roomId, room };
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomBySocketId(socketId: string): Room | undefined {
    const roomId = this.userRoomMap.get(socketId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  validateRoomId(roomId: string): boolean {
    // Basic validation - you can extend this
    return !!roomId && 
           typeof roomId === 'string' && 
           roomId.length >= 3 && 
           roomId.length <= 50 &&
           /^[a-zA-Z0-9-_]+$/.test(roomId);
  }

  updateUserMediaState(socketId: string, mediaState: Partial<MediaState>): boolean {
    const room = this.getRoomBySocketId(socketId);
    if (!room) return false;

    for (const [userId, user] of room.participants) {
      if (user.socketId === socketId) {
        user.mediaState = { ...user.mediaState, ...mediaState };
        return true;
      }
    }
    return false;
  }
}