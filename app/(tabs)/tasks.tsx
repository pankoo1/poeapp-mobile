import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { TaskService } from '@/services/task.service';
import { TaskMetricsComponent } from '@/components/tasks/TaskMetrics';
import { TaskFiltersComponent } from '@/components/tasks/TaskFilters';
import { TaskCardComponent } from '@/components/tasks/TaskCard';
import { CustomHeader } from '@/components/drawer/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Task, TaskFilters, TaskMetrics, TaskStatus } from '@/types/task.types';
import { useTaskActive } from '@/contexts/TaskActiveContext';

export default function TasksScreen() {
  const { theme } = useTheme();
  const { setActiveTask } = useTaskActive();
  const router = useRouter();
  
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
  const [hasError, setHasError] = useState(false);

  // Cargar tareas
  const loadTasks = async (showLoading = true) => {
    if (hasError) return; // No intentar cargar si ya hubo error de sesión
    
    try {
      if (showLoading) setIsLoading(true);
      const response = await TaskService.getMyTasks();
      setTasks(response);
      calculateMetrics(response);
      setHasError(false);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      // Si es error de sesión, marcar flag para detener intentos
      if (error?.message?.includes('Sesión expirada') || error?.message?.includes('401')) {
        setHasError(true);
        return;
      }
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
      inProgress: taskList.filter((t) => t.estado === 'en progreso').length,
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
      console.log('🔄 Iniciando tarea:', taskId);
      await TaskService.startTask(taskId);
      await loadTasks(false);
      // Buscar la tarea activa y actualizar el contexto global
      const updatedTasks = await TaskService.getMyTasks();
      console.log('📋 Todas las tareas después de iniciar:', updatedTasks.map(t => ({ id: t.id_tarea, estado: t.estado })));
      const active = updatedTasks.find((t) => t.estado === 'en progreso');
      console.log('✅ Tarea activa encontrada:', active);
      console.log('📤 Actualizando contexto global con tarea:', active?.id_tarea);
      setActiveTask(active || null);
      
      // Pequeño delay para asegurar que el contexto se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navegar automáticamente al mapa
      console.log('🗺️ Navegando al mapa...');
      router.replace('/map');
      
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
      const distancia = route.distancia_total ?? 0;
      const puntos = route.puntos_reposicion?.length ?? 0;
      const tiempo = route.tiempo_estimado_total ?? route.tiempo_estimado_minutos ?? 0;
      
      Alert.alert(
        'Ruta Optimizada',
        `Distancia total: ${distancia.toFixed(2)}m\nPuntos de reposición: ${puntos}\nTiempo estimado: ${tiempo} min`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error getting route:', error);
      Alert.alert('Error', error.message || 'No se pudo obtener la ruta');
    }
  };

  // Resetear todas las tareas (solo para testing)
  const handleResetAllTasks = () => {
    Alert.alert(
      '⚠️ Resetear Tareas',
      '¿Estás seguro de que quieres resetear todas las tareas a estado pendiente? Esta acción es solo para testing.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await TaskService.resetAllTasks();
              Alert.alert('Éxito', `${result.tareas_reseteadas} tareas han sido reseteadas a pendiente`);
              await loadTasks(false);
            } catch (error: any) {
              console.error('Error resetting tasks:', error);
              Alert.alert('Error', error.message || 'No se pudieron resetear las tareas');
            }
          },
        },
      ]
    );
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
      <CustomHeader title="Tareas" />
      
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

        {/* Botón de reseteo para testing */}
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: '#ef444420', borderColor: '#ef4444' }]}
          onPress={handleResetAllTasks}
        >
          <IconSymbol name="arrow.counterclockwise" size={20} color="#ef4444" />
          <Text style={[styles.resetButtonText, { color: '#ef4444' }]}>
            Resetear Todas las Tareas (Testing)
          </Text>
        </TouchableOpacity>

        {/* Filtros */}
        <TaskFiltersComponent filters={filters} onFilterChange={setFilters} />

        {/* Lista de tareas */}
        <View style={styles.tasksContainer}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {filters.status === 'todos'
                  ? 'No hay tareas asignadas'
                  : `No hay tareas ${filters.status === 'pendiente' ? 'pendientes' : filters.status === 'en progreso' ? 'en progreso' : filters.status === 'completada' ? 'completadas' : ''}`}
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
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
