import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReponedorCardProps {
  nombre: string;
  tasksInProgress: number;
  tasksCompleted: number;
  onPress?: () => void;
}

export const ReponedorCard: React.FC<ReponedorCardProps> = ({
  nombre,
  tasksInProgress,
  tasksCompleted,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Ionicons name="person" size={24} color="#3b82f6" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{nombre}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="time" size={14} color="#f59e0b" />
            <Text style={styles.statText}>{tasksInProgress} en progreso</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="checkmark-circle" size={14} color="#10b981" />
            <Text style={styles.statText}>{tasksCompleted} completadas</Text>
          </View>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
