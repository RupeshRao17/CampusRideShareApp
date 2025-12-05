import { supabase } from '@lib/firebase';

export function listenChat(chatId: string, cb: (messages: any[]) => void) {
  let stopped = false;
  const fetchAndNotify = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (!stopped) {
      cb(
        (data || []).map((d: any) => ({
          id: d.id,
          senderId: d.sender_id,
          receiverId: d.receiver_id,
          message: d.message,
          timestamp: d.created_at,
        }))
      );
    }
  };
  fetchAndNotify();
  const channel = supabase
    .channel(`messages:${chatId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      () => fetchAndNotify()
    )
    .subscribe();
  return () => {
    stopped = true;
    supabase.removeChannel(channel);
  };
}

export async function sendMessage(chatId: string, data: { senderId: string; receiverId: string; message: string }) {
  const { error } = await supabase.from('messages').insert({
    chat_id: chatId,
    sender_id: data.senderId,
    receiver_id: data.receiverId,
    message: data.message,
  });
  if (error) throw error;
}

export function listenUserChats(userId: string, cb: (items: any[]) => void) {
  let stopped = false;
  const fetchAndNotify = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    const rows = data || [];
    const byChat: Record<string, any> = {};
    const peerIds = new Set<string>();
    for (const m of rows) {
      if (!byChat[m.chat_id]) {
        const peerId = m.sender_id === userId ? m.receiver_id : m.sender_id;
        byChat[m.chat_id] = {
          id: m.chat_id,
          lastMessage: m.message,
          timestamp: m.created_at,
          peerId,
        };
        if (peerId) peerIds.add(peerId);
      }
    }
    let profiles: Record<string, any> = {};
    if (peerIds.size > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id,name,department,year,rating')
        .in('id', Array.from(peerIds));
      for (const p of profs || []) profiles[p.id] = p;
    }
    const items = Object.values(byChat).map((c: any) => ({
      id: c.id,
      userId: c.peerId,
      userName: profiles[c.peerId]?.name || 'User',
      lastMessage: c.lastMessage,
      timestamp: new Date(c.timestamp).toLocaleString(),
      unreadCount: 0,
      userDepartment: profiles[c.peerId]?.department || '',
      userYear: profiles[c.peerId]?.year || '',
      userRating: profiles[c.peerId]?.rating || '5.0',
      userInitial: (profiles[c.peerId]?.name || 'U').charAt(0).toUpperCase(),
      verified: true,
    }));
    if (!stopped) cb(items);
  };
  fetchAndNotify();
  const channel = supabase
    .channel('messages:user')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchAndNotify())
    .subscribe();
  return () => {
    stopped = true;
    supabase.removeChannel(channel);
  };
}
