import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { signOut as firebaseSignOut } from '../firebase/auth';

// Define the shape of our context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Create a provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state change listener
    const unsubscribe = auth.onAuthStateChanged(
      (authUser) => {
        if (authUser) {
          setUser(authUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError('Failed to authenticate. Please try again.');
        setLoading(false);
      }
    );

    // Clean up the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out. Please try again.');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 