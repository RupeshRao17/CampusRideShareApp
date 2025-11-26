const chats: Record<string, any[]> = {};
const listeners: Record<string, Set<(messages: any[]) => void>> = {};

export function listenChat(chatId: string, cb: (messages: any[]) => void) {
  chats[chatId] = chats[chatId] || [];
  listeners[chatId] = listeners[chatId] || new Set();
  listeners[chatId].add(cb);
  cb([...(chats[chatId] || [])]);
  return () => {
    listeners[chatId].delete(cb);
  };
}

export async function sendMessage(chatId: string, data: { senderId: string; receiverId: string; message: string }) {
  const msg = { id: String(Date.now()), ...data, timestamp: Date.now() };
  chats[chatId] = [...(chats[chatId] || []), msg];
  const subs = listeners[chatId];
  if (subs) {
    const sorted = [...chats[chatId]].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    subs.forEach((cb) => cb(sorted));
  }
}