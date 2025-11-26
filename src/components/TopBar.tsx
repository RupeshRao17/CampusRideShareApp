import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TopBar() {
  const navigation = useNavigation();
  return (
    <View style={{ paddingTop: 44, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <TouchableOpacity onPress={() => navigation.navigate('Chats' as never)}>
        <Ionicons name="chatbubbles-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>Campus RideShare</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Profile' as never)}>
        <Ionicons name="person-circle-outline" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}