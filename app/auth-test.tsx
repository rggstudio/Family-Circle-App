import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  signUp, 
  logIn, 
  resetPassword, 
  getCurrentUser,
  updateUserProfile
} from '../firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export default function AuthTest() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('Password123');
  const [testFirstName, setTestFirstName] = useState('Test');
  const [testLastName, setTestLastName] = useState('User');
  const [isLoading, setIsLoading] = useState(false);
  const [testFamilyCircleName, setTestFamilyCircleName] = useState('Test Family');
  const [testInviteCode, setTestInviteCode] = useState('TEST123');
  const [circleOption, setCircleOption] = useState<'create' | 'join'>('create');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  // Helper function to update status
  const updateStatus = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage(message);
    setStatusType(type);
    console.log(`[${type.toUpperCase()}]: ${message}`);
  };

  // Helper function to pick an image
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
        updateStatus('Image selected successfully', 'success');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      updateStatus('Failed to select image', 'error');
    }
  };

  // Test sign up
  const handleTestSignUp = async () => {
    setIsLoading(true);
    updateStatus('Attempting to sign up...', 'info');
    
    try {
      const newUser = await signUp(
        testEmail,
        testPassword,
        testFirstName,
        testLastName,
        profileImage,
        circleOption,
        circleOption === 'create' ? testFamilyCircleName : undefined,
        circleOption === 'join' ? testInviteCode : undefined
      );
      
      updateStatus(`Sign up successful! User ID: ${newUser.uid}`, 'success');
    } catch (error: any) {
      updateStatus(`Sign up failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test login
  const handleTestLogin = async () => {
    setIsLoading(true);
    updateStatus('Attempting to log in...', 'info');
    
    try {
      await logIn(testEmail, testPassword);
      updateStatus('Login successful!', 'success');
    } catch (error: any) {
      updateStatus(`Login failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test sign out
  const handleTestSignOut = async () => {
    setIsLoading(true);
    updateStatus('Attempting to sign out...', 'info');
    
    try {
      await signOut();
      updateStatus('Sign out successful!', 'success');
    } catch (error: any) {
      updateStatus(`Sign out failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test password reset
  const handleTestPasswordReset = async () => {
    setIsLoading(true);
    updateStatus('Attempting to send password reset email...', 'info');
    
    try {
      await resetPassword(testEmail);
      updateStatus('Password reset email sent!', 'success');
    } catch (error: any) {
      updateStatus(`Password reset failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test profile image upload
  const handleTestProfileImageUpload = async () => {
    if (!profileImage) {
      updateStatus('Please select an image first', 'error');
      return;
    }
    
    if (!user) {
      updateStatus('You must be logged in to upload a profile image', 'error');
      return;
    }
    
    setIsLoading(true);
    updateStatus('Uploading profile image...', 'info');
    
    try {
      // Convert URI to blob
      const response = await fetch(profileImage);
      const blob = await response.blob();
      
      // Create a storage reference
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      
      // Upload the image
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      // Wait for upload to complete
      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress monitoring
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            updateStatus(`Upload is ${progress.toFixed(0)}% done`, 'info');
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Upload completed successfully
            resolve(null);
          }
        );
      });
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile with the new image URL
      await updateUserProfile({
        photoURL: downloadURL
      });
      
      updateStatus('Profile image uploaded successfully!', 'success');
    } catch (error: any) {
      updateStatus(`Profile image upload failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation
  const goToHome = () => router.push('/home');
  const goBack = () => router.back();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FF8C00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Authentication Testing</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Current User Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current User Status</Text>
          <View style={styles.userInfoContainer}>
            {user ? (
              <>
                <View style={styles.profileImageContainer}>
                  {user.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Text style={styles.profileImagePlaceholderText}>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userInfoText}>
                  <Text style={styles.bold}>ID:</Text> {user.uid}
                </Text>
                <Text style={styles.userInfoText}>
                  <Text style={styles.bold}>Email:</Text> {user.email}
                </Text>
                <Text style={styles.userInfoText}>
                  <Text style={styles.bold}>Display Name:</Text> {user.displayName || 'Not set'}
                </Text>
                <Text style={styles.userInfoText}>
                  <Text style={styles.bold}>Email Verified:</Text> {user.emailVerified ? 'Yes' : 'No'}
                </Text>
              </>
            ) : (
              <Text style={styles.userInfoText}>Not logged in</Text>
            )}
          </View>
        </View>

        {/* Test Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Settings</Text>
          <TextInput
            style={styles.input}
            value={testEmail}
            onChangeText={setTestEmail}
            placeholder="Email"
            placeholderTextColor="#777777"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={testPassword}
            onChangeText={setTestPassword}
            placeholder="Password"
            placeholderTextColor="#777777"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            value={testFirstName}
            onChangeText={setTestFirstName}
            placeholder="First Name"
            placeholderTextColor="#777777"
          />
          <TextInput
            style={styles.input}
            value={testLastName}
            onChangeText={setTestLastName}
            placeholder="Last Name"
            placeholderTextColor="#777777"
          />

          {/* Sign Up Options */}
          <View style={styles.radioContainer}>
            <Text style={styles.label}>Family Circle Option:</Text>
            <View style={styles.radioOptions}>
              <TouchableOpacity 
                style={[styles.radioButton, circleOption === 'create' && styles.radioButtonSelected]}
                onPress={() => setCircleOption('create')}
              >
                <Text style={[styles.radioText, circleOption === 'create' && styles.radioTextSelected]}>
                  Create
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.radioButton, circleOption === 'join' && styles.radioButtonSelected]}
                onPress={() => setCircleOption('join')}
              >
                <Text style={[styles.radioText, circleOption === 'join' && styles.radioTextSelected]}>
                  Join
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {circleOption === 'create' ? (
            <TextInput
              style={styles.input}
              value={testFamilyCircleName}
              onChangeText={setTestFamilyCircleName}
              placeholder="Family Circle Name"
              placeholderTextColor="#777777"
            />
          ) : (
            <TextInput
              style={styles.input}
              value={testInviteCode}
              onChangeText={setTestInviteCode}
              placeholder="Invite Code"
              placeholderTextColor="#777777"
              autoCapitalize="characters"
            />
          )}
        </View>

        {/* Profile Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Image</Text>
          <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.pickedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#777777" />
                <Text style={styles.placeholderText}>Tap to select an image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Test Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Actions</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.signupButton]} 
            onPress={handleTestSignUp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Sign Up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]} 
            onPress={handleTestLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.signoutButton]} 
            onPress={handleTestSignOut}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Sign Out</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.resetButton]} 
            onPress={handleTestPasswordReset}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Password Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.uploadButton]} 
            onPress={handleTestProfileImageUpload}
            disabled={isLoading || !profileImage}
          >
            <Text style={styles.buttonText}>Test Profile Image Upload</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.homeButton]} 
            onPress={goToHome}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Go to Home Screen</Text>
          </TouchableOpacity>
        </View>

        {/* Status Display */}
        {statusMessage ? (
          <View style={[styles.statusContainer, 
            statusType === 'success' ? styles.successStatus : 
            statusType === 'error' ? styles.errorStatus : 
            styles.infoStatus
          ]}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF8C00" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 30, // To offset the back button and center the title
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#111111',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  userInfoContainer: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 15,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  profileImagePlaceholderText: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  userInfoText: {
    fontSize: 14,
    color: '#DDDDDD',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#222222',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  imagePickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    backgroundColor: '#222222',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444444',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#777777',
    marginTop: 10,
  },
  pickedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signupButton: {
    backgroundColor: '#FF8C00',
  },
  loginButton: {
    backgroundColor: '#0088CC',
  },
  signoutButton: {
    backgroundColor: '#CC0000',
  },
  resetButton: {
    backgroundColor: '#888888',
  },
  uploadButton: {
    backgroundColor: '#00AA00',
  },
  homeButton: {
    backgroundColor: '#8800CC',
  },
  statusContainer: {
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  successStatus: {
    backgroundColor: 'rgba(0, 170, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#00AA00',
  },
  errorStatus: {
    backgroundColor: 'rgba(204, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#CC0000',
  },
  infoStatus: {
    backgroundColor: 'rgba(0, 136, 204, 0.2)',
    borderWidth: 1,
    borderColor: '#0088CC',
  },
  statusText: {
    color: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  radioContainer: {
    marginBottom: 12,
  },
  label: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  radioOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    flex: 1,
    backgroundColor: '#222222',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  radioButtonSelected: {
    backgroundColor: '#FF8C00',
  },
  radioText: {
    color: '#DDDDDD',
  },
  radioTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
}); 