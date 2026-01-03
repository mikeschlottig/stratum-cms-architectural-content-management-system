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
export type FieldType = 'text' | 'rich-text' | 'number' | 'boolean' | 'date' | 'media' | 'reference';
export interface FieldDefinition {
  id: string;
  type: FieldType;
  label: string;
  slug: string;
  required: boolean;
  placeholder?: string;
  description?: string;
}
export interface ContentType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  fields: FieldDefinition[];
  updatedAt: number;
}
export interface ContentItem {
  id: string;
  typeId: string;
  data: Record<string, any>;
  status: 'draft' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
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
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}