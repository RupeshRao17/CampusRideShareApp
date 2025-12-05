import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useAuthState } from '@lib/firebase';
import { useNavigation } from '@react-navigation/native';

export default function ChatsScreen() {
  const navigation = useNavigation();
  const { profile } = useAuthState();
  const [chats, setChats] = useState<any[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Placeholder chat data
  const placeholderChats = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Alex Sharma',
      lastMessage: 'Hey, are we still meeting at 5?',
      timestamp: '2 min ago',
      unreadCount: 2,
      userDepartment: 'Computer Engineering',
      userYear: '3rd Year',
      userRating: 4.8,
      userInitial: 'A',
      verified: true
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Priya Patel',
      lastMessage: 'Thanks for the ride yesterday! 🚗',
      timestamp: '1 hour ago',
      unreadCount: 0,
      userDepartment: 'Electronics',
      userYear: '2nd Year',
      userRating: 4.9,
      userInitial: 'P',
      verified: true
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Rahul Verma',
      lastMessage: 'I\'ll be waiting at the main gate',
      timestamp: '3 hours ago',
      unreadCount: 1,
      userDepartment: 'Mechanical',
      userYear: '4th Year',
      userRating: 4.7,
      userInitial: 'R',
      verified: false
    },
    {
      id: '4',
      userId: 'user4',
      userName: 'Sneha Joshi',
      lastMessage: 'Can we reschedule for tomorrow?',
      timestamp: 'Yesterday',
      unreadCount: 0,
      userDepartment: 'IT Engineering',
      userYear: '2nd Year',
      userRating: 4.9,
      userInitial: 'S',
      verified: true
    }
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const displayChats = chats.length > 0 ? chats : placeholderChats;

  const handleChatPress = (chat: any) => {
    navigation.navigate('ChatRoom' as never, {
      chatId: chat.id,
      userName: chat.userName,
    } as never);
  };

  return (
    <View style={styles.container}>
      {/* Header with Blue Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Messages 💬</Text>
              <Text style={styles.subtitle}>Connect with your ride partners</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity style={styles.searchBox}>
            <View style={styles.searchIcon}>
              <Text style={styles.searchIconText}>🔍</Text>
            </View>
            <Text style={styles.searchPlaceholder}>Search conversations...</Text>
            <View style={styles.searchAction}>
              <Text style={styles.searchActionText}>Search</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chats List with Animation */}
      <Animated.ScrollView 
        style={[styles.content, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recent Chats</Text>
            <Text style={styles.sectionSubtitle}>{displayChats.length} conversations • Active now</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {displayChats.map((chat, index) => (
          <TouchableOpacity 
            key={chat.id}
            style={[styles.modernCard, styles.cardElevated]}
            onPress={() => handleChatPress(chat)}
            activeOpacity={0.9}
            delayPressIn={50}
          >
            {/* Top Section - Profile in line 1 */}
            <View style={styles.cardTopSection}>
              <View style={styles.userRow}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, styles.avatarGradient]}>
                    <Text style={styles.avatarText}>{chat.userInitial}</Text>
                  </View>
                  {chat.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedIcon}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{chat.userName}</Text>
                  {/* Line 2 - Rating and Department */}
                  <View style={styles.metaRow}>
                    <View style={styles.ratingPill}>
                      <Text style={styles.ratingStar}>⭐</Text>
                      <Text style={styles.ratingText}>{chat.userRating}</Text>
                    </View>
                    <View style={styles.departmentBadge}>
                      <Text style={styles.departmentText}>{chat.userDepartment}</Text>
                    </View>
                    <Text style={styles.userYear}>{chat.userYear}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.timeSection}>
                <Text style={styles.timestamp}>{chat.timestamp}</Text>
                {chat.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Line 3 - Recent Chat Message Only */}
            <View style={styles.messageSection}>
              <Text style={styles.lastMessage} numberOfLines={2}>
                {chat.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpace} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Header
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#DBEAFE',
    fontWeight: '500',
  },
  profileButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#60A5FA',
  },
  profileInitial: {
    color: '#2563EB',
    fontSize: 20,
    fontWeight: '800',
  },
  
  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchIconText: {
    fontSize: 20,
    opacity: 0.7,
  },
  searchPlaceholder: {
    fontSize: 17,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  searchAction: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  searchActionText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '700',
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  
  // Modern Cards - Narrower
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginHorizontal: 4,
  },
  cardElevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  
  // Card Top Section
  cardTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGradient: {
    backgroundColor: '#2563EB',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedIcon: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingStar: {
    fontSize: 10,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  departmentBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  departmentText: {
    fontSize: 11,
    color: '#3730A3',
    fontWeight: '600',
  },
  userYear: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  
  // Time Section
  timeSection: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  
  // Message Section
  messageSection: {
    // No extra styling needed - just contains the message
  },
  lastMessage: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    lineHeight: 18,
  },
  
  bottomSpace: {
    height: 80,
  },
});
