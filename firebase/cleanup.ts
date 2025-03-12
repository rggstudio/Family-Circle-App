import { 
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { doc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, deleteObject, listAll } from "firebase/storage";
import { auth, firestore, storage } from "./config";

/**
 * Reauthenticate the current user with their email and password
 * This is required for sensitive operations like deleting accounts
 */
export const reauthenticateUser = async (email: string, password: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently signed in");
    }
    
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
  } catch (error) {
    console.error("Error reauthenticating user:", error);
    throw error;
  }
};

/**
 * Delete all user data from Firestore
 */
export const deleteUserData = async (userId: string): Promise<void> => {
  try {
    // Delete user document
    await deleteDoc(doc(firestore, "users", userId));
    
    // Here you would add more code to delete any other collections 
    // associated with the user, such as:
    // - Messages
    // - Family circle data
    // - Posts
    // - Comments
    // etc.
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
};

/**
 * Delete all user files from Storage
 */
export const deleteUserFiles = async (userId: string): Promise<void> => {
  try {
    // Delete profile image
    const profileImageRef = ref(storage, `profileImages/${userId}`);
    try {
      await deleteObject(profileImageRef);
    } catch (error) {
      // Ignore errors if file doesn't exist
      console.log("No profile image to delete or error deleting:", error);
    }
    
    // Delete all files in user's directory if it exists
    const userFilesRef = ref(storage, `userFiles/${userId}`);
    try {
      const filesList = await listAll(userFilesRef);
      const deletePromises = filesList.items.map((fileRef) => deleteObject(fileRef));
      await Promise.all(deletePromises);
    } catch (error) {
      // Ignore errors if directory doesn't exist
      console.log("No user files to delete or error listing files:", error);
    }
  } catch (error) {
    console.error("Error deleting user files:", error);
    throw error;
  }
};

/**
 * Delete the user's account and all associated data
 */
export const deleteAccount = async (email: string, password: string): Promise<void> => {
  try {
    // First reauthenticate the user
    await reauthenticateUser(email, password);
    
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently signed in");
    }
    
    const userId = user.uid;
    
    // Delete user data from Firestore
    await deleteUserData(userId);
    
    // Delete user files from Storage
    await deleteUserFiles(userId);
    
    // Finally, delete the user's authentication account
    await deleteUser(user);
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
}; 