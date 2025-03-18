import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function Events() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // If we have an ID, show event details instead of calendar
  if (id) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.detailsContainer}>
          <View style={styles.eventHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: '#fb8500' }]}>
              <Text style={styles.categoryText}>Family</Text>
            </View>
            <Text style={styles.eventTitle}>Event Details</Text>
            <Text style={styles.eventSubtitle}>
              This is where you would see all details for event ID: {id}
            </Text>
          </View>
          
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={24} color={Colors.ORANGE} />
              <Text style={styles.detailText}>10:30A - 11:30A</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={24} color={Colors.ORANGE} />
              <Text style={styles.detailText}>34 Carson Lane</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={24} color={Colors.ORANGE} />
              <Text style={styles.detailText}>4 participants</Text>
            </View>
          </View>
          
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              This is a placeholder for the event description. In a real implementation, this would show all the details about the event, including any notes, attachments, or special instructions.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // Otherwise show calendar view
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Calendar</Text>
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
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  eventHeader: {
    marginBottom: 25,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  categoryText: {
    color: Colors.WHITE,
    fontWeight: '600',
    fontSize: 12,
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
  },
  detailsSection: {
    backgroundColor: Colors.NAVY,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: Colors.WHITE,
    marginLeft: 15,
  },
  descriptionSection: {
    backgroundColor: Colors.NAVY,
    borderRadius: 15,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.LIGHT_GRAY,
    lineHeight: 22,
  },
}); 