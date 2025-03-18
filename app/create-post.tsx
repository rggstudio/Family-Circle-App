import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export default function CreatePost() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create Post Screen (Coming Soon)</Text>
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
  },
}); 