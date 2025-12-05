import { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Animated 
} from 'react-native';
import { listenChat, sendMessage } from '@services/chat';
import { useAuthState } from '@lib/firebase';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ChatRoomScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const chatId = route.params?.chatId || 'demo';
  const userName = route.params?.userName || 'User';
  const { user, profile } = useAuthState();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const unsub = listenChat(chatId, setMessages);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    return () => unsub();
  }, [chatId]);

  // Placeholder messages for demo
  const placeholderMessages = [
    {
      id: '1',
      senderId: 'other',
      message: 'Hi! Are you available for the ride tomorrow?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      senderId: user?.uid,
      message: 'Yes, I can give you a ride. What time works for you?',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: '3',
      senderId: 'other',
      message: 'Around 5 PM would be perfect for me 🕔',
      timestamp: new Date(Date.now() - 3400000).toISOString(),
    },
    {
      id: '4',
      senderId: user?.uid,
      message: 'Great! I\'ll pick you up from SIES main gate at 5 PM',
      timestamp: new Date(Date.now() - 3300000).toISOString(),
    },
    {
      id: '5',
      senderId: 'other',
      message: 'Sounds good. Looking forward to it! 😊',
      timestamp: new Date(Date.now() - 3200000).toISOString(),
    },
  ];

  const displayMessages = messages.length > 0 ? messages : placeholderMessages;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSend = () => {
    if (!user || !text.trim()) return;
    sendMessage(chatId, { 
      senderId: user.uid, 
      receiverId: 'peer', 
      message: text.trim(),
    });
    setText('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.leftButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.icon}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Chat</Text>
        
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Header with User Info */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, styles.avatarGradient]}>
                <Text style={styles.avatarText}>
                  {userName?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.statusIndicator} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userName}</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>Online</Text>
                </View>
                <Text style={styles.lastSeen}>Active now</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Messages List with Animation */}
      <Animated.View 
        style={[
          styles.messagesContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <FlatList
          data={displayMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[
              styles.messageRow,
              item.senderId === user?.uid ? styles.sentRow : styles.receivedRow
            ]}>
              <View style={styles.messageContent}>
                <View style={[
                  styles.messageBubble,
                  item.senderId === user?.uid ? styles.sentBubble : styles.receivedBubble,
                  styles.bubbleElevated
                ]}>
                  <Text style={[
                    styles.messageText,
                    item.senderId === user?.uid ? styles.sentText : styles.receivedText
                  ]}>
                    {item.message}
                  </Text>
                </View>
                <Text style={styles.timestamp}>
                  {formatTime(item.timestamp)}
                </Text>
              </View>
            </View>
          )}
        />
      </Animated.View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput 
            value={text}
            onChangeText={setText}
            placeholder="Type your message..."
            placeholderTextColor="#94A3B8"
            style={styles.textInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, styles.buttonElevated, !text.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Text style={styles.sendButtonText}>
              {text.trim() ? 'Send' : '✏️'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {text.length > 0 && (
          <Text style={styles.charCount}>
            {text.length}/500
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Top Bar
  topBar: {
    paddingTop:35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  leftButton: {
    padding: 8,
  },
  icon: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Header
  header: {
    backgroundColor: '#2563EB',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarGradient: {
    backgroundColor: '#FFFFFF',
  },
  avatarText: {
    color: '#2563EB',
    fontSize: 20,
    fontWeight: '800',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  lastSeen: {
    fontSize: 12,
    color: '#DBEAFE',
    fontWeight: '500',
  },
  
  // Rest of the styles remain the same...
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageRow: {
    marginVertical: 6,
    maxWidth: '85%',
  },
  sentRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  receivedRow: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageContent: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 4,
  },
  bubbleElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sentBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 6,
  },
  receivedBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  messageText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  sentText: {
    color: '#FFFFFF',
  },
  receivedText: {
    color: '#0F172A',
  },
  timestamp: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginHorizontal: 8,
  },
  
  // Input Area
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
    maxHeight: 100,
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 2,
  },
  buttonElevated: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowColor: '#CBD5E0',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  charCount: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
});
