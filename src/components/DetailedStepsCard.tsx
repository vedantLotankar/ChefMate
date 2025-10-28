import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  steps: string[];
}

const DetailedStepsCard: React.FC<Props> = ({ steps }) => {
  return (
    <View style={styles.card}>
      {steps.map((step, index) => (
        <Text key={index} style={styles.stepText}>{step}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderColor: '#333',
    borderWidth: 1,
  },
  stepText: {
    color: '#fff',
    marginVertical: 3,
    fontSize: 14,
  },
});

export default DetailedStepsCard;
