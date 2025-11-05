import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TaskService } from '@/services/task.service';
import { TaskMetricsComponent } from '@/components/tasks/TaskMetrics';
import { TaskFiltersComponent } from '@/components/tasks/TaskFilters';
import { TaskCardComponent } from '@/components/tasks/TaskCard';
import type { Task, TaskFilters, TaskMetrics, TaskStatus } from '@/types/task.types';

export default function TasksScreen() {
  const { theme } = useTheme();
  
  // Estados
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cargar tareas
  const loadTasks = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const response = await TaskService.getMyTasks();
      setTasks(response);
      calculateMetrics(response);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Calcular métricas
  const calculateMetrics = (taskList: Task[]) => {
    const metricsData: TaskMetrics = {
      total: taskList.length,
      completed: taskList.filter((t) => t.estado === 'completada').length,
      inProgress: taskList.filter((t) => t.estado === 'en_progreso').length,
      pending: taskList.filter((t) => t.estado === 'pendiente').length,
    };
    setMetrics(metricsData);
  };

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    let result = [...tasks];

    // Filtrar por estado
    if (filters.status !== 'todos') {
      result = result.filter((task) => task.estado === filters.status);
    }

    // Ordenar por fecha
    result.sort((a, b) => {
      const dateA = new Date(a.fecha_creacion).getTime();
      const dateB = new Date(b.fecha_creacion).getTime();
      return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredTasks(result);
  }, [tasks, filters]);

  // Refrescar tareas (pull to refresh)
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadTasks(false);
  }, []);

  // Iniciar tarea
  const handleStartTask = async (taskId: number) => {
    try {
      await TaskService.startTask(taskId);
      Alert.alert('Éxito', 'Tarea iniciada correctamente');
      await loadTasks(false);
    } catch (error: any) {
      console.error('Error starting task:', error);
      Alert.alert('Error', error.message || 'No se pudo iniciar la tarea');
    }
  };

  // Completar tarea
  const handleCompleteTask = async (taskId: number) => {
    try {
      await TaskService.completeTask(taskId);
      Alert.alert('Éxito', 'Tarea completada correctamente');
      await loadTasks(false);
    } catch (error: any) {
      console.error('Error completing task:', error);
      Alert.alert('Error', error.message || 'No se pudo completar la tarea');
    }
  };

  // Reiniciar tarea
  const handleRestartTask = async (taskId: number) => {
    try {
      await TaskService.restartTask(taskId);
      Alert.alert('Éxito', 'Tarea reiniciada correctamente');
      await loadTasks(false);
    } catch (error: any) {
      console.error('Error restarting task:', error);
      Alert.alert('Error', error.message || 'No se pudo reiniciar la tarea');
    }
  };

  // Ver ruta optimizada
  const handleViewRoute = async (taskId: number) => {
    try {
      const route = await TaskService.getOptimizedRoute(taskId);
      Alert.alert(
        'Ruta Optimizada',
        `Distancia total: ${route.distancia_total.toFixed(2)}m\nPuntos de reposición: ${route.puntos_reposicion.length}\nTiempo estimado: ${route.tiempo_estimado_minutos} min`,
        [{ text: 'OK' }]
      );
      // TODO: Implementar navegación a pantalla de ruta cuando esté lista
    } catch (error: any) {
      console.error('Error getting route:', error);
      Alert.alert('Error', error.message || 'No se pudo obtener la ruta');
    }
  };

  // Actualización automática cada 5 minutos
  useEffect(() => {
    loadTasks();
    const interval = setInterval(() => {
      loadTasks(false);
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Cargando tareas...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* Métricas */}
        <TaskMetricsComponent metrics={metrics} />

        {/* Filtros */}
        <TaskFiltersComponent filters={filters} onFilterChange={setFilters} />

        {/* Lista de tareas */}
        <View style={styles.tasksContainer}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {filters.status === 'todos'
                  ? 'No hay tareas asignadas'
                  : `No hay tareas ${filters.status === 'pendiente' ? 'pendientes' : filters.status === 'en_progreso' ? 'en progreso' : filters.status === 'completada' ? 'completadas' : ''}`}
              </Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <TaskCardComponent
                key={task.id_tarea}
                task={task}
                onStart={handleStartTask}
                onComplete={handleCompleteTask}
                onRestart={handleRestartTask}
                onViewRoute={handleViewRoute}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  tasksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
