import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AIChatBar = () => {
  return (
    <View style={styles.chatContainer}>
      <Text style={styles.placeholder}>Chat with AI...</Text>
      <TouchableOpacity style={styles.chatButton}>
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

export default AIChatBar;

const styles = StyleSheet.create({
  chatContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF7F0",
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  placeholder: {
    fontSize: 14,
    color: "#777",
  },
  chatButton: {
    backgroundColor: "#FF6B00",
    borderRadius: 25,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
