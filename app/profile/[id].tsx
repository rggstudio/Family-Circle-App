import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Colors from '../../constants/Colors';

export default function Profile() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen (Coming Soon)</Text>
      <Text style={styles.text}>Profile ID: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.WHITE,
    fontSize: 18,
    marginVertical: 5,
  },
}); 