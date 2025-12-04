import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatsCard, ReponedorCard } from '../../components/supervisor';
import { obtenerTareas } from '../../api/tareaService';
import type { Tarea } from '../../types';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  activeReponedores: number;
  todayCompleted: number;
}

interface ReponedorStats {
  id_usuario: number;
  nombre: string;
  tasksInProgress: number;
  tasksCompleted: number;
}

export const SupervisorDashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    activeReponedores: 0,
    todayCompleted: 0,
  });
  const [reponedores, setReponedores] = useState<ReponedorStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las tareas (supervisor puede ver todas)
      const tasks = await obtenerTareas();
      
      // Calcular estadísticas generales
      const completed = tasks.filter((t: Tarea) => t.estado === 'completada').length;
      const inProgress = tasks.filter((t: Tarea) => t.estado === 'en progreso').length;
      const pending = tasks.filter((t: Tarea) => t.estado === 'pendiente').length;
      
      // Tareas completadas hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCompleted = tasks.filter((t: Tarea) => {
        if (t.estado !== 'completada') return false;
        const taskDate = new Date(t.fecha_creacion);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      }).length;
      
      setStats({
        totalTasks: tasks.length,
        completedTasks: completed,
        inProgressTasks: inProgress,
        pendingTasks: pending,
        activeReponedores: 0, // TODO: Obtener de endpoint específico
        todayCompleted,
      });
      
      // Agrupar tareas por reponedor
      const reponedorMap = new Map<string, ReponedorStats>();
      let reponedorIdCounter = 1;
      
      tasks.forEach((task: Tarea) => {
        if (!task.reponedor) return;
        
        const existing = reponedorMap.get(task.reponedor);
        if (existing) {
          if (task.estado === 'en progreso') existing.tasksInProgress++;
          if (task.estado === 'completada') existing.tasksCompleted++;
        } else {
          reponedorMap.set(task.reponedor, {
            id_usuario: reponedorIdCounter++,
            nombre: task.reponedor,
            tasksInProgress: task.estado === 'en progreso' ? 1 : 0,
            tasksCompleted: task.estado === 'completada' ? 1 : 0,
          });
        }
      });
      
      setReponedores(Array.from(reponedorMap.values()));
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
      >
        {/* Saludo */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}, Supervisor! 👋</Text>
          <Text style={styles.subtitle}>Panel de control general</Text>
        </View>

        {/* Estadísticas principales */}
        <View style={styles.statsGrid}>
          <StatsCard
            title="Total Tareas"
            value={stats.totalTasks}
            icon="list"
            gradientColors={['#3b82f6', '#2563eb']}
          />
          <StatsCard
            title="En Progreso"
            value={stats.inProgressTasks}
            icon="time"
            gradientColors={['#f59e0b', '#d97706']}
          />
          <StatsCard
            title="Completadas"
            value={stats.completedTasks}
            icon="checkmark-circle"
            gradientColors={['#10b981', '#059669']}
          />
          <StatsCard
            title="Pendientes"
            value={stats.pendingTasks}
            icon="alert-circle"
            gradientColors={['#6366f1', '#4f46e5']}
          />
        </View>

        {/* Hoy */}
        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <Ionicons name="calendar" size={24} color="#3b82f6" />
            <Text style={styles.todayTitle}>Hoy</Text>
          </View>
          <Text style={styles.todayValue}>{stats.todayCompleted}</Text>
          <Text style={styles.todaySubtitle}>Tareas completadas hoy</Text>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="add-circle" size={28} color="#3b82f6" />
              </View>
              <Text style={styles.quickActionText}>Nueva Tarea</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="map" size={28} color="#10b981" />
              </View>
              <Text style={styles.quickActionText}>Ver Mapa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="people" size={28} color="#f59e0b" />
              </View>
              <Text style={styles.quickActionText}>Reponedores</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="analytics" size={28} color="#6366f1" />
              </View>
              <Text style={styles.quickActionText}>Reportes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reponedores activos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reponedores Activos</Text>
            <Text style={styles.sectionCount}>{reponedores.length}</Text>
          </View>

          {reponedores.length > 0 ? (
            reponedores.map((rep) => (
              <ReponedorCard
                key={rep.id_usuario}
                nombre={rep.nombre}
                tasksInProgress={rep.tasksInProgress}
                tasksCompleted={rep.tasksCompleted}
                onPress={() => Alert.alert('Ver detalles', `Detalles de ${rep.nombre}`)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No hay reponedores con tareas asignadas</Text>
            </View>
          )}
        </View>

        {/* Consejos */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <Text style={styles.tipTitle}>Consejo</Text>
          </View>
          <Text style={styles.tipText}>
            Mantén un seguimiento regular de las tareas en progreso para asegurar la eficiencia del equipo.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  todayValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  todaySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
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
});
