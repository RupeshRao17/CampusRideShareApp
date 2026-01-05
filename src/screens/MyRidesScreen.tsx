import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { getRideRequestsForDriver, acceptRideAndCreateBooking, denyRideRequest, getMyBookings, submitRating, cancelBooking, deleteRide } from '@services/data';
import { useNavigation } from '@react-navigation/native';
import { getMyRides } from '@services/data';
import { useAuthState, supabase, listenCollection } from '@lib/firebase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'upcoming' | 'past' | 'posted';

export default function MyRidesScreen() {
  const navigation = useNavigation();
  const { user, profile } = useAuthState();
  const [rides, setRides] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [rideMap, setRideMap] = useState<Record<string, any>>({});
  const [driverProfiles, setDriverProfiles] = useState<Record<string, any>>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (!user) return;
    const unsub = getMyRides(user.uid, setRides);
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (!user) return;
    const unsub = getRideRequestsForDriver(user.uid, setRequests);
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (!user) return;
    const unsub = getMyBookings(user.uid, setBookings);
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    const unsub = listenCollection('rides', (docs) => {
      const map: Record<string, any> = {};
      for (const d of docs) map[d.id] = d;
      setRideMap(map);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const driverIds = Array.from(new Set((bookings || [])
      .map((b: any) => rideMap[b.rideId]?.driverId)
      .filter(Boolean)));
    if (driverIds.length === 0) {
      setDriverProfiles({});
      return;
    }
    supabase
      .from('profiles')
      .select('id,department,year,rating')
      .in('id', driverIds)
      .then(({ data }) => {
        const map: Record<string, any> = {};
        for (const p of data || []) map[p.id] = p;
        setDriverProfiles(map);
      });
  }, [bookings, rideMap]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab]);

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

  // Filter rides based on active tab
  const bookedRides: any[] = bookings.map((b) => {
    const ride = rideMap[b.rideId] || rides.find((r) => r.id === b.rideId) || {};
    const driverName = ride.driverName || '';
    const driverId = b.driverId;
    const profile = driverId ? driverProfiles[driverId] : undefined;
    return {
      id: b.id,
      from: ride.from || '',
      to: ride.to || '',
      date: b.date,
      time: b.time,
      status: String(b.status || '').toLowerCase(),
      cost: ride.cost || 0,
      driverName,
      driverInitial: (driverName || 'U')[0]?.toUpperCase?.() || 'U',
      rating: profile?.rating || '5.0',
      carModel: profile?.department || '',
      driverId: b.driverId,
      passengerId: b.passengerId,
    };
  });
  const postedRides = rides;

  const filteredBookedRides = bookedRides.filter((ride) => {
    const [start, end] = String(ride.time || '').split(' - ');
    const [dd, mm, yyyy] = String(ride.date || '').split('/').map((x: any) => parseInt(x, 10));
    const [eh, em] = (end || '').split(':').map((x: any) => parseInt(x, 10));
    const endTs = (!isNaN(dd) && !isNaN(mm) && !isNaN(yyyy)) ? new Date(yyyy, (mm || 1) - 1, dd || 1, eh || 0, em || 0).getTime() : 0;
    const isUpcoming = endTs === 0 || endTs > Date.now();
    return activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
  });

  const displayBookedRides = filteredBookedRides;
  const displayPostedRides = postedRides;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'completed':
        return '#3B82F6';
      case 'cancelled':
      case 'expired':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'active':
        return '🟢';
      case 'pending':
        return '⏳';
      case 'completed':
        return '🎉';
      case 'cancelled':
        return '❌';
      case 'expired':
        return '⏰';
      default:
        return '📅';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return 'Upcoming';
    }
  };

  const handleChatWithRider = (ride: any) => {
    const chatId = `ride_${ride.id}_${user?.uid || 'guest'}_${ride.driverId}`;
    (navigation as any).navigate('ChatRoom', { chatId, userName: ride.driverName, receiverId: ride.driverId });
  };

  const handleCancelRide = async (ride: any) => {
    if (!user) return;
    const myBooking = (bookings || []).find((b: any) => b.id === ride.id || (b.rideId === ride.id && b.passengerId === user.uid && String(b.status).toUpperCase() === 'CONFIRMED'));
    if (!myBooking) {
      Alert.alert('No Booking', 'Could not find your booking to cancel');
      return;
    }
    try {
      await cancelBooking(Number(myBooking.id));
      Alert.alert('Cancelled', 'Your booking has been cancelled');
    } catch (e) {
      Alert.alert('Error', 'Could not cancel booking');
    }
  };

  // legacy no-op retained
  const handleRateRideLegacy = (_ride: any) => {};

  const handleManageRide = (ride: any) => {
    if (!user) return;
    const confirmedForRide = (bookings || []).filter((b: any) => b.rideId === ride.id && b.driverId === user.uid && String(b.status).toUpperCase() === 'CONFIRMED');
    const cancelAction = async () => {
      if (confirmedForRide.length === 0) {
        Alert.alert('No confirmed bookings');
        return;
      }
      try {
        await cancelBooking(Number(confirmedForRide[0].id));
        Alert.alert('Cancelled', 'Passenger booking has been cancelled');
      } catch (e) {
        Alert.alert('Error', 'Could not cancel booking');
      }
    };
    const deleteAction = async () => {
      try {
        await deleteRide(ride.id);
        Alert.alert('Deleted', 'Ride has been deleted');
      } catch (e) {
        Alert.alert('Error', 'Could not delete ride');
      }
    };
    Alert.alert('Manage Ride', 'Choose an action', [
      { text: 'Cancel Booking', onPress: cancelAction },
      { text: 'Delete Ride', style: 'destructive', onPress: deleteAction },
      { text: 'Close', style: 'cancel' },
    ]);
  };

  const handleChatWithPassenger = (req: any) => {
    const chatId = `ride_${req.rideId}_${req.passengerId}_${user?.uid}`;
    (navigation as any).navigate('ChatRoom', { chatId, userName: req.passengerName, receiverId: req.passengerId });
  };

  const handleAcceptRequest = async (req: any) => {
    try {
      await acceptRideAndCreateBooking({ id: req.id, rideId: req.rideId, driverId: req.driverId, passengerId: req.passengerId });
    } catch (e) {}
  };

  const handleDenyRequest = async (req: any) => {
    try {
      await denyRideRequest({ id: req.id });
    } catch (e) {}
  };

  const handleRateRide = async (ride: any) => {
    const isDriver = ride.driverId === user?.uid;
    const rateeId = isDriver ? ride.passengerId : ride.driverId;
    if (!user || !rateeId) return;
    Alert.alert('Rate Ride', 'Select a rating', [
      { text: '⭐ 3', onPress: async () => { await submitRating(ride.id, user.uid, rateeId, 3); } },
      { text: '⭐ 4', onPress: async () => { await submitRating(ride.id, user.uid, rateeId, 4); } },
      { text: '⭐ 5', onPress: async () => { await submitRating(ride.id, user.uid, rateeId, 5); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header - Matching Home Screen */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>My Rides</Text>
              <Text style={styles.subtitle}>Manage your bookings and history</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Tab Navigation - Same as Home Screen */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'upcoming' && styles.tabPillActive]}
              onPress={() => handleTabChange('upcoming')}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Text style={[styles.tabPillText, activeTab === 'upcoming' && styles.tabPillTextActive]}>
                  Upcoming
                </Text>
                {activeTab === 'upcoming' && <View style={styles.activeIndicator} />}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'past' && styles.tabPillActive]}
              onPress={() => handleTabChange('past')}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Text style={[styles.tabPillText, activeTab === 'past' && styles.tabPillTextActive]}>
                  Past
                </Text>
                {activeTab === 'past' && <View style={styles.activeIndicator} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'posted' && styles.tabPillActive]}
              onPress={() => handleTabChange('posted')}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Text style={[styles.tabPillText, activeTab === 'posted' && styles.tabPillTextActive]}>
                  Posted
                </Text>
                {activeTab === 'posted' && <View style={styles.activeIndicator} />}
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
        {activeTab === 'posted' ? (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>My Posted Rides</Text>
                <Text style={styles.sectionSubtitle}>{displayPostedRides.length} posted rides</Text>
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>
            </View>

            {displayPostedRides.map((ride, index) => (
              <TouchableOpacity 
                key={ride.id} 
                style={[styles.modernCard, styles.cardElevated]}
                activeOpacity={0.9}
              >
                
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status) + '20' }]}>
                  <Text style={styles.statusIcon}>{getStatusIcon(ride.status)}</Text>
                  <Text style={[styles.statusText, { color: getStatusColor(ride.status) }]}>
                    {getStatusText(ride.status)}
                  </Text>
                </View>

                {/* Route Section - Same as Home Screen */}
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
                      <Text style={styles.timeText}>{ride.time.split(' - ')[0]}</Text>
                    </View>
                    
                    <View style={styles.locationRow}>
                      <View style={styles.locationContent}>
                        <Text style={styles.locationText}>{ride.to}</Text>
                      </View>
                      <Text style={styles.timeText}>{ride.time.split(' - ')[1]}</Text>
                    </View>
                  </View>
                </View>

                {/* Ride Details */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>📅</Text>
                    <View>
                      <Text style={styles.detailLabel}>Date</Text>
                      <Text style={styles.detailValue}>{ride.date}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>💺</Text>
                    <View>
                      <Text style={styles.detailLabel}>Seats Available</Text>
                      <Text style={styles.detailValue}>{ride.availableSeats}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>💰</Text>
                    <View>
                      <Text style={styles.detailLabel}>Price</Text>
                      <Text style={styles.costValue}>₹{ride.cost}</Text>
                    </View>
                  </View>
                </View>

                {/* Incoming Requests */}
                {requests.filter((r) => r.rideId === ride.id && r.status === 'PENDING').length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8 }}>Requests</Text>
                    {requests.filter((r) => r.rideId === ride.id && r.status === 'PENDING').map((r) => (
                      <View key={r.id} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                          <View style={[styles.avatar, styles.avatarGradientSecondary, { width: 36, height: 36, borderRadius: 18, marginRight: 10 }]}>
                            <Text style={styles.avatarText}>{(r.passengerName || 'U')[0].toUpperCase()}</Text>
                          </View>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{r.passengerName}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity 
                            style={[styles.secondaryButton, { flex: 1, paddingVertical: 10, paddingHorizontal: 4 }]} 
                            onPress={() => handleChatWithPassenger(r)}
                          >
                            <Text style={styles.secondaryButtonText}>Chat</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.primaryButton, styles.buttonElevated, { flex: 1, paddingVertical: 10, paddingHorizontal: 4 }]} 
                            onPress={() => handleAcceptRequest(r)}
                          >
                            <Text style={styles.primaryButtonText}>Accept</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.cancelButton, { flex: 1, paddingVertical: 10, paddingHorizontal: 4 }]} 
                            onPress={() => handleDenyRequest(r)}
                          >
                            <Text style={styles.cancelButtonText}>Deny</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
}
                  </View>
                )}

                {/* Passengers */}
                {Array.isArray((ride as any).passengers) && (ride as any).passengers.length > 0 && (
                  <View style={styles.passengersSection}>
                    <Text style={styles.passengersTitle}>Passengers ({ride.passengers.length})</Text>
                    <View style={styles.passengersList}>
                      {ride.passengers.map((passenger: any, index: number) => (
                        <View key={index} style={styles.passengerItem}>
                          <View style={styles.avatarContainer}>
                            <View style={[styles.avatar, styles.avatarGradientSecondary]}>
                              <Text style={styles.avatarText}>{passenger.initial}</Text>
                            </View>
                          </View>
                          <View style={styles.passengerInfo}>
                            <Text style={styles.passengerName}>{passenger.name}</Text>
                            <View style={styles.ratingPill}>
                              <Text style={styles.ratingStar}>★</Text>
                              <Text style={styles.ratingText}>{passenger.rating}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Action Button */}
                <TouchableOpacity 
                  style={[styles.primaryButton, styles.buttonElevated]}
                  onPress={() => handleManageRide(ride)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Manage Ride</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  {activeTab === 'upcoming' ? 'Upcoming Rides' : 'Past Rides'}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {displayBookedRides.length} {activeTab === 'upcoming' ? 'upcoming' : 'completed'} rides
                </Text>
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>Filter</Text>
              </TouchableOpacity>
            </View>
            
            {displayBookedRides.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>
                  {activeTab === 'upcoming' ? '🚗' : '📝'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {activeTab === 'upcoming' 
                    ? 'No upcoming rides' 
                    : 'No past rides'
                  }
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {activeTab === 'upcoming'
                    ? 'Book a ride to see it here'
                    : 'Your completed rides will appear here'
                  }
                </Text>
              </View>
            ) : (
              displayBookedRides.map((ride, index) => (
                <TouchableOpacity 
                  key={ride.id} 
                  style={[styles.modernCard, styles.cardElevated]}
                  activeOpacity={0.9}
                >
                  {ride.isPlaceholder && (
                    <View style={styles.placeholderBadge}>
                      <Text style={styles.placeholderBadgeText}>Sample Ride</Text>
                    </View>
                  )}
                  
                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status) + '20' }]}>
                    <Text style={styles.statusIcon}>{getStatusIcon(ride.status)}</Text>
                    <Text style={[styles.statusText, { color: getStatusColor(ride.status) }]}>
                      {getStatusText(ride.status)}
                    </Text>
                  </View>

                  {/* Driver Profile - Same as Home Screen */}
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
                      <Text style={styles.priceAmount}>₹{ride.cost}</Text>
                      <Text style={styles.priceLabel}>{activeTab === 'upcoming' ? 'pay at ride' : 'paid'}</Text>
                    </View>
                  </View>

                  {/* Route Section - Same as Home Screen */}
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
                        <Text style={styles.timeText}>{ride.time.split(' - ')[0]}</Text>
                      </View>
                      
                      <View style={styles.locationRow}>
                        <View style={styles.locationContent}>
                          <Text style={styles.locationText}>{ride.to}</Text>
                        </View>
                        <Text style={styles.timeText}>{ride.time.split(' - ')[1]}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.cardBottomSection}>
                    {activeTab === 'upcoming' && (
                      <>
                        <TouchableOpacity 
                          style={[styles.secondaryButton, ride.isPlaceholder && styles.buttonDisabled]}
                          onPress={() => handleChatWithRider(ride)}
                          disabled={ride.isPlaceholder}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.secondaryButtonText}>💬 Chat</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.cancelButton, ride.isPlaceholder && styles.buttonDisabled]}
                          onPress={() => handleCancelRide(ride)}
                          disabled={ride.isPlaceholder}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.cancelButtonText}>❌ Cancel</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {activeTab === 'past' && (
                      <TouchableOpacity 
                        style={[styles.primaryButton, styles.buttonElevated, ride.isPlaceholder && styles.buttonDisabled]}
                        onPress={() => handleRateRide(ride)}
                        disabled={ride.isPlaceholder}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.primaryButtonText}>
                          {ride.isPlaceholder ? 'Sample Ride' : '⭐ Rate Ride'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
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
  
  // Header - Same as Home Screen
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
  
  // Tabs - Same as Home Screen
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
    fontSize: 14,
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
  
  // Cards - Same as Home Screen
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
  placeholderBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  placeholderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B82F6',
  },
  
  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Card Top Section - Same as Home Screen
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
  
  // Route Section - Same as Home Screen
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
  
  // Details Row
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  costValue: {
    fontSize: 15,
    color: '#059669',
    fontWeight: '700',
  },
  
  // Passengers
  passengersSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  passengersTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  passengersList: {
    gap: 10,
  },
  passengerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  passengerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passengerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Card Bottom
  cardBottomSection: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // Buttons - Same as Home Screen
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonElevated: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  secondaryButtonText: {
    color: '#3730A3',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Empty State
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  bottomSpace: {
    height: 120,
  },
});
