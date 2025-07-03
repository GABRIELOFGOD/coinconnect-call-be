export interface User {
  id: string;
  name: string;
  avatar: string;
  socketId: string;
  joinedAt: Date;
  mediaState: MediaState;
}

export interface MediaState {
  video: boolean;
  audio: boolean;
}

export interface Room {
  id: string;
  participants: Map<string, User>;
  createdAt: Date;
  maxParticipants: number;
  isActive: boolean;
}

// WebRTC signaling data types (server-side representations)
export interface SessionDescription {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp: string;
}

export interface IceCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
  usernameFragment?: string;
}

export interface SignalingMessage {
  type: 'join-room' | 'offer' | 'answer' | 'ice-candidate' | 'peer-joined' | 'peer-left' | 'joined-room' | 'room-full' | 'room-not-found';
  roomId?: string;
  peerId?: string;
  target?: string;
  offer?: SessionDescription;
  answer?: SessionDescription;
  candidate?: IceCandidate;
  data?: any;
  roomInfo?: any;
  error?: string;
}
