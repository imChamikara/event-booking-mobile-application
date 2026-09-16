import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={index}>
            <View 
              style={[
                styles.step, 
                isActive || isCompleted ? styles.stepActive : styles.stepInactive
              ]}
            >
              <Text 
                style={[
                  styles.stepText,
                  isActive || isCompleted ? styles.textActive : styles.textInactive
                ]}
              >
                {stepNumber}
              </Text>
            </View>
            
            {index < totalSteps - 1 && (
              <View 
                style={[
                  styles.line,
                  isCompleted ? styles.lineActive : styles.lineInactive
                ]} 
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  stepActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.mist,
  },
  stepText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
  },
  textActive: {
    color: colors.white,
  },
  textInactive: {
    color: colors.slate,
  },
  line: {
    flex: 1,
    height: 2,
    maxWidth: 40,
    marginHorizontal: spacing.xs,
  },
  lineActive: {
    backgroundColor: colors.primary,
  },
  lineInactive: {
    backgroundColor: colors.mist,
  }
});
