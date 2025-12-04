import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { QuickStats, ActiveTaskCard } from '../../components/dashboard';
import type { QuickStatsData } from '../../components/dashboard';
import { tareaService } from '../../api';
import { Tarea } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const ReponedorDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [activeTask, setActiveTask] = useState<Tarea | null>(null);
  const [stats, setStats] = useState<QuickStatsData>({
    tasksToday: 0,
    completedToday: 0,
    inProgress: 0,
    pending: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar tareas
  const loadTasks = async () => {
    try {
      const data = await tareaService.getTareas();
      setTasks(data);
      calculateStats(data);
      findActiveTask(data);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calcular estadísticas
  const calculateStats = (taskList: Tarea[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasksToday = taskList.filter((t) => {
      const taskDate = new Date(t.fecha_creacion);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });

    const completedToday = tasksToday.filter(
      (t) => t.estado.toLowerCase() === 'completada'
    ).length;

    const inProgress = taskList.filter(
      (t) => t.estado.toLowerCase() === 'en progreso' || t.estado.toLowerCase() === 'en_progreso'
    ).length;

    const pending = taskList.filter((t) => t.estado.toLowerCase() === 'pendiente').length;

    setStats({
      tasksToday: tasksToday.length,
      completedToday,
      inProgress,
      pending,
    });
  };

  // Encontrar tarea activa
  const findActiveTask = (taskList: Tarea[]) => {
    const active = taskList.find(
      (t) => t.estado.toLowerCase() === 'en progreso' || t.estado.toLowerCase() === 'en_progreso'
    );
    setActiveTask(active || null);
  };

  // Completar tarea activa
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

  // Ver detalles (navegar a la tab de Tareas)
  const handleViewDetails = (taskId: number) => {
    // @ts-ignore
    navigation.navigate('Tareas');
  };

  // Refrescar
  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
      >
        {/* Header con saludo */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.nombre || 'Reponedor'}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Tarea activa */}
        <ActiveTaskCard
          task={activeTask}
          onComplete={handleCompleteTask}
          onViewDetails={handleViewDetails}
        />

        {/* Estadísticas rápidas */}
        <QuickStats stats={stats} />

        {/* Accesos rápidos */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Tareas');
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' }]}>
                <Ionicons name="list" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Mis Tareas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Ruta');
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}>
                <Ionicons name="navigate" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Ver Ruta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Mapa');
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="map" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Mapa Almacén</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                Alert.alert('Historial', 'Funcionalidad próximamente');
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
                <Ionicons name="time-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Historial</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                Alert.alert('Ayuda', 'Funcionalidad próximamente');
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Ayuda</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Consejos del día */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <Text style={styles.tipTitle}>Consejo del día</Text>
          </View>
          <Text style={styles.tipText}>
            Revisa la ubicación de los productos antes de iniciar la tarea para optimizar tu ruta.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  quickActions: {
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  tipCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
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
    color: '#92400e',
  },
  tipText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 20,
  },
});
