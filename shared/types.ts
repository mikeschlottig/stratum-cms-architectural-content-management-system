export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type UserRole = 'admin' | 'editor' | 'viewer';
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}
export interface AuthResponse {
  user: User;
  token: string;
}
export interface AuditLog {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'publish';
  entityType: string;
  timestamp: number;
  details?: string;
}
// Minimal real-world chat example types (shared by frontend and worker)
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}