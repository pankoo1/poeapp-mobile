import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tarea } from '../../types';

interface ActiveTaskCardProps {
  task: Tarea | null;
  onComplete?: (taskId: number) => Promise<void>;
  onViewDetails?: (taskId: number) => void;
}

export const ActiveTaskCard: React.FC<ActiveTaskCardProps> = ({
  task,
  onComplete,
  onViewDetails,
}) => {
  if (!task) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle-outline" size={48} color="#10b981" />
          <Text style={styles.emptyTitle}>No hay tareas activas</Text>
          <Text style={styles.emptySubtitle}>
            ¡Buen trabajo! Inicia una tarea desde la pestaña Tareas
          </Text>
        </View>
      </View>
    );
  }

  const handleComplete = async () => {
    if (!onComplete) return;
    Alert.alert(
      'Completar tarea',
      '¿Estás seguro de que quieres marcar esta tarea como completada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: async () => {
            try {
              await onComplete(task.id_tarea);
            } catch (error) {
              Alert.alert('Error', 'No se pudo completar la tarea');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flash" size={20} color="#f59e0b" />
          <Text style={styles.title}>Tarea Activa</Text>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>En progreso</Text>
        </View>
      </View>

      <View style={styles.taskInfo}>
        <Text style={styles.taskId}>Tarea #{task.id_tarea}</Text>
        <View style={styles.productInfo}>
          <Ionicons name="cube-outline" size={16} color="#666" />
          <Text style={styles.productCount}>
            {task.productos.length} {task.productos.length === 1 ? 'producto' : 'productos'}
          </Text>
        </View>
      </View>

      {task.productos.length > 0 && (
        <View style={styles.firstProduct}>
          <Text style={styles.productName} numberOfLines={1}>
            {task.productos[0].nombre}
          </Text>
          <Text style={styles.productLocation}>
            📍 {task.productos[0].ubicacion.estanteria} - Nivel {task.productos[0].ubicacion.nivel}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {onComplete && (
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>Completar</Text>
          </TouchableOpacity>
        )}
        {onViewDetails && (
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => onViewDetails(task.id_tarea)}
          >
            <Text style={styles.detailsButtonText}>Ver detalles</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  taskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productCount: {
    fontSize: 13,
    color: '#666',
  },
  firstProduct: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#f0f9ff',
    paddingVertical: 10,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});
