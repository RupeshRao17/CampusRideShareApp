import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Dimensions } from 'react-native';
import { createRide, createTrainPost } from '@services/data';
import { useAuthState } from '@lib/firebase';
import { useNavigation } from '@react-navigation/native';

type TabType = 'ride' | 'train';

const { width } = Dimensions.get('window');

export default function PostRideScreen() {
  const navigation = useNavigation();
  const { user, profile } = useAuthState();
  const [activeTab, setActiveTab] = useState<TabType>('ride');
  const [isLoading, setIsLoading] = useState(false);

  // Ride State
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [reachTime, setReachTime] = useState('');
  const [seats, setSeats] = useState('1');
  const [cost, setCost] = useState('');
  const [sameGenderOnly, setSameGenderOnly] = useState(false);

  // Train State
  const [trainName, setTrainName] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [passengersCount, setPassengersCount] = useState('1');
  const [trainSameGenderOnly, setTrainSameGenderOnly] = useState(false);

  const handlePostRide = async () => {
    if (!from || !to || !date || !startTime || !reachTime || !cost) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to post a ride');
      return;
    }

    setIsLoading(true);

    try {
      await createRide({
        driverId: user.uid,
        driverName: profile?.name || 'Driver',
        from,
        to,
        date,
        time: `${startTime} - ${reachTime}`,
        availableSeats: Number(seats || '1'),
        cost: Number(cost || '0'),
        allowedGender: sameGenderOnly ? (profile?.gender || 'Any') : 'Any'
      });
      
      // Reset form
      setFrom('');
      setTo('');
      setDate('');
      setStartTime('');
      setReachTime('');
      setSeats('1');
      setCost('');
      setSameGenderOnly(false);
      
      Alert.alert(
        'Success!', 
        'Your ride has been posted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to post ride. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostTrain = async () => {
    if (!trainName || !fromStation || !toStation || !arrivalStation || !arrivalTime) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to post a train connection');
      return;
    }

    setIsLoading(true);

    try {
      await createTrainPost({
        userId: user.uid,
        userName: profile?.name || 'User',
        trainName,
        fromStation,
        toStation,
        arrivalStation,
        arrivalTime,
        passengersCount: Number(passengersCount || '1'),
        allowedGender: trainSameGenderOnly ? (profile?.gender || 'Any') : 'Any'
      });
      
      // Reset form
      setTrainName('');
      setFromStation('');
      setToStation('');
      setArrivalStation('');
      setArrivalTime('');
      setPassengersCount('1');
      setTrainSameGenderOnly(false);
      
      Alert.alert(
        'Success!', 
        'Your train connection has been posted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to post train connection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              {activeTab === 'ride' ? 'Post a Ride' : 'Post Train Connection'}
            </Text>
            <Text style={styles.subtitle}>
              {activeTab === 'ride' 
                ? 'Share your journey with campus community' 
                : 'Connect with fellow train travelers'
              }
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ride' && styles.activeTab]}
            onPress={() => setActiveTab('ride')}
          >
            <View style={styles.tabContent}>
              <Text style={[styles.tabText, activeTab === 'ride' && styles.activeTabText]}>
                Car Ride
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'train' && styles.activeTab]}
            onPress={() => setActiveTab('train')}
          >
            <View style={styles.tabContent}>
              <Text style={[styles.tabText, activeTab === 'train' && styles.activeTabText]}>
                Train
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {activeTab === 'ride' ? (
            <>
              {/* Route Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Text style={styles.sectionIconText}>📍</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Route Details</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>From Location *</Text>
                    <TextInput 
                      placeholder="e.g., SIES College, Nerul"
                      placeholderTextColor="#94A3B8"
                      value={from}
                      onChangeText={setFrom}
                      style={styles.textInput}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>To Destination *</Text>
                    <TextInput 
                      placeholder="e.g., Vashi Station"
                      placeholderTextColor="#94A3B8"
                      value={to}
                      onChangeText={setTo}
                      style={styles.textInput}
                    />
                  </View>
                </View>
              </View>

              {/* Time & Date Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Text style={styles.sectionIconText}>🕒</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Schedule</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Date *</Text>
                    <TextInput 
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#94A3B8"
                      value={date}
                      onChangeText={setDate}
                      style={styles.textInput}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Start Time *</Text>
                      <TextInput 
                        placeholder="HH:MM"
                        placeholderTextColor="#94A3B8"
                        value={startTime}
                        onChangeText={setStartTime}
                        style={styles.textInput}
                      />
                    </View>
                    
                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
                      <Text style={styles.inputLabel}>Reach Time *</Text>
                      <TextInput 
                        placeholder="HH:MM"
                        placeholderTextColor="#94A3B8"
                        value={reachTime}
                        onChangeText={setReachTime}
                        style={styles.textInput}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Ride Details Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Text style={styles.sectionIconText}>🚙</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Ride Details</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Seats Available</Text>
                      <TextInput 
                        placeholder="1"
                        placeholderTextColor="#94A3B8"
                        keyboardType="number-pad"
                        value={seats}
                        onChangeText={setSeats}
                        style={styles.textInput}
                      />
                    </View>
                    
                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
                      <Text style={styles.inputLabel}>Cost Per Person *</Text>
                      <View style={styles.costContainer}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput 
                          placeholder="0"
                          placeholderTextColor="#94A3B8"
                          keyboardType="number-pad"
                          value={cost}
                          onChangeText={setCost}
                          style={[styles.textInput, styles.costInput]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Preferences Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Text style={styles.sectionIconText}>⚙️</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Preferences</Text>
                </View>
                
                <View style={styles.preferenceCard}>
                  <View style={styles.preferenceContent}>
                    <View style={styles.preferenceText}>
                      <Text style={styles.preferenceTitle}>Same Gender Only</Text>
                      <Text style={styles.preferenceDescription}>
                        Restrict to same gender passengers for comfort and safety
                      </Text>
                    </View>
                    <Switch 
                      value={sameGenderOnly}
                      onValueChange={setSameGenderOnly}
                      trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
                      thumbColor={sameGenderOnly ? '#FFFFFF' : '#FFFFFF'}
                      ios_backgroundColor="#E2E8F0"
                    />
                  </View>
                </View>
              </View>

              {/* Post Ride Button */}
              <TouchableOpacity
                style={[styles.postButton, isLoading && styles.postButtonDisabled]}
                onPress={handlePostRide}
                disabled={isLoading}
              >
                <Text style={styles.postButtonText}>
                  {isLoading ? 'Posting...' : 'Post Ride'}
                </Text>
              </TouchableOpacity>

              {/* Info Note */}
              <View style={styles.infoNote}>
                <Text style={styles.infoNoteIcon}>💡</Text>
                <Text style={styles.infoNoteText}>
                  Your ride will be visible to CampusRide community members
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* Train Details Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Text style={styles.sectionIconText}>🚆</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Train Information</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Train Name/Line *</Text>
                    <TextInput 
                      placeholder="e.g., Harbour Line, Trans-Harbour Line"
                      placeholderTextColor="#94A3B8"
                      value={trainName}
                      onChangeText={setTrainName}
                      style={styles.textInput}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>From Station *</Text>
                      <TextInput 
                        placeholder="e.g., CST"
                        placeholderTextColor="#94A3B8"
                        value={fromStation}
                        onChangeText={setFromStation}
                        style={styles.textInput}
                      />
                    </View>
                    
                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
                      <Text style={styles.inputLabel}>To Station *</Text>
                      <TextInput 
                        placeholder="e.g., Panvel"
                        placeholderTextColor="#94A3B8"
                        value={toStation}
                        onChangeText={setToStation}
                        style={styles.textInput}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Arrival Details Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Text style={styles.sectionIconText}>📍</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Arrival Details</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Boarding Station *</Text>
                    <TextInput 
                      placeholder="e.g., Nerul Station"
                      placeholderTextColor="#94A3B8"
                      value={arrivalStation}
                      onChangeText={setArrivalStation}
                      style={styles.textInput}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Arrival Time *</Text>
                    <TextInput 
                      placeholder="e.g., 08:45 AM"
                      placeholderTextColor="#94A3B8"
                      value={arrivalTime}
                      onChangeText={setArrivalTime}
                      style={styles.textInput}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Number of People</Text>
                    <TextInput 
                      placeholder="1"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      value={passengersCount}
                      onChangeText={setPassengersCount}
                      style={styles.textInput}
                    />
                  </View>
                </View>
              </View>

              {/* Preferences Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Text style={styles.sectionIconText}>⚙️</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Preferences</Text>
                </View>
                
                <View style={styles.preferenceCard}>
                  <View style={styles.preferenceContent}>
                    <View style={styles.preferenceText}>
                      <Text style={styles.preferenceTitle}>Same Gender Only</Text>
                      <Text style={styles.preferenceDescription}>
                        Restrict to same gender connections for comfort and safety
                      </Text>
                    </View>
                    <Switch 
                      value={trainSameGenderOnly}
                      onValueChange={setTrainSameGenderOnly}
                      trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
                      thumbColor={trainSameGenderOnly ? '#FFFFFF' : '#FFFFFF'}
                      ios_backgroundColor="#E2E8F0"
                    />
                  </View>
                </View>
              </View>

              {/* Post Train Button */}
              <TouchableOpacity
                style={[styles.postButton, isLoading && styles.postButtonDisabled]}
                onPress={handlePostTrain}
                disabled={isLoading}
              >
                <Text style={styles.postButtonText}>
                  {isLoading ? 'Posting...' : 'Post Connection'}
                </Text>
              </TouchableOpacity>

              {/* Info Note */}
              <View style={styles.infoNote}>
                <Text style={styles.infoNoteIcon}>💡</Text>
                <Text style={styles.infoNoteText}>
                  Your train connection will be visible to CampusRide community members
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#F1F5F9',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  inputGroup: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 2,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  costInput: {
    paddingLeft: 36,
  },
  preferenceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  preferenceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceText: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 18,
  },
  postButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  postButtonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  infoNote: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoNoteIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  infoNoteText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    flex: 1,
  },
});