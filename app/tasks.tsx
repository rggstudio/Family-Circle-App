import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function Tasks() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // If we have an ID, show event edit form
  if (id) {
    const [title, setTitle] = useState('Edit Event');
    const [time, setTime] = useState('10:30A - 11:30A');
    const [location, setLocation] = useState('34 Carson Lane');
    
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.editContainer}>
          <Text style={styles.eventTitle}>Edit Event</Text>
          <Text style={styles.eventSubtitle}>
            Editing event ID: {id}
          </Text>
          
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Event Title</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={Colors.LIGHT_GRAY}
            />
            
            <Text style={styles.inputLabel}>Time</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="time-outline" size={24} color={Colors.ORANGE} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={time}
                onChangeText={setTime}
                placeholderTextColor={Colors.LIGHT_GRAY}
              />
            </View>
            
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="location-outline" size={24} color={Colors.ORANGE} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={Colors.LIGHT_GRAY}
              />
            </View>
          </View>
          
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // Otherwise show tasks list
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>All Tasks</Text>
        <Text style={styles.subtitle}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BLACK,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.LIGHT_GRAY,
  },
  editContainer: {
    flex: 1,
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginBottom: 8,
  },
  eventSubtitle: {
    fontSize: 16,
    color: Colors.LIGHT_GRAY,
    marginBottom: 25,
  },
  formSection: {
    backgroundColor: Colors.NAVY,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.LIGHT_GRAY,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: Colors.WHITE,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
  },
  saveButton: {
    backgroundColor: Colors.ORANGE,
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 