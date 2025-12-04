import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

interface TaskMetricsComponentProps {
  metrics: TaskMetrics;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string];
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, gradientColors }) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.metricCard}
    >
      <View style={styles.metricIconContainer}>
        <Ionicons name={icon} size={28} color="#FFFFFF" />
      </View>
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
    </LinearGradient>
  );
};

export const TaskMetricsComponent: React.FC<TaskMetricsComponentProps> = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Total',
      value: metrics.total,
      icon: 'list' as keyof typeof Ionicons.glyphMap,
      gradientColors: ['#667eea', '#764ba2'] as [string, string],
    },
    {
      title: 'Completadas',
      value: metrics.completed,
      icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
      gradientColors: ['#38b2ac', '#2c7a7b'] as [string, string],
    },
    {
      title: 'En Progreso',
      value: metrics.inProgress,
      icon: 'refresh' as keyof typeof Ionicons.glyphMap,
      gradientColors: ['#f6ad55', '#ed8936'] as [string, string],
    },
    {
      title: 'Pendientes',
      value: metrics.pending,
      icon: 'time' as keyof typeof Ionicons.glyphMap,
      gradientColors: ['#4299e1', '#3182ce'] as [string, string],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.metricsGrid}>
        {metricCards.map((card, index) => (
          <MetricCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            gradientColors={card.gradientColors}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
});
