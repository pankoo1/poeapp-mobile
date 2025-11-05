import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Task, TaskStatus } from '@/types/task.types';

interface TaskCardProps {
  task: Task;
  onStart?: (taskId: number) => Promise<void>;
  onComplete?: (taskId: number) => Promise<void>;
  onRestart?: (taskId: number) => Promise<void>;
  onViewRoute?: (taskId: number) => void;
}

const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'pendiente':
      return '#3b82f6'; // blue
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

const getStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case 'pendiente':
      return 'Pendiente';
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

const getStatusIcon = (status: TaskStatus): string => {
  switch (status) {
    case 'pendiente':
      return 'clock.fill';
    case 'en_progreso':
      return 'arrow.clockwise';
    case 'completada':
      return 'checkmark.circle.fill';
    case 'cancelada':
      return 'xmark.circle.fill';
    default:
      return 'circle.fill';
  }
};

export const TaskCardComponent: React.FC<TaskCardProps> = ({
  task,
  onStart,
  onComplete,
  onRestart,
  onViewRoute,
}) => {
  const { theme } = useTheme();
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

  const handleRestart = async () => {
    if (!onRestart) return;
    Alert.alert(
      'Reiniciar tarea',
      '¿Estás seguro de que quieres reiniciar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          onPress: async () => {
            try {
              await onRestart(task.id_tarea);
            } catch (error) {
              Alert.alert('Error', 'No se pudo reiniciar la tarea');
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
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          borderLeftColor: statusColor,
        },
      ]}
    >
      {/* Header de la tarjeta - Siempre visible */}
      <View style={styles.cardHeader}>
        <View style={styles.taskIdContainer}>
          <IconSymbol name="number" size={16} color={theme.textSecondary} />
          <Text style={[styles.taskId, { color: theme.textSecondary }]}>
            Tarea #{task.id_tarea}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <IconSymbol name={getStatusIcon(task.estado) as any} size={14} color="#FFFFFF" />
            <Text style={styles.statusText}>{getStatusLabel(task.estado)}</Text>
          </View>
          <IconSymbol 
            name={isExpanded ? "chevron.up" : "chevron.down"} 
            size={20} 
            color={theme.textSecondary} 
          />
        </View>
      </View>

      {/* Resumen compacto - Siempre visible */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <IconSymbol name="shippingbox.fill" size={14} color={theme.textSecondary} />
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
            {task.productos.length} {task.productos.length === 1 ? 'producto' : 'productos'}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <IconSymbol name="calendar" size={14} color={theme.textSecondary} />
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
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
            <IconSymbol name="calendar" size={14} color={theme.textSecondary} />
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
              {formatDate(task.fecha_creacion)}
            </Text>
          </View>

          {/* Lista de productos */}
          <View style={styles.productsContainer}>
            <View style={styles.productsHeader}>
              <IconSymbol name="shippingbox.fill" size={16} color={theme.textPrimary} />
              <Text style={[styles.productsTitle, { color: theme.textPrimary }]}>
                Productos ({task.productos.length})
              </Text>
            </View>
            {task.productos.map((product, index) => (
              <View key={index} style={[styles.productItem, { borderColor: theme.border }]}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: theme.textPrimary }]} numberOfLines={2}>
                    {product.nombre}
                  </Text>
                  <View style={styles.productDetails}>
                    <View style={styles.productDetail}>
                      <IconSymbol name="location.fill" size={12} color={theme.textSecondary} />
                      <Text style={[styles.productDetailText, { color: theme.textSecondary }]}>
                        {product.ubicacion.estanteria} - N{product.ubicacion.nivel}
                      </Text>
                    </View>
                    <View style={styles.productDetail}>
                      <IconSymbol name="number" size={12} color={theme.textSecondary} />
                      <Text style={[styles.productDetailText, { color: theme.textSecondary }]}>
                        Cant: {product.cantidad}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            {task.estado === 'pendiente' && onStart && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.primary }]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleStart();
                }}
              >
                <IconSymbol name="play.fill" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Iniciar</Text>
              </TouchableOpacity>
            )}

            {task.estado === 'en_progreso' && (
              <>
                {onComplete && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.successButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleComplete();
                    }}
                  >
                    <IconSymbol name="checkmark.circle.fill" size={16} color="#FFFFFF" />
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
                    <IconSymbol name="map.fill" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Ver Ruta</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {task.estado === 'completada' && onRestart && (
              <TouchableOpacity
                style={[styles.actionButton, styles.warningButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleRestart();
                }}
              >
                <IconSymbol name="arrow.clockwise" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Reiniciar</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
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
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
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
  },
  productItem: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
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
    // backgroundColor set dynamically
  },
  successButton: {
    backgroundColor: '#10b981',
  },
  infoButton: {
    backgroundColor: '#3b82f6',
  },
  warningButton: {
    backgroundColor: '#f59e0b',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
