import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tarea } from '../../types';

interface TaskCardProps {
  task: Tarea;
  onStart?: (taskId: number) => Promise<void>;
  onComplete?: (taskId: number) => Promise<void>;
  onViewRoute?: (taskId: number) => void;
}

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pendiente':
      return '#3b82f6'; // blue
    case 'en progreso':
    case 'en_progreso':
      return '#f59e0b'; // amber
    case 'completada':
      return '#10b981'; // green
    case 'cancelada':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

const getStatusLabel = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pendiente':
      return 'Pendiente';
    case 'en progreso':
    case 'en_progreso':
      return 'En Progreso';
    case 'completada':
      return 'Completada';
    case 'cancelada':
      return 'Cancelada';
    default:
      return status;
  }
};

const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
  switch (status.toLowerCase()) {
    case 'pendiente':
      return 'time-outline';
    case 'en progreso':
    case 'en_progreso':
      return 'refresh-outline';
    case 'completada':
      return 'checkmark-circle';
    case 'cancelada':
      return 'close-circle';
    default:
      return 'ellipse-outline';
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStart,
  onComplete,
  onViewRoute,
}) => {
  const statusColor = getStatusColor(task.estado);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleStart = async () => {
    if (!onStart) return;
    Alert.alert(
      'Iniciar tarea',
      '¿Estás seguro de que quieres iniciar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: async () => {
            try {
              await onStart(task.id_tarea);
            } catch (error) {
              Alert.alert('Error', 'No se pudo iniciar la tarea');
            }
          },
        },
      ]
    );
  };

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

  const handleViewRoute = () => {
    if (onViewRoute) {
      onViewRoute(task.id_tarea);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleExpand}
      style={[
        styles.card,
        {
          borderLeftColor: statusColor,
        },
      ]}
    >
      {/* Header de la tarjeta */}
      <View style={styles.cardHeader}>
        <View style={styles.taskIdContainer}>
          <Ionicons name="pricetag-outline" size={16} color="#666" />
          <Text style={styles.taskId}>
            Tarea #{task.id_tarea}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons name={getStatusIcon(task.estado)} size={14} color="#FFFFFF" />
            <Text style={styles.statusText}>{getStatusLabel(task.estado)}</Text>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </View>
      </View>

      {/* Resumen compacto */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Ionicons name="cube-outline" size={14} color="#666" />
          <Text style={styles.summaryText}>
            {task.productos.length} {task.productos.length === 1 ? 'producto' : 'productos'}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.summaryText}>
            {new Date(task.fecha_creacion).toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'short' 
            })}
          </Text>
        </View>
      </View>

      {/* Contenido expandible */}
      {isExpanded && (
        <>
          {/* Fecha completa */}
          <View style={[styles.dateContainer, { marginTop: 12 }]}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.dateText}>
              {formatDate(task.fecha_creacion)}
            </Text>
          </View>

          {/* Resumen de productos */}
          <View style={styles.productsContainer}>
            <View style={styles.productsHeader}>
              <Ionicons name="cube-outline" size={16} color="#1a1a1a" />
              <Text style={styles.productsTitle}>
                Total de productos
              </Text>
            </View>
            <View style={styles.productsSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Puntos de reposición:</Text>
                <Text style={styles.summaryValue}>{task.productos.length}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Unidades totales:</Text>
                <Text style={styles.summaryValue}>
                  {task.productos.reduce((sum, p) => sum + p.cantidad, 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            {task.estado.toLowerCase() === 'pendiente' && onStart && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleStart();
                }}
              >
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Iniciar</Text>
              </TouchableOpacity>
            )}

            {(task.estado.toLowerCase() === 'en progreso' || task.estado.toLowerCase() === 'en_progreso') && (
              <>
                {onComplete && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.successButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleComplete();
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Completar</Text>
                  </TouchableOpacity>
                )}
                {onViewRoute && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.infoButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleViewRoute();
                    }}
                  >
                    <Ionicons name="map" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Ver Ruta</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 0,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#666',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
  },
  productsContainer: {
    marginBottom: 16,
  },
  productsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  productsSummary: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  productItem: {
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingTop: 10,
    marginTop: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  productDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  productDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productDetailText: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  successButton: {
    backgroundColor: '#10b981',
  },
  infoButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
