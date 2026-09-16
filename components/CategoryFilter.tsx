import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from './Chip';
import { spacing } from '../theme/spacing';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory?: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategory, 
  onSelect 
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Chip 
          label="All" 
          selected={!selectedCategory} 
          onPress={() => onSelect('')} 
        />
        {categories.map((cat) => (
          <Chip 
            key={cat}
            label={cat} 
            selected={selectedCategory === cat} 
            onPress={() => onSelect(cat)} 
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
});
