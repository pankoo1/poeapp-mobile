import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { TaskStatus, TaskFilters as TaskFiltersType } from '@/types/task.types';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFilterChange: (filters: TaskFiltersType) => void;
}

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  theme: any;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onPress, theme }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterButton,
        {
          backgroundColor: isActive ? theme.primary : theme.cardBackground,
          borderColor: isActive ? theme.primary : theme.border,
        },
      ]}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: isActive ? '#FFFFFF' : theme.textPrimary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const TaskFiltersComponent: React.FC<TaskFiltersProps> = ({ filters, onFilterChange }) => {
  const { theme, isDarkMode } = useTheme();

  const statusOptions: Array<{ label: string; value: TaskStatus | 'todos' }> = [
    { label: 'Todas', value: 'todos' },
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'En Progreso', value: 'en_progreso' },
    { label: 'Completadas', value: 'completada' },
  ];

  const handleStatusChange = (value: TaskStatus | 'todos') => {
    onFilterChange({
      ...filters,
      status: value,
    });
  };

  const toggleSortOrder = () => {
    onFilterChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Filtros de estado */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="line.3.horizontal.decrease.circle" size={18} color={theme.textPrimary} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Filtrar por estado</Text>
        </View>
        <View style={styles.filterRow}>
          {statusOptions.map((option) => (
            <FilterButton
              key={option.value}
              label={option.label}
              isActive={filters.status === option.value}
              onPress={() => handleStatusChange(option.value)}
              theme={theme}
            />
          ))}
        </View>
      </View>

      {/* Botón de ordenamiento */}
      <TouchableOpacity
        onPress={toggleSortOrder}
        style={[styles.sortButton, { 
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        }]}
      >
        <IconSymbol 
          name={filters.sortOrder === 'asc' ? 'arrow.up' : 'arrow.down'} 
          size={18} 
          color={theme.textPrimary} 
        />
        <Text style={[styles.sortButtonText, { color: theme.textPrimary }]}>
          {filters.sortOrder === 'asc' ? 'Más antiguas primero' : 'Más recientes primero'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
