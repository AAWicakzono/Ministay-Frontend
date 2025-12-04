export interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  status: 'available' | 'occupied' | 'cleaning';
  image: string;
  facilities: string[];
  description?: string;
  rating?: number;
  location?: string;
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'admin';
  time: string;
  replyTo?: {
    text: string;
    senderName: string;
  } | null;
}

export interface ChatSession {
  roomId: string;
  roomName: string;
  lastMessage: string;
  timestamp: string;
  messages: Message[];
  unread: number;
  avatar?: string;
}

// --- TIPE BARU: REVIEW ---
export interface Review {
  id: string;
  roomId: number;
  guestName: string;
  rating: number;
  comment: string;
  date: string;
}