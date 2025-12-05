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
