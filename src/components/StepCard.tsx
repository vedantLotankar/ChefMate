import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { CookingStep } from '../api/types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, BLUR_CONFIG } from '../utils/constants';
import { createStyles, commonStyles, typography } from '../utils/styles';

interface StepCardProps {
  step: CookingStep;
  isActive: boolean;
  isCompleted: boolean;
  style?: any;
}

export const StepCard: React.FC<StepCardProps> = ({
  step,
  isActive,
  isCompleted,
  style,
}) => {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getStepIcon = () => {
    if (isCompleted) {
      return 'checkmark-circle';
    }
    if (isActive) {
      return 'play-circle';
    }
    return 'ellipse-outline';
  };

  const getStepIconColor = () => {
    if (isCompleted) {
      return COLORS.success;
    }
    if (isActive) {
      return COLORS.primary;
    }
    return COLORS.textSecondary;
  };

  const getCardBackgroundColor = () => {
    if (isActive) {
      return COLORS.primary + '10';
    }
    if (isCompleted) {
      return COLORS.success + '10';
    }
    return COLORS.surface;
  };

  return (
    <View style={[styles.container, style]}>
      {BLUR_CONFIG.enabled ? (
        <BlurView
          intensity={BLUR_CONFIG.intensities.medium}
          tint={BLUR_CONFIG.tints.light}
          style={[
            styles.blurContainer,
            { backgroundColor: getCardBackgroundColor() }
          ]}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.stepNumberContainer}>
                <Ionicons
                  name={getStepIcon()}
                  size={24}
                  color={getStepIconColor()}
                />
                <Text style={[styles.stepNumber, { color: getStepIconColor() }]}>
                  {step.stepNumber}
                </Text>
              </View>
              
              <View style={styles.metaContainer}>
                {step.duration && (
                  <View style={styles.durationContainer}>
                    <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.durationText}>
                      {formatDuration(step.duration)}
                    </Text>
                  </View>
                )}
                
                {step.temperature && (
                  <View style={styles.temperatureContainer}>
                    <Ionicons name="thermometer-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.temperatureText}>
                      {step.temperature}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <Text style={[
              styles.description,
              isActive && styles.descriptionActive,
              isCompleted && styles.descriptionCompleted,
            ]}>
              {step.description}
            </Text>
          </View>
        </BlurView>
      ) : (
        <View style={[
          styles.fallbackContainer,
          { backgroundColor: getCardBackgroundColor() }
        ]}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.stepNumberContainer}>
                <Ionicons
                  name={getStepIcon()}
                  size={24}
                  color={getStepIconColor()}
                />
                <Text style={[styles.stepNumber, { color: getStepIconColor() }]}>
                  {step.stepNumber}
                </Text>
              </View>
              
              <View style={styles.metaContainer}>
                {step.duration && (
                  <View style={styles.durationContainer}>
                    <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.durationText}>
                      {formatDuration(step.duration)}
                    </Text>
                  </View>
                )}
                
                {step.temperature && (
                  <View style={styles.temperatureContainer}>
                    <Ionicons name="thermometer-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.temperatureText}>
                      {step.temperature}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <Text style={[
              styles.description,
              isActive && styles.descriptionActive,
              isCompleted && styles.descriptionCompleted,
            ]}>
              {step.description}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = createStyles({
  container: {
    marginBottom: SPACING.md,
  },
  blurContainer: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fallbackContainer: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...commonStyles.shadowSm,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stepNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  durationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  temperatureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  descriptionActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  descriptionCompleted: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
});
