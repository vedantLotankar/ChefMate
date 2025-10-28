import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  onNext: () => void;
  onPrevious: () => void;
}

const NavigationButtons: React.FC<Props> = ({ onNext, onPrevious }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPrevious}>
        <Text style={styles.text}>Previous Step</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.text}>Next Step</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  text: {
    color: '#fff',
  },
});

export default NavigationButtons;
