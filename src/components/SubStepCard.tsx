import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SubStepCardProps {
  text: string;
}

const SubStepCard: React.FC<SubStepCardProps> = ({ text }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default SubStepCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    color: "#333",
    fontSize: 14,
  },
});