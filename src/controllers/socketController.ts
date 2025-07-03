// import { Server, Socket } from 'socket.io';
// import { RoomService } from '../services/roomService';
// import { User, SignalingMessage } from '../types/room';
// import { v4 as uuidv4 } from 'uuid';

// export class SocketController {
//   private roomService: RoomService;

//   constructor(io: Server) {
//     this.roomService = new RoomService();
//     this.handleConnection(io);
//   }

//   private handleConnection(io: Server): void {
//     io.on('connection', (socket: Socket) => {
//       console.log(`Client connected: ${socket.id}`);

//       socket.on('join-room', (data: { roomId: string; userInfo: { name: string; avatar: string } }) => {
//         this.handleJoinRoom(socket, data, io);
//       });

//       socket.on('offer', (data: { target: string; offer: RTCSessionDescriptionInit }) => {
//         this.handleOffer(socket, data, io);
//       });

//       socket.on('answer', (data: { target: string; answer: RTCSessionDescriptionInit }) => {
//         this.handleAnswer(socket, data, io);
//       });

//       socket.on('ice-candidate', (data: { target: string; candidate: RTCIceCandidate }) => {
//         this.handleIceCandidate(socket, data, io);
//       });

//       socket.on('media-state-change', (data: { video?: boolean; audio?: boolean }) => {
//         this.handleMediaStateChange(socket, data, io);
//       });

//       socket.on('disconnect', () => {
//         this.handleDisconnect(socket, io);
//       });
//     });
//   }

//   private handleJoinRoom(
//     socket: Socket, 
//     data: { roomId: string; userInfo: { name: string; avatar: string } },
//     io: Server
//   ): void {
//     try {
//       const { roomId, userInfo } = data;

//       // Validate room ID
//       if (!this.roomService.validateRoomId(roomId)) {
//         socket.emit('error', { message: 'Invalid room ID' });
//         return;
//       }

//       // Create user object
//       const user: User = {
//         id: uuidv4(),
//         name: userInfo.name || `User-${socket.id.substring(0, 5)}`,
//         avatar: userInfo.avatar || '👤',
//         socketId: socket.id,
//         joinedAt: new Date(),
//         mediaState: { video: true, audio: true }
//       };

//       // Join room
//       const result = this.roomService.joinRoom(roomId, user);

//       if (!result.success) {
//         socket.emit('error', { message: result.error });
//         return;
//       }

//       const room = result.room!;

//       // Join socket room
//       socket.join(roomId);

//       // Notify existing participants about new user
//       socket.to(roomId).emit('peer-joined', {
//         peerId: user.id,
//         user: {
//           id: user.id,
//           name: user.name,
//           avatar: user.avatar,
//           joinedAt: user.joinedAt,
//           mediaState: user.mediaState
//         }
//       });

//       // Send room info to new user
//       const roomInfo = {
//         id: room.id,
//         participants: Array.from(room.participants.values()).map(p => ({
//           id: p.id,
//           name: p.name,
//           avatar: p.avatar,
//           joinedAt: p.joinedAt,
//           mediaState: p.mediaState
//         })),
//         createdAt: room.createdAt,
//         participantCount: room.participants.size
//       };

//       socket.emit('joined-room', roomInfo);

//       console.log(`User ${user.name} joined room ${roomId}`);

//     } catch (error) {
//       console.error('Error joining room:', error);
//       socket.emit('error', { message: 'Failed to join room' });
//     }
//   }

//   private handleOffer(
//     socket: Socket,
//     data: { target: string; offer: RTCSessionDescriptionInit },
//     io: Server
//   ): void {
//     try {
//       const room = this.roomService.getRoomBySocketId(socket.id);
//       if (!room) return;

//       // Find target user's socket ID
//       const targetUser = Array.from(room.participants.values())
//         .find(user => user.id === data.target);

//       if (targetUser) {
//         io.to(targetUser.socketId).emit('offer', {
//           offer: data.offer,
//           from: this.getUserBySocketId(socket.id, room)?.id
//         });
//       }
//     } catch (error) {
//       console.error('Error handling offer:', error);
//     }
//   }

//   private handleAnswer(
//     socket: Socket,
//     data: { target: string; answer: RTCSessionDescriptionInit },
//     io: Server
//   ): void {
//     try {
//       const room = this.roomService.getRoomBySocketId(socket.id);
//       if (!room) return;

//       // Find target user's socket ID
//       const targetUser = Array.from(room.participants.values())
//         .find(user => user.id === data.target);

//       if (targetUser) {
//         io.to(targetUser.socketId).emit('answer', {
//           answer: data.answer,
//           from: this.getUserBySocketId(socket.id, room)?.id
//         });
//       }
//     } catch (error) {
//       console.error('Error handling answer:', error);
//     }
//   }

//   private handleIceCandidate(
//     socket: Socket,
//     data: { target: string; candidate: RTCIceCandidate },
//     io: Server
//   ): void {
//     try {
//       const room = this.roomService.getRoomBySocketId(socket.id);
//       if (!room) return;

//       // Find target user's socket ID
//       const targetUser = Array.from(room.participants.values())
//         .find(user => user.id === data.target);

//       if (targetUser) {
//         io.to(targetUser.socketId).emit('ice-candidate', {
//           candidate: data.candidate,
//           from: this.getUserBySocketId(socket.id, room)?.id
//         });
//       }
//     } catch (error) {
//       console.error('Error handling ICE candidate:', error);
//     }
//   }

//   private handleMediaStateChange(
//     socket: Socket,
//     data: { video?: boolean; audio?: boolean },
//     io: Server
//   ): void {
//     try {
//       const room = this.roomService.getRoomBySocketId(socket.id);
//       if (!room) return;

//       const user = this.getUserBySocketId(socket.id, room);
//       if (!user) return;

//       // Update media state
//       this.roomService.updateUserMediaState(socket.id, data);

//       // Notify other participants
//       socket.to(room.id).emit('media-state-changed', {
//         userId: user.id,
//         mediaState: user.mediaState
//       });

//     } catch (error) {
//       console.error('Error handling media state change:', error);
//     }
//   }

//   private handleDisconnect(socket: Socket, io: Server): void {
//     try {
//       const result = this.roomService.leaveRoom(socket.id);
      
//       if (result.roomId && result.room) {
//         const user = this.getUserBySocketId(socket.id, result.room);
//         if (user) {
//           // Notify other participants
//           socket.to(result.roomId).emit('peer-left', {
//             peerId: user.id
//           });
          
//           console.log(`User ${user.name} left room ${result.roomId}`);
//         }
//       }

//       console.log(`Client disconnected: ${socket.id}`);
//     } catch (error) {
//       console.error('Error handling disconnect:', error);
//     }
//   }

//   private getUserBySocketId(socketId: string, room: any): User | undefined {
//     return Array.from(room.participants.values())
//       .find((user: User) => user.socketId === socketId);
//   }

//   // Get room statistics
//   getRoomStats() {
//     return {
//       totalRooms: this.roomService.getAllRooms().length,
//       activeRooms: this.roomService.getAllRooms().filter(room => room.isActive).length,
//       totalUsers: this.roomService.getAllRooms().reduce((sum, room) => sum + room.participants.size, 0)
//     };
//   }
// }


import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/roomService';
import { User, SignalingMessage, SessionDescription, IceCandidate } from '../types/room';
import { v4 as uuidv4 } from 'uuid';

export class SocketController {
  private roomService: RoomService;

  constructor(io: Server) {
    this.roomService = new RoomService();
    this.handleConnection(io);
  }

  private handleConnection(io: Server): void {
    io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('join-room', (data: { roomId: string; userInfo: { name: string; avatar: string } }) => {
        this.handleJoinRoom(socket, data, io);
      });

      socket.on('offer', (data: { target: string; offer: SessionDescription }) => {
        this.handleOffer(socket, data, io);
      });

      socket.on('answer', (data: { target: string; answer: SessionDescription }) => {
        this.handleAnswer(socket, data, io);
      });

      socket.on('ice-candidate', (data: { target: string; candidate: IceCandidate }) => {
        this.handleIceCandidate(socket, data, io);
      });

      socket.on('media-state-change', (data: { video?: boolean; audio?: boolean }) => {
        this.handleMediaStateChange(socket, data, io);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket, io);
      });
    });
  }

  private handleJoinRoom(
    socket: Socket, 
    data: { roomId: string; userInfo: { name: string; avatar: string } },
    io: Server
  ): void {
    try {
      const { roomId, userInfo } = data;

      // Validate room ID
      if (!this.roomService.validateRoomId(roomId)) {
        socket.emit('error', { message: 'Invalid room ID' });
        return;
      }

      // Create user object
      const user: User = {
        id: uuidv4(),
        name: userInfo.name || `User-${socket.id.substring(0, 5)}`,
        avatar: userInfo.avatar || '👤',
        socketId: socket.id,
        joinedAt: new Date(),
        mediaState: { video: true, audio: true }
      };

      // Join room
      const result = this.roomService.joinRoom(roomId, user);

      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      const room = result.room!;

      // Join socket room
      socket.join(roomId);

      // Notify existing participants about new user
      socket.to(roomId).emit('peer-joined', {
        peerId: user.id,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          joinedAt: user.joinedAt,
          mediaState: user.mediaState
        }
      });

      // Send room info to new user
      const roomInfo = {
        id: room.id,
        participants: Array.from(room.participants.values()).map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          joinedAt: p.joinedAt,
          mediaState: p.mediaState
        })),
        createdAt: room.createdAt,
        participantCount: room.participants.size
      };

      socket.emit('joined-room', roomInfo);

      console.log(`User ${user.name} joined room ${roomId}`);

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  private handleOffer(
    socket: Socket,
    data: { target: string; offer: SessionDescription },
    io: Server
  ): void {
    try {
      const room = this.roomService.getRoomBySocketId(socket.id);
      if (!room) return;

      // Find target user's socket ID
      const targetUser = Array.from(room.participants.values())
        .find(user => user.id === data.target);

      if (targetUser) {
        io.to(targetUser.socketId).emit('offer', {
          offer: data.offer,
          from: this.getUserBySocketId(socket.id, room)?.id
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private handleAnswer(
    socket: Socket,
    data: { target: string; answer: SessionDescription },
    io: Server
  ): void {
    try {
      const room = this.roomService.getRoomBySocketId(socket.id);
      if (!room) return;

      // Find target user's socket ID
      const targetUser = Array.from(room.participants.values())
        .find(user => user.id === data.target);

      if (targetUser) {
        io.to(targetUser.socketId).emit('answer', {
          answer: data.answer,
          from: this.getUserBySocketId(socket.id, room)?.id
        });
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private handleIceCandidate(
    socket: Socket,
    data: { target: string; candidate: IceCandidate },
    io: Server
  ): void {
    try {
      const room = this.roomService.getRoomBySocketId(socket.id);
      if (!room) return;

      // Find target user's socket ID
      const targetUser = Array.from(room.participants.values())
        .find(user => user.id === data.target);

      if (targetUser) {
        io.to(targetUser.socketId).emit('ice-candidate', {
          candidate: data.candidate,
          from: this.getUserBySocketId(socket.id, room)?.id
        });
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private handleMediaStateChange(
    socket: Socket,
    data: { video?: boolean; audio?: boolean },
    io: Server
  ): void {
    try {
      const room = this.roomService.getRoomBySocketId(socket.id);
      if (!room) return;

      const user = this.getUserBySocketId(socket.id, room);
      if (!user) return;

      // Update media state
      this.roomService.updateUserMediaState(socket.id, data);

      // Notify other participants
      socket.to(room.id).emit('media-state-changed', {
        userId: user.id,
        mediaState: user.mediaState
      });

    } catch (error) {
      console.error('Error handling media state change:', error);
    }
  }

  private handleDisconnect(socket: Socket, io: Server): void {
    try {
      const result = this.roomService.leaveRoom(socket.id);
      
      if (result.roomId && result.room) {
        const user = this.getUserBySocketId(socket.id, result.room);
        if (user) {
          // Notify other participants
          socket.to(result.roomId).emit('peer-left', {
            peerId: user.id
          });
          
          console.log(`User ${user.name} left room ${result.roomId}`);
        }
      }

      console.log(`Client disconnected: ${socket.id}`);
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  private getUserBySocketId(socketId: string, room: any): User | undefined {
    return (Array.from(room.participants.values()) as User[])
      .find((user: User) => user.socketId === socketId);
  }

  // Get room statistics
  getRoomStats() {
    return {
      totalRooms: this.roomService.getAllRooms().length,
      activeRooms: this.roomService.getAllRooms().filter(room => room.isActive).length,
      totalUsers: this.roomService.getAllRooms().reduce((sum, room) => sum + room.participants.size, 0)
    };
  }
}

// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`Error ${statusCode}: ${message}`);
  console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`
    }
  });
};
