import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TaskCard, TaskMetricsComponent, TaskFiltersComponent } from '../../components/tasks';
import type { TaskMetrics, TaskFilters } from '../../components/tasks';
import { tareaService } from '../../api';
import { Tarea } from '../../types';

export const ReponedorTasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Tarea[]>([]);
  const [metrics, setMetrics] = useState<TaskMetrics>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
  });
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'todos',
    sortOrder: 'desc',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar tareas
  const loadTasks = async () => {
    try {
      const data = await tareaService.getTareas();
      setTasks(data);
      calculateMetrics(data);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calcular métricas
  const calculateMetrics = (taskList: Tarea[]) => {
    const newMetrics: TaskMetrics = {
      total: taskList.length,
      completed: taskList.filter((t) => t.estado.toLowerCase() === 'completada').length,
      inProgress: taskList.filter((t) => 
        t.estado.toLowerCase() === 'en progreso' || 
        t.estado.toLowerCase() === 'en_progreso'
      ).length,
      pending: taskList.filter((t) => t.estado.toLowerCase() === 'pendiente').length,
    };
    setMetrics(newMetrics);
  };

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    let filtered = [...tasks];

    // Filtrar por estado
    if (filters.status !== 'todos') {
      filtered = filtered.filter((task) => {
        const taskStatus = task.estado.toLowerCase();
        const filterStatus = filters.status.toLowerCase();
        
        // Normalizar "en progreso" y "en_progreso"
        if (filterStatus === 'en progreso') {
          return taskStatus === 'en progreso' || taskStatus === 'en_progreso';
        }
        
        return taskStatus === filterStatus;
      });
    }

    // Ordenar por fecha
    filtered.sort((a, b) => {
      const dateA = new Date(a.fecha_creacion).getTime();
      const dateB = new Date(b.fecha_creacion).getTime();
      return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredTasks(filtered);
  }, [tasks, filters]);

  // Iniciar tarea
  const handleStartTask = async (taskId: number) => {
    try {
      await tareaService.iniciarTarea(taskId);
      await loadTasks();
      Alert.alert('Éxito', 'Tarea iniciada correctamente');
    } catch (error: any) {
      console.error('Error starting task:', error);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo iniciar la tarea');
    }
  };

  // Completar tarea
  const handleCompleteTask = async (taskId: number) => {
    try {
      await tareaService.completarTarea(taskId);
      await loadTasks();
      Alert.alert('Éxito', 'Tarea completada correctamente');
    } catch (error: any) {
      console.error('Error completing task:', error);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo completar la tarea');
    }
  };

  // Ver ruta - Navega a la pantalla de ruta
  const handleViewRoute = (taskId: number) => {
    const task = tasks.find((t) => t.id_tarea === taskId);
    if (!task) {
      Alert.alert('Error', 'No se encontró la tarea');
      return;
    }

    // Verificar que la tarea esté en progreso
    const estado = task.estado.toLowerCase();
    if (estado !== 'en progreso' && estado !== 'en_progreso') {
      Alert.alert(
        'Información',
        'Debes iniciar la tarea primero para ver la ruta',
        [{ text: 'OK' }]
      );
      return;
    }

    // Navegar a la pantalla de ruta
    navigation.navigate('Ruta' as never);
  };

  // Manejar cambio de filtros
  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  // Refrescar
  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  // Efectos
  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters, applyFilters]);

  // Renderizar tarjeta de tarea
  const renderTask = ({ item }: { item: Tarea }) => (
    <TaskCard
      task={item}
      onStart={handleStartTask}
      onComplete={handleCompleteTask}
      onViewRoute={handleViewRoute}
    />
  );

  // Vista vacía
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={64} color="#9ca3af" />
      <Text style={styles.emptyText}>No hay tareas</Text>
      <Text style={styles.emptySubtext}>
        {filters.status !== 'todos'
          ? 'No se encontraron tareas con este filtro'
          : 'Aún no tienes tareas asignadas'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando tareas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id_tarea.toString()}
        ListHeaderComponent={
          <>
            <TaskMetricsComponent metrics={metrics} />
            <TaskFiltersComponent filters={filters} onFilterChange={handleFilterChange} />
          </>
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredTasks.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
