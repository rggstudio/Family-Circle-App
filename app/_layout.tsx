import React, { useEffect } from 'react';
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "../context/AuthContext";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
              backgroundColor: 'black', 
            },
            headerTintColor: 'white',
            headerBackTitle: 'Back',
            headerTitleStyle: {
              color: 'white',
            },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: "#000000" },
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
