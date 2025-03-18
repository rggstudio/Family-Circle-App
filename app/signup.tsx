import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Button
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { signUp } from '../firebase/auth';
import { 
  getEmailError, 
  getPasswordError, 
  getNameError, 
  getFamilyCircleNameError, 
  getInviteCodeError 
} from '../utils/validation';
import Colors from '../constants/Colors';

interface SideMenuItems {
  profile: {
    photo: string;
    name: string;
  };
  settings: {
    account: boolean;
    familyCircle: boolean; // Only visible to admin
    notifications: boolean;
  };
  features: {
    lists: boolean; // V2 feature
    support: boolean;
  };
  appInfo: {
    version: string;
    logout: () => void;
  };
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  birthday: Date;
  email: string;
  profilePhoto: string;
  // Other basic profile fields
}

interface FamilyMemberRelationship {
  memberId: string;
  isChild: boolean;
  parentIds: string[];  // Can have multiple parents
  relationshipType: 'parent' | 'child' | 'adult';
}

interface FamilyCircleSettings {
  circleId: string;
  circleName: string;
  adminId: string;
  relationships: FamilyMemberRelationship[];
}

interface FamilyMemberManagement {
  member: {
    id: string;
    name: string;
    birthday: Date;
  };
  settings: {
    isChild: boolean;
    parents: {
      id: string;
      name: string;
    }[];
  };
}

interface BottomTabNavigator {
  Home: undefined;
  Calendar: undefined;
  Chat: undefined;
  CreatePost: undefined;
}

interface PostForm {
  title: string;
  content: string;
  image?: string;
  isPinned?: boolean; // Only visible to admin
}

interface CreatePostScreenProps {
  isAdmin: boolean;
  onSubmit: (post: PostForm) => Promise<void>;
  onPreview: (post: PostForm) => void;
}

interface PreviewModalProps {
  post: PostForm;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface PostNotification {
  type: 'new_post';
  postId: string;
  authorId: string;
  authorName: string;
  title: string;
  timestamp: Date;
}

function PreviewModal({ post, visible, onClose, onConfirm }: PreviewModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Preview Post</Text>
        
        <PostCard
          title={post.title}
          content={post.content}
          image={post.image}
          isPinned={post.isPinned}
          preview
        />

        <View style={styles.actionButtons}>
          <Button title="Edit" onPress={onClose} />
          <Button title="Confirm & Post" onPress={onConfirm} />
        </View>
      </View>
    </Modal>
  );
}

function PostCard({ title, content, image, isPinned, preview }: { 
  title: string; 
  content: string; 
  image?: string; 
  isPinned?: boolean;
  preview?: boolean;
}) {
  return (
    <View style={{ 
      backgroundColor: '#1E2132', 
      borderRadius: 12, 
      padding: 16, 
      marginBottom: 15 
    }}>
      <Text style={{ 
        color: Colors.ORANGE, 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 8 
      }}>{title}</Text>
      <Text style={{ color: '#FFFFFF', marginBottom: 10 }}>{content}</Text>
      {image && (
        <Image 
          source={{ uri: image }} 
          style={{ width: '100%', height: 200, borderRadius: 8 }}
          resizeMode="cover"
        />
      )}
      {isPinned && (
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginTop: 10 
        }}>
          <Ionicons name="pin" size={16} color="#FF8C00" />
          <Text style={{ color: '#FF8C00', marginLeft: 5, fontSize: 12 }}>Pinned</Text>
        </View>
      )}
    </View>
  );
}

async function sendPostNotification(post: PostForm, familyCircleId: string) {
  // This would be replaced with your actual implementation
  console.log('Sending notification for post', post.title, 'to circle', familyCircleId);
  
  // Mock implementation for type checking
  interface FamilyMember {
    id: string;
    name: string;
  }
  
  // Mock function to get family members
  const getFamilyMembers = async (circleId: string): Promise<FamilyMember[]> => {
    // This would fetch from Firebase in a real implementation
    return [{ id: '1', name: 'Test User' }];
  };
  
  // Get all family members except the author
  const familyMembers = await getFamilyMembers(familyCircleId);
  
  // Create notification for each member
  type Notification = {
    userId: string;
    notification: {
      type: string;
      postId?: string;
      authorId?: string;
      authorName?: string;
      title: string;
      timestamp: Date;
    }
  };
  
  const notifications: Notification[] = familyMembers.map((member: FamilyMember) => ({
    userId: member.id,
    notification: {
      type: 'new_post',
      // These fields would come from the actual post data in a real implementation
      title: post.title,
      timestamp: new Date()
    }
  }));
  
  // Mock function to send push notification
  const sendPushNotification = async (notification: Notification): Promise<void> => {
    console.log('Sending push notification to', notification.userId);
    // Implementation would go here
  };

  // Send push notifications
  await Promise.all(notifications.map(sendPushNotification));
}

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form validation errors
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [familyCircleNameError, setFamilyCircleNameError] = useState<string | null>(null);
  const [inviteCodeError, setInviteCodeError] = useState<string | null>(null);
  
  // Family Circle options
  const [circleOption, setCircleOption] = useState<'create' | 'join' | null>(null);
  const [familyCircleName, setFamilyCircleName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  const handleClose = () => {
    router.back();
  };
  
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }
      
      setIsUploading(true);
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const validateForm = (): boolean => {
    // Reset all errors
    setFirstNameError(null);
    setLastNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setFamilyCircleNameError(null);
    setInviteCodeError(null);
    
    // Validate fields
    const firstNameErr = getNameError(firstName, 'First name');
    const lastNameErr = getNameError(lastName, 'Last name');
    const emailErr = getEmailError(email);
    const passwordErr = getPasswordError(password);
    
    // Set errors if any
    if (firstNameErr) setFirstNameError(firstNameErr);
    if (lastNameErr) setLastNameError(lastNameErr);
    if (emailErr) setEmailError(emailErr);
    if (passwordErr) setPasswordError(passwordErr);
    
    // Validate Family Circle fields based on selected option
    if (circleOption === 'create') {
      const fcNameErr = getFamilyCircleNameError(familyCircleName);
      if (fcNameErr) setFamilyCircleNameError(fcNameErr);
      if (fcNameErr) return false;
    } else if (circleOption === 'join') {
      const inviteErr = getInviteCodeError(inviteCode);
      if (inviteErr) setInviteCodeError(inviteErr);
      if (inviteErr) return false;
    } else {
      // No circle option selected
      Alert.alert('Selection Required', 'Please select to either create or join a Family Circle');
      return false;
    }
    
    // Return true if no errors
    return !firstNameErr && !lastNameErr && !emailErr && !passwordErr;
  };
  
  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert null to undefined for circleOption
      const circleOptionToSend = circleOption === null ? undefined : circleOption;
      
      await signUp(
        email,
        password,
        firstName,
        lastName,
        profileImage,
        circleOptionToSend,
        familyCircleName,
        inviteCode
      );
      
      Alert.alert(
        'Account Created',
        'Your account has been successfully created!',
        [{ text: 'OK', onPress: () => router.replace('/home') }]
      );
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        setEmailError('This email is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setEmailError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setPasswordError('Password is too weak');
      } else {
        // Generic error
        Alert.alert('Sign Up Failed', error.message || 'An error occurred during sign up');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    router.back();
    setTimeout(() => {
      router.push('login' as any);
    }, 300);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#FF8C00" />
            </TouchableOpacity>
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Sign up to start connecting with your family
              </Text>
            </View>
            
            {/* Profile Image Selector */}
            <View style={styles.profileImageContainer}>
              <TouchableOpacity 
                style={styles.profileImageWrapper} 
                onPress={pickImage}
                activeOpacity={0.8}
              >
                {profileImage ? (
                  <Image 
                    source={{ uri: profileImage }} 
                    style={styles.profileImage} 
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person" size={56} color="#444444" />
                  </View>
                )}
                {isUploading ? (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#FF8C00" />
                  </View>
                ) : (
                  <View style={styles.addPhotoButton}>
                    <Ionicons name="camera" size={20} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.addPhotoText}>Add Profile Photo</Text>
            </View>
            
            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, firstNameError && styles.inputError]}
                  placeholder="First Name"
                  placeholderTextColor="#777777"
                  value={firstName}
                  onChangeText={text => {
                    setFirstName(text);
                    setFirstNameError(null);
                  }}
                  autoCapitalize="words"
                  editable={!isSubmitting}
                />
                {firstNameError && <Text style={styles.errorText}>{firstNameError}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, lastNameError && styles.inputError]}
                  placeholder="Last Name"
                  placeholderTextColor="#777777"
                  value={lastName}
                  onChangeText={text => {
                    setLastName(text);
                    setLastNameError(null);
                  }}
                  autoCapitalize="words"
                  editable={!isSubmitting}
                />
                {lastNameError && <Text style={styles.errorText}>{lastNameError}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, emailError && styles.inputError]}
                  placeholder="Email"
                  placeholderTextColor="#777777"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    setEmailError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
                {emailError && <Text style={styles.errorText}>{emailError}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <View style={[styles.passwordContainer, passwordError && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a password"
                    placeholderTextColor="#777777"
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      setPasswordError(null);
                    }}
                    secureTextEntry={!passwordVisible}
                    autoCapitalize="none"
                    editable={!isSubmitting}
                  />
                  <TouchableOpacity 
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    style={styles.eyeButton}
                    disabled={isSubmitting}
                  >
                    <Ionicons 
                      name={passwordVisible ? "eye-off" : "eye"} 
                      size={24} 
                      color="#777777" 
                    />
                  </TouchableOpacity>
                </View>
                {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
              </View>
              
              {/* Family Circle Options */}
              <View style={styles.familyCircleSection}>
                <Text style={styles.sectionTitle}>Family Circle</Text>
                
                <View style={styles.optionsContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.optionButton, 
                      circleOption === 'create' && styles.optionButtonSelected
                    ]}
                    onPress={() => {
                      setCircleOption('create');
                      setFamilyCircleNameError(null);
                    }}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                  >
                    <Text style={[
                      styles.optionText,
                      circleOption === 'create' && styles.optionTextSelected
                    ]}>Create Family Circle</Text>
                    <Text style={[
                      styles.optionDescription,
                      circleOption === 'create' && styles.optionDescriptionSelected
                    ]}>Start a new circle as admin</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.optionButton, 
                      circleOption === 'join' && styles.optionButtonSelected
                    ]}
                    onPress={() => {
                      setCircleOption('join');
                      setInviteCodeError(null);
                    }}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                  >
                    <Text style={[
                      styles.optionText,
                      circleOption === 'join' && styles.optionTextSelected
                    ]}>Join Family Circle</Text>
                    <Text style={[
                      styles.optionDescription,
                      circleOption === 'join' && styles.optionDescriptionSelected
                    ]}>Enter an invite code to join</Text>
                  </TouchableOpacity>
                </View>
                
                {circleOption === 'create' && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, familyCircleNameError && styles.inputError]}
                      placeholder="Family Circle Name (Ex: Smith Family)"
                      placeholderTextColor="#777777"
                      value={familyCircleName}
                      onChangeText={text => {
                        setFamilyCircleName(text);
                        setFamilyCircleNameError(null);
                      }}
                      autoCapitalize="words"
                      editable={!isSubmitting}
                    />
                    {familyCircleNameError && <Text style={styles.errorText}>{familyCircleNameError}</Text>}
                  </View>
                )}
                
                {circleOption === 'join' && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, inviteCodeError && styles.inputError]}
                      placeholder="Invite Code"
                      placeholderTextColor="#777777"
                      value={inviteCode}
                      onChangeText={text => {
                        setInviteCode(text);
                        setInviteCodeError(null);
                      }}
                      autoCapitalize="characters"
                      editable={!isSubmitting}
                    />
                    {inviteCodeError && <Text style={styles.errorText}>{inviteCodeError}</Text>}
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.signUpButton,
                  (isSubmitting || !firstName || !lastName || !email || !password || !circleOption || 
                   (circleOption === 'create' && !familyCircleName) || 
                   (circleOption === 'join' && !inviteCode)) && styles.signUpButtonDisabled
                ]}
                onPress={handleSignUp}
                activeOpacity={0.8}
                disabled={isSubmitting || !firstName || !lastName || !email || !password || !circleOption || 
                  (circleOption === 'create' && !familyCircleName) || 
                  (circleOption === 'join' && !inviteCode)}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.signUpButtonText}>SIGN UP</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By signing up, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
            
            {/* Login Link at Bottom */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text 
                  style={styles.loginLink}
                  onPress={navigateToLogin}
                >
                  Sign in
                </Text>
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 10,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 60 : 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#DDDDDD',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#222222',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeButton: {
    paddingHorizontal: 15,
  },
  familyCircleSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    paddingVertical: 16,
  },
  optionButtonSelected: {
    backgroundColor: '#FF8C00',
  },
  optionText: {
    fontSize: 14,
    color: '#AAAAAA',
    fontWeight: '500',
    marginBottom: 4,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
  },
  optionDescriptionSelected: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  signUpButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonDisabled: {
    backgroundColor: '#7d4400',
    opacity: 0.7,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  termsText: {
    color: '#AAAAAA',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: '#FF8C00',
    textDecorationLine: 'underline',
  },
  loginContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loginText: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  loginLink: {
    color: '#FF8C00',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    borderStyle: 'dashed',
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF8C00',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    color: '#DDDDDD',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  previewTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
}); 