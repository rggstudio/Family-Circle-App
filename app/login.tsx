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
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { logIn } from '../firebase/auth';
import { getEmailError } from '../utils/validation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const handleClose = () => {
    router.back();
  };
  
  const handleLogin = async () => {
    // Validate input
    const emailErr = getEmailError(email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await logIn(email, password);
      
      // Successful login, navigate to home screen
      router.replace('/home');
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/invalid-email') {
        setEmailError('Invalid email address');
      } else if (error.code === 'auth/user-not-found') {
        setEmailError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setPasswordError('Incorrect password');
      } else {
        // Generic error message
        Alert.alert(
          'Login Failed', 
          error.message || 'An error occurred during login. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('forgot-password' as any);
  };

  const navigateToSignUp = () => {
    router.back();
    setTimeout(() => {
      router.push('signup' as any);
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
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Log in to connect with your family
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
              
              <View style={styles.inputContainer}>
                <View style={[styles.passwordContainer, passwordError && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
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
              
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
                disabled={isSubmitting}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.loginButton,
                  (isSubmitting || !email || !password) && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={isSubmitting || !email || !password}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>LOG IN</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>
                  Don't have an account?{' '}
                  <Text 
                    style={styles.registerLink}
                    onPress={navigateToSignUp}
                  >
                    Sign Up
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
    marginBottom: 30,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FF8C00',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#7d4400',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  registerText: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  registerLink: {
    color: '#FF8C00',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
}); 