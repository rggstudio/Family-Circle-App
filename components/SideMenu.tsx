import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

interface SideMenuProps {
  onClose: () => void;
}

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  adminOnly?: boolean;
  disabled?: boolean;
}

export default function SideMenu({ onClose }: SideMenuProps) {
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

  const menuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      label: 'Account Settings',
      onPress: () => console.log('Account Settings - Coming Soon'),
      disabled: true,
    },
    {
      icon: 'people-outline',
      label: 'Family Circle Settings',
      onPress: () => console.log('Family Circle Settings - Coming Soon'),
      adminOnly: true,
      disabled: true,
    },
    {
      icon: 'notifications-outline',
      label: 'Notification Preferences',
      onPress: () => console.log('Notification Settings - Coming Soon'),
      disabled: true,
    },
    {
      icon: 'list-outline',
      label: 'Lists (Coming Soon)',
      onPress: () => {},
      disabled: true,
    },
    {
      icon: 'help-circle-outline',
      label: 'Support',
      onPress: () => console.log('Support - Coming Soon'),
      disabled: true,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topMargin} />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Menu</Text>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.closeButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="close" size={28} color={Colors.ORANGE} />
          </TouchableOpacity>
        </View>
      </View>

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
        <Text style={styles.userName}>
          {user?.displayName || 'User'}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <ScrollView style={styles.menuItems}>
        {menuItems.map((item, index) => (
          // Skip admin-only items if user is not admin
          // For now we're showing all items - in the future, add isAdmin check
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              item.disabled && styles.menuItemDisabled
            ]}
            onPress={item.onPress}
            disabled={item.disabled}
          >
            <Ionicons name={item.icon} size={24} color={Colors.ORANGE} />
            <Text style={styles.menuItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color={Colors.WHITE} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.NAVY,
  },
  topMargin: {
    height: 35,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.WHITE,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.ORANGE,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.ORANGE,
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    color: Colors.WHITE,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginVertical: 5,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.LIGHT_GRAY,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.WHITE,
    marginLeft: 15,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  versionText: {
    fontSize: 12,
    color: Colors.LIGHT_GRAY,
    textAlign: 'center',
    marginBottom: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.ORANGE,
    padding: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.WHITE,
    fontWeight: 'bold',
    marginLeft: 10,
  },
}); 