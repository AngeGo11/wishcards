export interface Message {
  id: number;
  name: string;
  message: string;
  signature: string | null;
  photo_url: string | null;
  emoji: string | null;
  created_at: string;
}

export interface MessageInput {
  name: string;
  message: string;
  signature?: string;
  photo_url?: string;
  emoji?: string;
  honeypot?: string;
}
