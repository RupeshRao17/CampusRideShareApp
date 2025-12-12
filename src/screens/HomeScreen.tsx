import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { useAuthState, supabase } from '@lib/firebase';
import { getActiveRides, getActiveTrainPosts, requestRide } from '@services/data';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


type TabType = 'rides' | 'trains';

export default function ModernHomeScreen() {
  const navigation = useNavigation();
  const { user, profile } = useAuthState();
  const [activeTab, setActiveTab] = useState<TabType>('rides');
  const [searchFocused, setSearchFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [rides, setRides] = useState<any[]>([]);
  const [trains, setTrains] = useState<any[]>([]);
  const [driverProfiles, setDriverProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!profile?.gender) return;
    const unsub = getActiveRides(profile.gender, setRides);
    return () => unsub();
  }, [profile?.gender]);

  useEffect(() => {
    const unsub = getActiveTrainPosts(setTrains);
    return () => unsub();
  }, []);

  useEffect(() => {
    const ids = Array.from(new Set(rides.map((r) => r.driverId).filter(Boolean)));
    if (ids.length === 0) {
      setDriverProfiles({});
      return;
    }
    supabase
      .from('profiles')
      .select('id,department,year,rating')
      .in('id', ids)
      .then(({ data }) => {
        const map: Record<string, any> = {};
        for (const p of data || []) map[p.id] = p;
        setDriverProfiles(map);
      });
  }, [rides]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleRequestRide = async (ride: any) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to request a ride');
      return;
    }
    try {
      await requestRide({ id: ride.id, driverId: ride.driverId }, { id: user.uid, name: profile?.name || 'User' });
      Alert.alert('Request Sent', 'The driver has been notified');
    } catch (e) {
      Alert.alert('Error', 'Could not send request');
    }
  };

  const handleChatWithDriver = (ride: any) => {
    const chatId = `ride_${ride.id}_${user?.uid || 'guest'}_${ride.driverId}`;
    (navigation as any).navigate('ChatRoom', { chatId, userName: ride.driverName, receiverId: ride.driverId });
  };

  const handleConnectTrain = (train: any) => {
    const chatId = `train_${train.id}_${user?.uid || 'guest'}_${train.userId}`;
    (navigation as any).navigate('ChatRoom', { chatId, userName: train.userName, receiverId: train.userId });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hello, {profile?.name || 'User'} 👋</Text>
              <Text style={styles.subtitle}>Ready for your next journey?</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>{(profile?.name || 'U')[0].toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <TouchableOpacity 
            style={[styles.searchBox, searchFocused && styles.searchBoxFocused]}
            onPressIn={() => setSearchFocused(true)}
            activeOpacity={0.9}
          >
            <View style={styles.searchIcon}>
              <Text style={styles.searchIconText}>🔍</Text>
            </View>
            <Text style={styles.searchPlaceholder}>Where to?</Text>
            <View style={styles.searchAction}>
              <Text style={styles.searchActionText}>Search</Text>
            </View>
          </TouchableOpacity>

          {/* Tab Navigation */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'rides' && styles.tabPillActive]}
              onPress={() => handleTabChange('rides')}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Text style={[styles.tabPillText, activeTab === 'rides' && styles.tabPillTextActive]}>
                  Rides
                </Text>
                {activeTab === 'rides' && <View style={styles.activeIndicator} />}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'trains' && styles.tabPillActive]}
              onPress={() => handleTabChange('trains')}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Text style={[styles.tabPillText, activeTab === 'trains' && styles.tabPillTextActive]}>
                  Train Buddies
                </Text>
                {activeTab === 'trains' && <View style={styles.activeIndicator} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <Animated.ScrollView 
        style={[styles.content, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'rides' ? (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Available Rides</Text>
                <Text style={styles.sectionSubtitle}>{rides.length} rides nearby</Text>
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>
            </View>
            {rides.map((ride, index) => (
              <TouchableOpacity 
                key={ride.id} 
                style={[styles.modernCard, styles.cardElevated]}
                activeOpacity={0.9}
                delayPressIn={50}
              >
                {/* Top Section */}
                <View style={styles.cardTopSection}>
                  <View style={styles.driverRow}>
                    <View style={styles.avatarContainer}>
                      <View style={[styles.avatar, styles.avatarGradient]}>
                        <Text style={styles.avatarText}>{(ride.driverName || 'U')[0].toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.driverDetails}>
                      <Text style={styles.driverName}>{ride.driverName}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.ratingPill}>
                          <Text style={styles.ratingStar}>★</Text>
                          <Text style={styles.ratingText}>{driverProfiles[ride.driverId]?.rating || '5.0'}</Text>
                        </View>
                        <View style={styles.carInfo}>
                          <Text style={styles.carText}>{driverProfiles[ride.driverId]?.department || ''}</Text>
                        </View>
                        <Text style={styles.tripCount}>{driverProfiles[ride.driverId]?.year || ''}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.priceSection}>
                    <Text style={styles.priceAmount}>₹{ride.cost}</Text>
                    <Text style={styles.priceLabel}>per seat</Text>
                  </View>
                </View>

                {/* Simple Route Section */}
                <View style={styles.routeSection}>
                  <View style={styles.timeline}>
                    <View style={styles.timelineItem}>
                      <View style={styles.timelineDot} />
                    </View>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineItem}>
                      <View style={styles.locationIconContainer}>
                        <Text style={styles.locationIcon}>📍</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.routeInfo}>
                    <View style={styles.locationRow}>
                      <View style={styles.locationContent}>
                        <Text style={styles.locationText}>{ride.from}</Text>
                      </View>
                      <Text style={styles.timeText}>{(ride.time || '').split(' - ')[0]}</Text>
                    </View>
                    
                    <View style={styles.locationRow}>
                      <View style={styles.locationContent}>
                        <Text style={styles.locationText}>{ride.to}</Text>
                      </View>
                      <Text style={styles.timeText}>{(ride.time || '').split(' - ')[1]}</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Section */}
                <View style={styles.cardBottomSection}>
                  <View style={styles.leftMeta}>
                    <View style={styles.seatsContainer}>
                      <View style={styles.seatsIndicator}>
                        {[...Array(3)].map((_, i) => (
                          <View 
                            key={i} 
                            style={[
                              styles.seatDot, 
                              i < (ride.availableSeats || 0) ? styles.seatAvailable : styles.seatUnavailable
                            ]} 
                          />
                        ))}
                      </View>
                      <Text style={styles.seatsText}>{ride.availableSeats} seats left</Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity 
                      style={[styles.secondaryButton]}
                      activeOpacity={0.8}
                      onPress={() => handleChatWithDriver(ride)}
                    >
                      <Text style={styles.secondaryButtonText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.primaryButton, styles.buttonElevated]}
                      activeOpacity={0.8}
                      onPress={() => handleRequestRide(ride)}
                    >
                      <Text style={styles.primaryButtonText}>Request</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Train Connections</Text>
                <Text style={styles.sectionSubtitle}>{trains.length} buddies available • Same route</Text>
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>
            </View>

            {trains.map((train) => (
              <TouchableOpacity 
                key={train.id} 
                style={[styles.modernCard, styles.cardElevated]}
                activeOpacity={0.9}
              >
                {/* Top Section */}
                <View style={styles.cardTopSection}>
                  <View style={styles.driverRow}>
                    <View style={styles.avatarContainer}>
                      <View style={[styles.avatar, styles.avatarGradientSecondary]}>
                        <Text style={styles.avatarText}>{(train.userName || 'U')[0].toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.driverDetails}>
                      <Text style={styles.driverName}>{train.userName}</Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.tripCount}>{train.passengersCount} {train.passengersCount === 1 ? 'traveler' : 'travelers'}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Train Badge */}
                <View style={styles.trainBadgeContainer}>
                  <View style={styles.trainBadge}>
                    <View style={styles.trainIcon}>
                      <Text style={styles.trainEmoji}>🚆</Text>
                    </View>
                    <View style={styles.trainDetails}>
                      <Text style={styles.trainName}>{train.trainName}</Text>
                      <View style={styles.trainMeta}>
                        <Text style={styles.trainRoute}>{train.fromStation} → {train.toStation}</Text>
                        <View style={styles.coachBadge}>
                          <Text style={styles.coachText}>General</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Simple Route Section */}
                <View style={styles.routeSection}>
                  <View style={styles.timeline}>
                    <View style={styles.timelineItem}>
                      <View style={styles.timelineDot} />
                    </View>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineItem}>
                      <View style={styles.locationIconContainer}>
                        <Text style={styles.locationIcon}>📍</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.routeInfo}>
                    <View style={styles.locationRow}>
                      <View style={styles.locationContent}>
                        <Text style={styles.locationText}>{train.arrivalStation} Station</Text>
                      </View>
                      <Text style={styles.timeText}>{train.arrivalTime}</Text>
                    </View>
                    
                    <View style={styles.locationRow}>
                      <View style={styles.locationContent}>
                        <Text style={styles.locationText}>Traveling together</Text>
                      </View>
                      <Text style={styles.timeText}>{train.arrivalTime}</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Section */}
                <View style={styles.cardBottomSection}>
                  <View style={styles.leftMeta}>
                    <Text style={styles.trainMetaText}>🎫 Local train • 🤝 Travel together</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.primaryButton, styles.buttonElevated, styles.connectButton]}
                    activeOpacity={0.8}
                    onPress={() => handleConnectTrain(train)}
                  >
                    <Text style={styles.primaryButtonText}>Connect</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

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
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchBoxFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#60A5FA',
    borderWidth: 2,
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
  
  // Tabs
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 4,
  },
  tabPill: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  tabPillActive: {
    backgroundColor: '#FFFFFF',
  },
  tabContent: {
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabPillText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DBEAFE',
  },
  tabPillTextActive: {
    color: '#1E40AF',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 3,
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 15,
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
  
  // Cards
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  cardElevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  
  // Card Top Section
  cardTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
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
  },
  avatarGradient: {
    backgroundColor: '#2563EB',
  },
  avatarGradientSecondary: {
    backgroundColor: '#7C3AED',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  verifiedIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingStar: {
    color: '#F59E0B',
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  tripCount: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  carInfo: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  carText: {
    fontSize: 12,
    color: '#3730A3',
    fontWeight: '600',
  },
  
  // Price Section
  priceSection: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2563EB',
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  
  // Simple Route Section - Fixed Alignment
  routeSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  timelineItem: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  locationIconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIcon: {
    fontSize: 16,
  },
  routeInfo: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 24,
    marginBottom: 18,
  },
  locationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  
  // Card Bottom
  cardBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seatsIndicator: {
    flexDirection: 'row',
    gap: 3,
  },
  seatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  seatAvailable: {
    backgroundColor: '#10B981',
  },
  seatUnavailable: {
    backgroundColor: '#E2E8F0',
  },
  seatsText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  trainMetaText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonElevated: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  connectButton: {
    backgroundColor: '#7C3AED',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '700',
  },
  
  // Train Styles
  trainBadgeContainer: {
    marginBottom: 16,
  },
  trainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  trainIcon: {
    marginRight: 12,
  },
  trainEmoji: {
    fontSize: 24,
  },
  trainDetails: {
    flex: 1,
  },
  trainName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 2,
  },
  trainMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trainRoute: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  coachBadge: {
    backgroundColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  coachText: {
    fontSize: 12,
    color: '#3730A3',
    fontWeight: '700',
  },
  
  bottomSpace: {
    height: 120,
  },
});
