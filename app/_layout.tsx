import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function Layout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000000" },
        // Disable navigation gesture to prevent conflicts with carousel swipe
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="signup" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
