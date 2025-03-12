import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';
import { firestore, storage } from './config';
import { doc, setDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Type definitions
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  familyCircleId?: string;
  isAdmin?: boolean;
  createdAt: Date;
}

// Create a new user account
export const signUp = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  profileImageUri?: string | null,
  circleOption?: 'create' | 'join',
  familyCircleName?: string,
  inviteCode?: string
): Promise<User> => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create display name from first and last names
    const displayName = `${firstName} ${lastName}`;
    
    // Update user profile with display name
    await updateProfile(user, {
      displayName: displayName,
    });
    
    // Upload profile image if provided
    let photoURL;
    if (profileImageUri) {
      photoURL = await uploadProfileImage(user.uid, profileImageUri);
      // Update profile with photo URL
      await updateProfile(user, { photoURL });
    }
    
    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: email,
      firstName: firstName,
      lastName: lastName,
      displayName: displayName,
      photoURL: photoURL || null,
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(doc(firestore, 'users', user.uid), userDoc);
    
    // Handle family circle creation or joining
    if (circleOption === 'create' && familyCircleName) {
      // Create a new family circle
      const circleDoc = {
        name: familyCircleName,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        members: [user.uid],
        admins: [user.uid],
        inviteCode: generateInviteCode(),
      };
      
      const circleRef = await addDoc(collection(firestore, 'familyCircles'), circleDoc);
      
      // Update user's document with family circle ID
      await setDoc(doc(firestore, 'users', user.uid), {
        familyCircleId: circleRef.id,
        familyCircleRole: 'admin',
      }, { merge: true });
      
    } else if (circleOption === 'join' && inviteCode) {
      // TODO: Implement joining a family circle with invite code
      console.log('Joining family circle with invite code:', inviteCode);
      // This would involve:
      // 1. Query firestore for family circle with matching invite code
      // 2. Add user to members array
      // 3. Update user document with circle ID
    }
    
    return user;
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

// Login
export const logIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    return await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    return await firebaseSendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error during password reset:', error);
    throw error;
  }
};

// Get the currently logged in user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Check if user is logged in
export const isUserLoggedIn = (): boolean => {
  return auth.currentUser !== null;
};

// Update user profile
export const updateUserProfile = async (profileUpdates: {
  displayName?: string | null;
  photoURL?: string | null;
}): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User is not authenticated');
    
    await updateProfile(user, profileUpdates);
    
    // Update user document in Firestore
    await setDoc(doc(firestore, 'users', user.uid), profileUpdates, { merge: true });
    
    return;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (userId: string, imageUri: string): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, `profileImages/${userId}`);
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Generate a random invite code for family circles
const generateInviteCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}; 