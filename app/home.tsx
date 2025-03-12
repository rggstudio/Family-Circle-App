import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Circle</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF8C00" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.welcomeText}>
            Welcome, {user?.displayName || 'User'}!
          </Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Authentication Status</Text>
          <Text style={styles.infoText}>
            User ID: {user?.uid || 'Not logged in'}
          </Text>
          <Text style={styles.infoText}>
            Email Verified: {user?.emailVerified ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.infoText}>
            Authentication Provider: {user?.providerData[0]?.providerId || 'None'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signOutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF8C00',
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF8C00',
    marginBottom: 15,
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  infoContainer: {
    backgroundColor: '#111111',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#DDDDDD',
    marginBottom: 10,
  },
}); 