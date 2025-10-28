import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Ingredient {
  name: string;
  quantity: string;
}

interface Props {
  title: string;
  description: string;
  time: string;
  ingredients: Ingredient[];
}

const StepCard: React.FC<Props> = ({ title, description, time, ingredients }) => {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{description}</Text>
        {ingredients.map((item, index) => (
          <View key={index} style={styles.ingredientRow}>
            <Text style={styles.ingredient}>{item.name}</Text>
            <Text style={styles.quantity}>{item.quantity}</Text>
          </View>
        ))}
      </View>

      <View style={styles.right}>
        <Text style={styles.time}>{time}</Text>
        <View style={styles.controls}>
          <Ionicons name="play-skip-back" size={22} color="#fff" />
          <Ionicons name="play" size={28} color="#fff" style={styles.playIcon} />
          <Ionicons name="play-skip-forward" size={22} color="#fff" />
        </View>
        <View style={styles.imagePlaceholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderColor: '#333',
    borderWidth: 1,
  },
  left: {
    flex: 2,
  },
  right: {
    flex: 1,
    alignItems: 'center',
  },
  stepTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepDesc: {
    color: '#ccc',
    fontSize: 14,
    marginVertical: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ingredient: {
    color: '#fff',
  },
  quantity: {
    color: '#ccc',
  },
  time: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  playIcon: {
    marginHorizontal: 8,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderColor: '#444',
    borderWidth: 1,
  },
});

export default StepCard;
