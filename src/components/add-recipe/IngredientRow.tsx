import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../../utils/constants';
import { createStyles } from '../../utils/styles';
import { Ingredient } from '../../api/types';

interface IngredientRowProps {
  ingredient: Ingredient;
  onUpdate: (ingredient: Ingredient) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function IngredientRow({ 
  ingredient, 
  onUpdate, 
  onRemove, 
  canRemove 
}: IngredientRowProps) {
  const handleNameChange = (name: string) => {
    onUpdate({ ...ingredient, name });
  };

  const handleAmountChange = (amount: string) => {
    onUpdate({ ...ingredient, amount });
  };

  const handleUnitChange = (unit: string) => {
    onUpdate({ ...ingredient, unit });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder="Ingredient name"
          value={ingredient.name}
          onChangeText={handleNameChange}
          placeholderTextColor={COLORS.textSecondary}
        />
        
        <TextInput
          style={[styles.input, styles.amountInput]}
          placeholder="Amount"
          value={ingredient.amount}
          onChangeText={handleAmountChange}
          placeholderTextColor={COLORS.textSecondary}
        />
        
        <TextInput
          style={[styles.input, styles.unitInput]}
          placeholder="Unit"
          value={ingredient.unit || ''}
          onChangeText={handleUnitChange}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {canRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeButtonText}>−</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = createStyles({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  nameInput: {
    flex: 2,
    marginRight: SPACING.sm,
  },
  amountInput: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  unitInput: {
    flex: 1,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  removeButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
