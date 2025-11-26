import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, StyleSheet } from 'react-native';
import HomeScreen from '@screens/HomeScreen';
import PostRideScreen from '@screens/PostRideScreen';
import MyRidesScreen from '@screens/MyRidesScreen';
import ChatsScreen from '@screens/ChatsScreen';
import ChatRoomScreen from '@screens/ChatRoomScreen';
import LoginScreen from '@screens/Auth/LoginScreen';
import SignUpScreen from '@screens/Auth/SignUpScreen';
import ProfileScreen from '@screens/ProfileScreen';
import TopBar from '@components/TopBar';
import { Ionicons } from '@expo/vector-icons';
import { useAuthState } from '@lib/firebase';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        header: () => <TopBar />,
        tabBarActiveTintColor: '#1E88E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 8,
          backgroundColor: '#FFFFFF',
          borderRadius: 30,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          ...Platform.select({
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                color={color}
                size={focused ? 28 : 24}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="Post"
        component={PostRideScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <Ionicons
                name={focused ? 'add-circle' : 'add-circle-outline'}
                color={color}
                size={focused ? 28 : 24}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="My Rides"
        component={MyRidesScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <Ionicons
                name={focused ? 'car' : 'car-outline'}
                color={color}
                size={focused ? 28 : 24}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <Ionicons
                name={focused ? 'chatbubble' : 'chatbubble-outline'}
                color={color}
                size={focused ? 28 : 24}
              />
            </View>
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  iconContainerFocused: {
    backgroundColor: '#E3F2FD',
    borderRadius: 25,
  },
});

export default function RootNavigator() {
  const { user } = useAuthState();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}