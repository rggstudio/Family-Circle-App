import React, { useEffect } from 'react';
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "../context/AuthContext";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

export default function Layout() {
  useEffect(() => {
    console.log("_layout.tsx mounted");
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <Stack 
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.BLACK, 
            },
            headerTintColor: Colors.WHITE,
            headerBackTitle: 'Back',
            headerTitleStyle: {
              color: Colors.WHITE,
            },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: Colors.BLACK },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="signup" 
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="login" 
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="home" 
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="menu" 
            options={{ 
              presentation: 'modal',
              title: 'Menu'
            }} 
          />
          <Stack.Screen 
            name="notifications" 
            options={{ 
              title: 'Notifications'
            }} 
          />
          <Stack.Screen 
            name="calendar" 
            options={{ 
              title: 'Calendar'
            }} 
          />
          <Stack.Screen 
            name="chat" 
            options={{ 
              title: 'Family Chat'
            }} 
          />
          <Stack.Screen 
            name="create-post" 
            options={{ 
              presentation: 'modal',
              title: 'Create Post'
            }} 
          />
          <Stack.Screen 
            name="profile/[id]" 
            options={{ 
              title: 'Profile'
            }} 
          />
          <Stack.Screen 
            name="tasks" 
            options={{ 
              title: 'All Tasks'
            }} 
          />
          <Stack.Screen 
            name="events" 
            options={{ 
              title: 'Calendar'
            }} 
          />
          <Stack.Screen 
            name="post-details" 
            options={{ 
              title: 'Post'
            }} 
          />
          {/* Auth test page disabled
          <Stack.Screen 
            name="auth-test" 
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          */}
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
