import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TaskStatus = 'pendiente' | 'en progreso' | 'completada' | 'cancelada';

export interface TaskFilters {
  status: TaskStatus | 'todos';
  sortOrder: 'asc' | 'desc';
}

interface TaskFiltersProps {
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
}

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterButton,
        {
          backgroundColor: isActive ? '#007AFF' : '#ffffff',
          borderColor: isActive ? '#007AFF' : '#e5e7eb',
        },
      ]}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: isActive ? '#FFFFFF' : '#1a1a1a' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const TaskFiltersComponent: React.FC<TaskFiltersProps> = ({ filters, onFilterChange }) => {
  const statusOptions: Array<{ label: string; value: TaskStatus | 'todos' }> = [
    { label: 'Todas', value: 'todos' },
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'En Progreso', value: 'en progreso' },
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
    <View style={styles.container}>
      {/* Filtros de estado */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="funnel-outline" size={18} color="#1a1a1a" />
          <Text style={styles.sectionTitle}>Filtrar por estado</Text>
        </View>
        <View style={styles.filterRow}>
          {statusOptions.map((option) => (
            <FilterButton
              key={option.value}
              label={option.label}
              isActive={filters.status === option.value}
              onPress={() => handleStatusChange(option.value)}
            />
          ))}
        </View>
      </View>

      {/* Botón de ordenamiento */}
      <TouchableOpacity
        onPress={toggleSortOrder}
        style={styles.sortButton}
      >
        <Ionicons 
          name={filters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
          size={18} 
          color="#1a1a1a" 
        />
        <Text style={styles.sortButtonText}>
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
    backgroundColor: '#f9fafb',
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
    color: '#1a1a1a',
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
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
