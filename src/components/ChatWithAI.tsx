import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChatWithAI = () => {
  return (
    <View style={styles.container}>
      <TextInput placeholder="chat with ai...." placeholderTextColor="#777" style={styles.input} />
      <Ionicons name="search" size={22} color="#fff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    flex: 1,
    color: '#fff',
    marginRight: 10,
  },
});

export default ChatWithAI;
