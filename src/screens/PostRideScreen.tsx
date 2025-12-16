import { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Modal} from 'react-native';
import { createRide, createTrainPost } from '@services/data';
import { useAuthState } from '@lib/firebase';
import { useNavigation } from '@react-navigation/native';

type TabType = 'ride' | 'train';
type PickerType = 'date' | 'startTime' | 'reachTime' | 'arrivalTime';

const CalendarPickerModal = ({ 
  visible, 
  initialDate,
  onConfirm, 
  onCancel 
}: { 
  visible: boolean; 
  initialDate: Date;
  onConfirm: (date: Date) => void; 
  onCancel: () => void;
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getCurrentMonthDays = () => {
    const daysInMonth = getDaysInMonth(selectedDate.getMonth(), selectedDate.getFullYear());
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const isToday = day === currentDay && 
                      selectedDate.getMonth() === currentMonth && 
                      selectedDate.getFullYear() === currentYear;
      const isSelected = day === selectedDate.getDate();
      
      return { day, isToday, isSelected };
    });
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={pickerStyles.modalOverlay}>
        <View style={pickerStyles.modalContent}>
          <View style={pickerStyles.modalHeader}>
            <View style={pickerStyles.headerBackground} />
            <Text style={pickerStyles.pickerTitle}>Select Date</Text>
            <Text style={pickerStyles.pickerSubtitle}>Choose your journey date</Text>
          </View>

          <ScrollView 
            style={pickerStyles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={pickerStyles.scrollViewContent}
          >
            <View style={pickerStyles.selectedDisplayCard}>
              <View style={pickerStyles.selectedDisplayContent}>
                <Text style={pickerStyles.selectedLabel}>SELECTED DATE</Text>
                <Text style={pickerStyles.selectedValue}>
                  {daysOfWeek[selectedDate.getDay()]}, {selectedDate.getDate()} {shortMonths[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </Text>
              </View>
            </View>


            <View style={pickerStyles.calendarSection}>
              <View style={pickerStyles.calendarHeader}>
                <TouchableOpacity 
                  style={pickerStyles.monthNavButton}
                  onPress={() => handleMonthChange('prev')}
                >
                  <Text style={pickerStyles.monthNavText}>‹</Text>
                </TouchableOpacity>
                
                <Text style={pickerStyles.monthYearText}>
                  {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </Text>
                
                <TouchableOpacity 
                  style={pickerStyles.monthNavButton}
                  onPress={() => handleMonthChange('next')}
                >
                  <Text style={pickerStyles.monthNavText}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={pickerStyles.dayHeaders}>
                {daysOfWeek.map(day => (
                  <View key={day} style={pickerStyles.dayHeader}>
                    <Text style={pickerStyles.dayHeaderText}>{day}</Text>
                  </View>
                ))}
              </View>

              <View style={pickerStyles.daysGrid}>
                {(() => {
                  const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                  const offset = firstDay.getDay();
                  const days = [];
                  
                  for (let i = 0; i < offset; i++) {
                    days.push(<View key={`empty-${i}`} style={pickerStyles.emptyDay} />);
                  }
                  
                  getCurrentMonthDays().forEach(({ day, isToday, isSelected }) => {
                    days.push(
                      <TouchableOpacity
                        key={day}
                        style={[
                          pickerStyles.dayCell,
                          isToday && pickerStyles.todayDayCell,
                          isSelected && pickerStyles.selectedDayCell
                        ]}
                        onPress={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(day);
                          setSelectedDate(newDate);
                        }}
                      >
                        {isToday && (
                          <View style={pickerStyles.todayBadge}>
                            <Text style={pickerStyles.todayBadgeText}>TODAY</Text>
                          </View>
                        )}
                        <Text style={[
                          pickerStyles.dayText,
                          isToday && pickerStyles.todayDayText,
                          isSelected && pickerStyles.selectedDayText
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  });
                  
                  const totalCells = 42;
                  const remainingCells = totalCells - (offset + getCurrentMonthDays().length);
                  for (let i = 0; i < remainingCells; i++) {
                    days.push(<View key={`empty-end-${i}`} style={pickerStyles.emptyDay} />);
                  }
                  
                  return days;
                })()}
              </View>
            </View>
          </ScrollView>

          <View style={pickerStyles.actionButtons}>
            <TouchableOpacity 
              style={[pickerStyles.actionButton, pickerStyles.cancelButton]} 
              onPress={onCancel}
            >
              <Text style={pickerStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[pickerStyles.actionButton, pickerStyles.confirmButton]} 
              onPress={() => onConfirm(selectedDate)}
            >
              <Text style={pickerStyles.confirmButtonText}>Select Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const TimePickerModal = ({ visible, initialTime, title, onConfirm, onCancel }: {
  visible: boolean;
  initialTime: Date;
  title: string;
  onConfirm: (time: string) => void;
  onCancel: () => void;
}) => {
  const [selectedHour, setSelectedHour] = useState(initialTime.getHours() % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(initialTime.getMinutes());
  const [isAM, setIsAM] = useState(initialTime.getHours() < 12);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Refs for scroll views
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  // Scroll end timers
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-select when scrolling stops
  const handleHourScroll = useCallback(({ nativeEvent }: { nativeEvent: any }) => {
    const offsetY = nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 48);
    const hour = hours[Math.max(0, Math.min(index, hours.length - 1))];

    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
    }

    scrollEndTimer.current = setTimeout(() => {
      if (hour !== selectedHour) {
        setSelectedHour(hour);
      }
    }, 100);
  }, [selectedHour]);

  const handleMinuteScroll = useCallback(({ nativeEvent }: { nativeEvent: any }) => {
    const offsetY = nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 48);
    const minute = minutes[Math.max(0, Math.min(index, minutes.length - 1))];

    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
    }

    scrollEndTimer.current = setTimeout(() => {
      if (minute !== selectedMinute) {
        setSelectedMinute(minute);
      }
    }, 100);
  }, [selectedMinute]);

  // removed seconds scroll handler

  const handlePeriodScroll = useCallback(({ nativeEvent }: { nativeEvent: any }) => {
    const offsetY = nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 48);
    const period = ['AM', 'PM'][Math.max(0, Math.min(index, 1))];
    const isAMValue = period === 'AM';

    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
    }

    scrollEndTimer.current = setTimeout(() => {
      if (isAMValue !== isAM) {
        setIsAM(isAMValue);
      }
    }, 100);
  }, [isAM]);

  // Handle scroll end to snap to position
  const handleScrollEndDrag = useCallback((ref: any, itemsArray: any[], setValue: (val: any) => void) => {
    return ({ nativeEvent }: any) => {
      const offsetY = nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / 48);
      const snapIndex = Math.max(0, Math.min(index, itemsArray.length - 1));
      const snapOffset = snapIndex * 48;
      
      if (ref.current) {
        ref.current.scrollTo({ y: snapOffset, animated: true });
      }
      setValue(itemsArray[snapIndex]);
    };
  }, []);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) {
        clearTimeout(scrollEndTimer.current);
      }
    };
  }, []);

  // Scroll to selected item when component mounts
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        if (hourScrollRef.current) {
          const index = hours.indexOf(selectedHour);
          if (index !== -1) {
            hourScrollRef.current.scrollTo({ y: index * 48, animated: false });
          }
        }
        if (minuteScrollRef.current) {
          const index = minutes.indexOf(selectedMinute);
          if (index !== -1) {
            minuteScrollRef.current.scrollTo({ y: index * 48, animated: false });
          }
        }
        if (periodScrollRef.current) {
          const index = isAM ? 0 : 1;
          periodScrollRef.current.scrollTo({ y: index * 48, animated: false });
        }
      }, 100);
    }
  }, [visible]);

  const handleConfirm = () => {
    const hour24 = isAM ? (selectedHour === 12 ? 0 : selectedHour) : (selectedHour === 12 ? 12 : selectedHour + 12);
    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onConfirm(timeString);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={pickerStyles.modalOverlay}>
        <View style={pickerStyles.modalContent}>
          <ScrollView style={pickerStyles.scrollView} contentContainerStyle={pickerStyles.scrollViewContent}>
            <View style={pickerStyles.modalHeader}>
              <View style={pickerStyles.headerBackground} />
              <Text style={pickerStyles.pickerTitle}>Select {title}</Text>
              <Text style={pickerStyles.pickerSubtitle}>Choose your preferred time</Text>
            </View>

            <View style={pickerStyles.selectedDisplayCard}>
              <View style={pickerStyles.selectedDisplayContent}>
                <Text style={pickerStyles.selectedLabel}>SELECTED TIME</Text>
                <Text style={pickerStyles.selectedValue}>
                  {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')} {isAM ? 'AM' : 'PM'}
                </Text>
              </View>
            </View>

            <View style={pickerStyles.timePickerContainer}>
              <View style={pickerStyles.timeSelectionBar} />
              <View style={pickerStyles.timeColumnsContainer}>
                <View style={pickerStyles.timeColumn}>
                  <Text style={pickerStyles.timeColumnLabel}>Hour</Text>
                  <ScrollView
                    ref={hourScrollRef}
                    style={pickerStyles.timeColumnScroll}
                    contentContainerStyle={pickerStyles.timeColumnContent}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={48}
                    decelerationRate="fast"
                    onScroll={handleHourScroll}
                    onMomentumScrollEnd={handleScrollEndDrag(hourScrollRef, hours, setSelectedHour)}
                    scrollEventThrottle={16}
                    nestedScrollEnabled={true}
                  >
                    {hours.map(hour => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          pickerStyles.timeOption,
                          selectedHour === hour && pickerStyles.timeOptionSelected
                        ]}
                        onPress={() => {
                          setSelectedHour(hour);
                          const index = hours.indexOf(hour);
                          hourScrollRef.current?.scrollTo({ y: index * 48, animated: true });
                        }}
                      >
                        <Text style={[
                          pickerStyles.timeOptionText,
                          selectedHour === hour && pickerStyles.timeOptionTextSelected
                        ]}>
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={pickerStyles.timeColumn}>
                  <Text style={pickerStyles.timeColumnLabel}>Minute</Text>
                  <ScrollView
                    ref={minuteScrollRef}
                    style={pickerStyles.timeColumnScroll}
                    contentContainerStyle={pickerStyles.timeColumnContent}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={48}
                    decelerationRate="fast"
                    onScroll={handleMinuteScroll}
                    onMomentumScrollEnd={handleScrollEndDrag(minuteScrollRef, minutes, setSelectedMinute)}
                    scrollEventThrottle={16}
                    nestedScrollEnabled={true}
                  >
                    {minutes.map(minute => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          pickerStyles.timeOption,
                          selectedMinute === minute && pickerStyles.timeOptionSelected
                        ]}
                        onPress={() => {
                          setSelectedMinute(minute);
                          const index = minutes.indexOf(minute);
                          minuteScrollRef.current?.scrollTo({ y: index * 48, animated: true });
                        }}
                      >
                        <Text style={[
                          pickerStyles.timeOptionText,
                          selectedMinute === minute && pickerStyles.timeOptionTextSelected
                        ]}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* seconds column removed */}

                <View style={pickerStyles.timeColumn}>
                  <Text style={pickerStyles.timeColumnLabel}>Period</Text>
                  <ScrollView
                    ref={periodScrollRef}
                    style={pickerStyles.timeColumnScroll}
                    contentContainerStyle={pickerStyles.timeColumnContent}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={48}
                    decelerationRate="fast"
                    onScroll={handlePeriodScroll}
                    onMomentumScrollEnd={handleScrollEndDrag(periodScrollRef, ['AM', 'PM'], (val) => setIsAM(val === 'AM'))}
                    scrollEventThrottle={16}
                    nestedScrollEnabled={true}
                  >
                    {['AM', 'PM'].map(period => {
                      const isSelected = (isAM && period === 'AM') || (!isAM && period === 'PM');
                      return (
                        <TouchableOpacity
                          key={period}
                          style={[
                            pickerStyles.timeOption,
                            isSelected && pickerStyles.timeOptionSelected
                          ]}
                          onPress={() => {
                            setIsAM(period === 'AM');
                            const index = period === 'AM' ? 0 : 1;
                            periodScrollRef.current?.scrollTo({ y: index * 48, animated: true });
                          }}
                        >
                          <Text style={[
                            pickerStyles.timeOptionText,
                            isSelected && pickerStyles.timeOptionTextSelected
                          ]}>
                            {period}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </View>

            <View style={pickerStyles.commonTimesSection}>
              <Text style={pickerStyles.sectionTitle}>Common Times</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={pickerStyles.commonTimesScroll}
                contentContainerStyle={pickerStyles.commonTimesScrollContent}
              >
                {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((time) => {
                  const [hour, minute] = time.split(':').map(Number);
                  const isSelected = selectedHour === (hour % 12 || 12) && selectedMinute === minute;
                  const period = hour < 12 ? 'AM' : 'PM';
                  const displayHour = hour % 12 || 12;

                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        pickerStyles.commonTimeButton,
                        isSelected && pickerStyles.commonTimeButtonActive
                      ]}
                      onPress={() => {
                        setSelectedHour(displayHour);
                        setSelectedMinute(minute);
                        setIsAM(hour < 12);
                      }}
                    >
                      <Text style={[
                        pickerStyles.commonTimeText,
                        isSelected && pickerStyles.commonTimeTextActive
                      ]}>
                        {displayHour}:{minute.toString().padStart(2, '0')} {period}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={pickerStyles.actionButtons}>
            <TouchableOpacity
              style={[pickerStyles.actionButton, pickerStyles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={pickerStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[pickerStyles.actionButton, pickerStyles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={pickerStyles.confirmButtonText}>Select Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const formatDateDisplay = (date: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return {
    short: `${day}/${month}/${year}`,
    long: `${days[date.getDay()]}, ${months[date.getMonth()]} ${day}, ${year}`
  };
};

const formatTimeDisplay = (time: string) => {
  if (!time) return 'Select Time';
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const RouteSection = ({ from, setFrom, to, setTo, icon = '📍', title = 'Route Details' }: any) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Text style={styles.sectionIconText}>{icon}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.inputGroup}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>From Location *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter pickup location"
          value={from}
          onChangeText={setFrom}
          placeholderTextColor="#94A3B8"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>To Destination *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter drop-off location"
          value={to}
          onChangeText={setTo}
          placeholderTextColor="#94A3B8"
        />
      </View>
    </View>
  </View>
);

const TimeField = ({ label, value, onPress, placeholder }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label} *</Text>
    <TouchableOpacity style={[styles.textInput, styles.pickerInput]} onPress={onPress}>
      <Text style={value ? styles.pickerValue : styles.pickerPlaceholder}>
        {value ? formatTimeDisplay(value) : placeholder}
      </Text>
    </TouchableOpacity>
  </View>
);

const DateField = ({ value, dateObj, onPress }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>Date *</Text>
    <TouchableOpacity style={[styles.textInput, styles.pickerInput]} onPress={onPress}>
      <Text style={value ? styles.pickerValue : styles.pickerPlaceholder}>
        {value ? formatDateDisplay(dateObj).long : 'Select Date'}
      </Text>
    </TouchableOpacity>
  </View>
);

const CounterInput = ({ label, value, setValue, max = 10 }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.seatsContainer}>
      <TouchableOpacity
        style={styles.seatButton}
        onPress={() => {
          const current = parseInt(value) || 1;
          if (current > 1) setValue(String(current - 1));
        }}
      >
        <Text style={styles.seatButtonText}>-</Text>
      </TouchableOpacity>
      <View style={styles.seatsInputWrapper}>
        <Text style={styles.seatsInputText}>{value}</Text>
      </View>
      <TouchableOpacity
        style={styles.seatButton}
        onPress={() => {
          const current = parseInt(value) || 1;
          if (current < max) setValue(String(current + 1));
        }}
      >
        <Text style={styles.seatButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const PreferenceSection = ({ value, onValueChange, title, description }: any) => (
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
          <Text style={styles.preferenceTitle}>{title}</Text>
          <Text style={styles.preferenceDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E2E8F0', true: '#93C5FD' }}
          thumbColor={value ? '#3B82F6' : '#CBD5E1'}
        />
      </View>
    </View>
  </View>
);

export default function PostRideScreen() {
  const navigation = useNavigation();
  const { user, profile } = useAuthState();
  const [activeTab, setActiveTab] = useState<TabType>('ride');
  const [isLoading, setIsLoading] = useState(false);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [reachTime, setReachTime] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [startObj, setStartObj] = useState(new Date());
  const [reachObj, setReachObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showReachPicker, setShowReachPicker] = useState(false);
  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  const [seats, setSeats] = useState('1');
  const [cost, setCost] = useState('');
  const [sameGenderOnly, setSameGenderOnly] = useState(false);

  const [trainName, setTrainName] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [arrivalObj, setArrivalObj] = useState(new Date());
  const [passengersCount, setPassengersCount] = useState('1');
  const [trainSameGenderOnly, setTrainSameGenderOnly] = useState(false);

  const handleDateSelect = (selectedDate: Date) => {
    const formatted = formatDateDisplay(selectedDate);
    setDate(formatted.short);
    setDateObj(selectedDate);
    setShowDatePicker(false);
  };

  const handleStartTimeSelect = (timeString: string) => {
    setStartTime(timeString);
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setStartObj(newDate);
    setShowStartPicker(false);
  };

  const handleReachTimeSelect = (timeString: string) => {
    setReachTime(timeString);
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setReachObj(newDate);
    setShowReachPicker(false);
  };

  const handleArrivalTimeSelect = (timeString: string) => {
    setArrivalTime(timeString);
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setArrivalObj(newDate);
    setShowArrivalPicker(false);
  };

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
        [{ text: 'OK', onPress: () => navigation.goBack() }]
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
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to post train connection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              {activeTab === 'ride' ? 'Post a Ride' : 'Post Train Connection'}
            </Text>
            <Text style={styles.subtitle}>
              {activeTab === 'ride' ? 'Share your journey with campus community' : 'Connect with fellow train travelers'}
            </Text>
          </View>
        </View>

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

        <View style={styles.formContainer}>
          {activeTab === 'ride' ? (
            <>
              <RouteSection
                from={from}
                setFrom={setFrom}
                to={to}
                setTo={setTo}
              />

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Text style={styles.sectionIconText}>📅</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Schedule</Text>
                </View>
                <View style={styles.inputGroup}>
                  <DateField
                    value={date}
                    dateObj={dateObj}
                    onPress={() => setShowDatePicker(true)}
                  />
                  <TimeField
                    label="Start Time"
                    value={startTime}
                    onPress={() => setShowStartPicker(true)}
                    placeholder="Select Start Time"
                  />
                  <TimeField
                    label="Reach Time"
                    value={reachTime}
                    onPress={() => setShowReachPicker(true)}
                    placeholder="Select Reach Time"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Text style={styles.sectionIconText}>🚙</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Ride Details</Text>
                </View>
                <View style={styles.inputGroup}>
                  <CounterInput
                    label="Available Seats"
                    value={seats}
                    setValue={setSeats}
                  />
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Cost Per Person *</Text>
                    <View style={styles.costContainer}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={[styles.textInput, styles.costInput]}
                        placeholder="Enter amount"
                        value={cost}
                        onChangeText={setCost}
                        keyboardType="numeric"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                  </View>
                </View>
              </View>

              <PreferenceSection
                value={sameGenderOnly}
                onValueChange={setSameGenderOnly}
                title="Same Gender Only"
                description="Only accept passengers of your gender"
              />

              <TouchableOpacity
                style={[styles.postButton, isLoading && styles.postButtonDisabled]}
                onPress={handlePostRide}
                disabled={isLoading}
              >
                <Text style={styles.postButtonText}>
                  {isLoading ? 'Posting...' : 'Post Ride'}
                </Text>
              </TouchableOpacity>

              <View style={styles.infoNote}>
                <Text style={styles.infoNoteIcon}>💡</Text>
                <Text style={styles.infoNoteText}>
                  Your ride will be visible to CampusRide community members
                </Text>
              </View>
            </>
          ) : (
            <>
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
                      style={styles.textInput}
                      placeholder="Enter train name or number"
                      value={trainName}
                      onChangeText={setTrainName}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>From Station *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter departure station"
                      value={fromStation}
                      onChangeText={setFromStation}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>To Station *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter destination station"
                      value={toStation}
                      onChangeText={setToStation}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
              </View>

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
                      style={styles.textInput}
                      placeholder="Enter boarding station"
                      value={arrivalStation}
                      onChangeText={setArrivalStation}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <TimeField
                    label="Arrival Time"
                    value={arrivalTime}
                    onPress={() => setShowArrivalPicker(true)}
                    placeholder="Select Arrival Time"
                  />
                  <CounterInput
                    label="Passengers"
                    value={passengersCount}
                    setValue={setPassengersCount}
                  />
                </View>
              </View>

              <PreferenceSection
                value={trainSameGenderOnly}
                onValueChange={setTrainSameGenderOnly}
                title="Same Gender Only"
                description="Only connect with same gender travelers"
              />

              <TouchableOpacity
                style={[styles.postButton, isLoading && styles.postButtonDisabled]}
                onPress={handlePostTrain}
                disabled={isLoading}
              >
                <Text style={styles.postButtonText}>
                  {isLoading ? 'Posting...' : 'Post Connection'}
                </Text>
              </TouchableOpacity>

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

      <CalendarPickerModal
        visible={showDatePicker}
        initialDate={dateObj}
        onConfirm={handleDateSelect}
        onCancel={() => setShowDatePicker(false)}
      />

      <TimePickerModal
        visible={showStartPicker}
        initialTime={startObj}
        title="Start Time"
        onConfirm={handleStartTimeSelect}
        onCancel={() => setShowStartPicker(false)}
      />

      <TimePickerModal
        visible={showReachPicker}
        initialTime={reachObj}
        title="Reach Time"
        onConfirm={handleReachTimeSelect}
        onCancel={() => setShowReachPicker(false)}
      />

      <TimePickerModal
        visible={showArrivalPicker}
        initialTime={arrivalObj}
        title="Arrival Time"
        onConfirm={handleArrivalTimeSelect}
        onCancel={() => setShowArrivalPicker(false)}
      />
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
  pickerInput: {
    paddingVertical: 16,
    justifyContent: 'center',
  },
  pickerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  pickerPlaceholder: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
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
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    height: 50,
  },
  seatButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
  },
  seatsInputWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatsInputText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  seatsInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 14,
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

const pickerStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    width: '95%',
    maxWidth: 420,
    height: '85%',
    maxHeight: '85%',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
  pickerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  pickerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  selectedDisplayCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    margin: 20,
    marginTop: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  selectedDisplayContent: {
    padding: 20,
    alignItems: 'center',
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  selectedValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    marginLeft: 4,
  },
  calendarSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#475569',
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayHeader: {
    width: '14%',
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyDay: {
    width: '14%',
    height: 50,
  },
  dayCell: {
    width: '13.5%',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    position: 'relative',
    marginVertical: 3,
  },
  todayDayCell: {
    borderColor: '#10B981',
  },
  selectedDayCell: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  todayBadge: {
    position: 'absolute',
    top: -6,
    backgroundColor: '#10B981',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  todayBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  todayDayText: {
    color: '#10B981',
    fontWeight: '800',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  timePickerContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    height: 240,
    position: 'relative',
  },
  timeSelectionBar: {
    position: 'absolute',
    top: '50%',
    left: 16,
    right: 16,
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    transform: [{ translateY: -24 }],
    zIndex: 1,
  },
  timeColumnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '100%',
    paddingTop: 8,
    zIndex: 2,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  timeColumnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  timeColumnScroll: {
    width: '100%',
    height: 180,
  },
  timeColumnContent: {
    alignItems: 'center',
    paddingVertical: 70,
    paddingBottom: 100,
  },
  timeOption: {
    width: 56,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeOptionSelected: {},
  timeOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
  },
  timeOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  commonTimesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  commonTimesScroll: {
    height: 60,
  },
  commonTimesScrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  commonTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  commonTimeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginHorizontal: 5,
    minWidth: 90,
  },
  commonTimeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  commonTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  commonTimeTextActive: {
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
