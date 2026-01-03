import type { User, Chat, ChatMessage } from './types';
export const MOCK_USERS: User[] = [
  { id: 'u1', email: 'user-a@stratum.io', name: 'User A', role: 'admin' },
  { id: 'u2', email: 'user-b@stratum.io', name: 'User B', role: 'editor' }
];
export const MOCK_CHATS: Chat[] = [
  { id: 'c1', title: 'General' },
];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', chatId: 'c1', userId: 'u1', text: 'Hello', ts: Date.now() },
];