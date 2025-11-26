import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock Auth State
const mockProfile = {
  name: 'Rupesh',
  gender: 'Any'
};

type TabType = 'rides' | 'trains';

export default function ModernHomeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('rides');
  const [searchFocused, setSearchFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const placeholderRides = [
    {
      id: '1',
      driverName: 'Alex Sharma',
      driverInitial: 'A',
      from: 'SIES College',
      to: 'Vashi Station',
      departureTime: '08:00 AM',
      arrivalTime: '08:30 AM',
      seats: 3,
      price: 50,
      rating: 4.8,
      trips: 127,
      verified: true,
      instantBook: true,
      carModel: 'Hyundai i20',
      carColor: 'White'
    },
    {
      id: '2',
      driverName: 'Priya Patel',
      driverInitial: 'P',
      from: 'Nerul Station',
      to: 'Seawoods',
      departureTime: '05:15 PM',
      arrivalTime: '05:40 PM',
      seats: 2,
      price: 40,
      rating: 4.9,
      trips: 203,
      verified: true,
      instantBook: false,
      carModel: 'Maruti Swift',
      carColor: 'Red'
    }
  ];

  const placeholderTrains = [
    {
      id: '1',
      passengerName: 'Rahul Verma',
      passengerInitial: 'R',
      trainName: 'Harbour Line',
      from: 'CST',
      to: 'Panvel',
      station: 'Nerul',
      departureTime: '08:45 AM',
      arrivalTime: '09:30 AM',
      passengers: 2,
      rating: 4.7,
      verified: true,
      coach: 'First Class'
    },
    {
      id: '2',
      passengerName: 'Sneha Joshi',
      passengerInitial: 'S',
      trainName: 'Trans-Harbour',
      from: 'Thane',
      to: 'Nerul',
      station: 'Seawoods',
      departureTime: '06:30 PM',
      arrivalTime: '07:15 PM',
      passengers: 1,
      rating: 4.9,
      verified: true,
      coach: 'General'
    }
  ];

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hello, {mockProfile.name} 👋</Text>
              <Text style={styles.subtitle}>Ready for your next journey?</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>{mockProfile.name[0].toUpperCase()}</Text>
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
                <Text style={styles.sectionSubtitle}>{placeholderRides.length} rides nearby • Updated just now</Text>
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>
            </View>

            {placeholderRides.map((ride, index) => (
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
                        <Text style={styles.avatarText}>{ride.driverInitial}</Text>
                      </View>
                      {ride.verified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedIcon}>✓</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.driverDetails}>
                      <Text style={styles.driverName}>{ride.driverName}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.ratingPill}>
                          <Text style={styles.ratingStar}>★</Text>
                          <Text style={styles.ratingText}>{ride.rating}</Text>
                        </View>
                        <View style={styles.carInfo}>
                          <Text style={styles.carText}>{ride.carModel}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.priceSection}>
                    <Text style={styles.priceAmount}>₹{ride.price}</Text>
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
                    {/* Departure */}
                    <View style={styles.locationRow}>
                      <View style={styles.locationContent}>
                        <Text style={styles.locationText}>{ride.from}</Text>
                      </View>
                      <Text style={styles.timeText}>{ride.departureTime}</Text>
                    </View>
                    
                    {/* Destination */}
                    <View style={styles.locationRow}>
                      <View style={styles.locationContent}>
                        <Text style={styles.locationText}>{ride.to}</Text>
                      </View>
                      <Text style={styles.timeText}>{ride.arrivalTime}</Text>
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
                              i < ride.seats ? styles.seatAvailable : styles.seatUnavailable
                            ]} 
                          />
                        ))}
                      </View>
                      <Text style={styles.seatsText}>{ride.seats} seats left</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.primaryButton, styles.buttonElevated]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>
                      {ride.instantBook ? 'Book Now' : 'Request'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Train Connections</Text>
                <Text style={styles.sectionSubtitle}>{placeholderTrains.length} buddies available • Same route</Text>
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>
            </View>

            {placeholderTrains.map((train) => (
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
                        <Text style={styles.avatarText}>{train.passengerInitial}</Text>
                      </View>
                      {train.verified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedIcon}>✓</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.driverDetails}>
                      <Text style={styles.driverName}>{train.passengerName}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.ratingPill}>
                          <Text style={styles.ratingStar}>★</Text>
                          <Text style={styles.ratingText}>{train.rating}</Text>
                        </View>
                        <Text style={styles.tripCount}>{train.passengers} {train.passengers === 1 ? 'traveler' : 'travelers'}</Text>
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
                        <Text style={styles.trainRoute}>{train.from} → {train.to}</Text>
                        <View style={styles.coachBadge}>
                          <Text style={styles.coachText}>{train.coach}</Text>
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
                    {/* Departure */}
                    <View style={styles.locationRow}>
                      <View style={styles.locationContent}>
                        <Text style={styles.locationText}>{train.station} Station</Text>
                      </View>
                      <Text style={styles.timeText}>{train.departureTime}</Text>
                    </View>
                    
                    {/* Destination */}
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