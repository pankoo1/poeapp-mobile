import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface QuickStatsData {
  tasksToday: number;
  completedToday: number;
  inProgress: number;
  pending: number;
}

interface QuickStatsProps {
  stats: QuickStatsData;
}

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color }) => {
  return (
    <View style={styles.statItem}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
};

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen de Hoy</Text>
      <View style={styles.statsGrid}>
        <StatItem
          icon="calendar-outline"
          label="Tareas hoy"
          value={stats.tasksToday}
          color="#667eea"
        />
        <StatItem
          icon="checkmark-circle"
          label="Completadas"
          value={stats.completedToday}
          color="#10b981"
        />
        <StatItem
          icon="refresh-circle"
          label="En progreso"
          value={stats.inProgress}
          color="#f59e0b"
        />
        <StatItem
          icon="time-outline"
          label="Pendientes"
          value={stats.pending}
          color="#3b82f6"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
