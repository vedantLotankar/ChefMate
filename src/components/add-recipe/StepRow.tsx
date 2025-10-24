import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../../utils/constants';
import { createStyles } from '../../utils/styles';
import { CookingStep } from '../../api/types';

interface StepRowProps {
  step: CookingStep;
  onUpdate: (step: CookingStep) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function StepRow({ 
  step, 
  onUpdate, 
  onRemove, 
  canRemove 
}: StepRowProps) {
  const handleDescriptionChange = (description: string) => {
    onUpdate({ ...step, description });
  };

  const handleDurationChange = (duration: string) => {
    const durationNum = duration === '' ? undefined : parseInt(duration, 10);
    onUpdate({ ...step, duration: durationNum });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Step description"
          value={step.description}
          onChangeText={handleDescriptionChange}
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={3}
        />
        
        <TextInput
          style={[styles.input, styles.durationInput]}
          placeholder="Duration (min)"
          value={step.duration?.toString() || ''}
          onChangeText={handleDurationChange}
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="numeric"
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
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  descriptionInput: {
    flex: 2,
    marginRight: SPACING.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  durationInput: {
    flex: 1,
    textAlign: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    marginTop: 4,
  },
  removeButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
