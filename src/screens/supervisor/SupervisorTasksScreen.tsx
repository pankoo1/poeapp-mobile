import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TaskCard } from '../../components/tasks';
import { obtenerTareas, crearTarea } from '../../api/tareaService';
import type { Tarea } from '../../types';

interface TaskMetricsData {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

interface FilterButton {
  key: string;
  label: string;
  color: string;
}

export const SupervisorTasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [metrics, setMetrics] = useState<TaskMetricsData>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('todas');

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      
      // Supervisor puede ver todas las tareas
      const tasksData = await obtenerTareas();
      
      // Calcular métricas de forma eficiente en un solo recorrido
      const metricsData = tasksData.reduce((acc, task) => {
        acc.total++;
        if (task.estado === 'completada') acc.completed++;
        else if (task.estado === 'en progreso') acc.inProgress++;
        else if (task.estado === 'pendiente') acc.pending++;
        return acc;
      }, { total: 0, completed: 0, inProgress: 0, pending: 0 });
      
      setTasks(tasksData);
      setMetrics(metricsData);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, []);

  // Usar useMemo para evitar recalcular el filtro innecesariamente
  const filteredTasks = useMemo(() => {
    if (selectedFilter === 'completadas') {
      return tasks.filter((t) => t.estado === 'completada');
    } else if (selectedFilter === 'en_progreso') {
      return tasks.filter((t) => t.estado === 'en progreso');
    } else if (selectedFilter === 'pendientes') {
      return tasks.filter((t) => t.estado === 'pendiente');
    }
    return tasks;
  }, [selectedFilter, tasks]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleCreateTask = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleTaskAction = useCallback((taskId: number, action: string) => {
    Alert.alert('Acción', `${action} tarea #${taskId}`);
    // TODO: Implementar acciones (asignar, reasignar, cancelar)
  }, []);

  const renderTaskItem = useCallback(({ item }: { item: Tarea }) => (
    <TaskCard task={item} />
  ), []);

  const ListHeaderComponent = useCallback(() => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gestión de Tareas</Text>
          <Text style={styles.subtitle}>Todas las tareas del sistema</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateTask}>
          <Ionicons name="add-circle" size={32} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Métricas */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[styles.metricValue, { color: '#3b82f6' }]}>{metrics.total}</Text>
            <Text style={styles.metricLabel}>Total</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.metricValue, { color: '#f59e0b' }]}>{metrics.inProgress}</Text>
            <Text style={styles.metricLabel}>En Progreso</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.metricValue, { color: '#10b981' }]}>{metrics.completed}</Text>
            <Text style={styles.metricLabel}>Completadas</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#EDE9FE' }]}>
            <Text style={[styles.metricValue, { color: '#6366f1' }]}>{metrics.pending}</Text>
            <Text style={styles.metricLabel}>Pendientes</Text>
          </View>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'todas' && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('todas')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'todas' && styles.filterButtonTextActive,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'en_progreso' && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('en_progreso')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'en_progreso' && styles.filterButtonTextActive,
              ]}
            >
              En Progreso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'pendientes' && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('pendientes')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'pendientes' && styles.filterButtonTextActive,
              ]}
            >
              Pendientes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'completadas' && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('completadas')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'completadas' && styles.filterButtonTextActive,
              ]}
            >
              Completadas
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Header de lista de tareas */}
      <View style={styles.tasksContainer}>
        <View style={styles.tasksHeader}>
          <Text style={styles.tasksTitle}>
            {selectedFilter === 'todas' ? 'Todas las Tareas' :
             selectedFilter === 'completadas' ? 'Tareas Completadas' :
             selectedFilter === 'en_progreso' ? 'En Progreso' :
             'Tareas Pendientes'}
          </Text>
          <Text style={styles.tasksCount}>{filteredTasks.length}</Text>
        </View>
      </View>
    </>
  ), [metrics, selectedFilter, filteredTasks.length, handleFilterChange, handleCreateTask]);

  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyState}>
      <Ionicons name="file-tray-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyStateText}>
        {selectedFilter === 'todas'
          ? 'No hay tareas registradas'
          : `No hay tareas ${selectedFilter.replace('_', ' ')}`}
      </Text>
    </View>
  ), [selectedFilter]);

  const ListFooterComponent = useCallback(() => (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <Ionicons name="bulb" size={20} color="#f59e0b" />
        <Text style={styles.tipTitle}>Consejo</Text>
      </View>
      <Text style={styles.tipText}>
        Asigna tareas de forma equitativa entre los reponedores para optimizar el trabajo.
      </Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: Tarea) => item.id_tarea.toString(), []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ marginTop: 10, color: '#6B7280' }}>Cargando tareas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.flatListContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />

      {/* Modal para crear tarea */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Tarea</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalText}>
              Funcionalidad de creación de tareas en desarrollo.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flatListContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  createButton: {
    padding: 8,
  },
  metricsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  tasksContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tasksCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  tipText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
