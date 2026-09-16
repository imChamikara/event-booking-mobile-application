import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChangeText, 
  placeholder = 'Search...',
  onClear
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={colors.slate} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.slate}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => { onChangeText(''); onClear?.(); }} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={18} color={colors.slate} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    height: 48,
    marginVertical: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    color: colors.ink,
    height: '100%',
  },
  clearBtn: {
    padding: spacing.xs,
  }
});
