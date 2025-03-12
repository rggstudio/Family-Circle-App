import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { resetPassword } from '../firebase/auth';
import { getEmailError } from '../utils/validation';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const handleClose = () => {
    router.back();
  };
  
  const handleSubmit = async () => {
    // Validate email
    const emailErr = getEmailError(email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      
      Alert.alert(
        'Reset Email Sent',
        'If an account exists with this email, you will receive instructions to reset your password.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/invalid-email') {
        setEmailError('Invalid email address');
      } else if (error.code === 'auth/user-not-found') {
        // For security reasons, we still show the success message even if the email doesn't exist
        Alert.alert(
          'Reset Email Sent',
          'If an account exists with this email, you will receive instructions to reset your password.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        // Generic error
        Alert.alert(
          'Error',
          error.message || 'An error occurred. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    router.back();
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
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you instructions to reset your password
              </Text>
            </View>
            
            {/* Form */}
            <View style={styles.form}>
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
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (isSubmitting || !email) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={isSubmitting || !email}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'SENDING...' : 'SEND RESET LINK'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.backToLoginContainer}>
                <Text style={styles.backToLoginText}>
                  Remember your password?{' '}
                  <Text 
                    style={styles.backToLoginLink}
                    onPress={navigateToLogin}
                  >
                    Back to Login
                  </Text>
                </Text>
              </View>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#DDDDDD',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#222222',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
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
  submitButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#7d4400',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToLoginContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  backToLoginLink: {
    color: '#FF8C00',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
}); 