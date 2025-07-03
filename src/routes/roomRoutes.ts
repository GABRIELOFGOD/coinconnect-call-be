import { Router, Request, Response } from 'express';
import { RoomService } from '../services/roomService';

const router = Router();
const roomService = new RoomService();

// Get all rooms
router.get('/', (req: Request, res: Response) => {
  try {
    const rooms = roomService.getAllRooms().map(room => ({
      id: room.id,
      participantCount: room.participants.size,
      maxParticipants: room.maxParticipants,
      createdAt: room.createdAt,
      isActive: room.isActive
    }));

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch rooms' }
    });
  }
});

router.get('/:roomId', (req: Request, res: Response): void => {
  try {
    const { roomId } = req.params;
    
    if (!roomService.validateRoomId(roomId)) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid room ID' }
      });
      return;
    }

    const room = roomService.getRoom(roomId);
    
    if (!room) {
      res.status(404).json({
        success: false,
        error: { message: 'Room not found' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: room.id,
        participants: Array.from(room.participants.values()).map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          joinedAt: p.joinedAt,
          mediaState: p.mediaState
        })),
        participantCount: room.participants.size,
        maxParticipants: room.maxParticipants,
        createdAt: room.createdAt,
        isActive: room.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch room' }
    });
  }
});

// Validate room ID
router.post('/validate', (req: Request, res: Response): void => {
  try {
    const { roomId } = req.body;
    
    if (!roomId) {
      res.status(400).json({
        success: false,
        error: { message: 'Room ID is required' }
      });
      return;
    }

    const isValid = roomService.validateRoomId(roomId);
    
    res.json({
      success: true,
      data: {
        isValid,
        roomId,
        exists: isValid ? !!roomService.getRoom(roomId) : false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to validate room ID' }
    });
  }
});

export default router;

