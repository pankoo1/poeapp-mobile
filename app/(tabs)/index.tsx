import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { TaskService } from '@/services/task.service';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomHeader } from '@/components/drawer/CustomHeader';
import type { Task, TaskMetrics } from '@/types/task.types';

export default function HomeScreen() {
  const { loading: authLoading } = useProtectedRoute();
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<TaskMetrics>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
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
      
      // Calcular métricas
      const metricsData: TaskMetrics = {
        total: response.length,
        completed: response.filter((t) => t.estado === 'completada').length,
        inProgress: response.filter((t) => t.estado === 'en progreso').length,
        pending: response.filter((t) => t.estado === 'pendiente').length,
      };
      setMetrics(metricsData);
      setHasError(false);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      // Si es error de sesión, marcar flag para detener intentos
      if (error?.message?.includes('Sesión expirada') || error?.message?.includes('401')) {
        setHasError(true);
        // No hacer nada más, el HttpClient ya manejó la redirección
        return;
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !hasError) {
      loadTasks();
    }
  }, [authLoading, hasError]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadTasks(false);
  };

  if (authLoading || isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Cargando...</Text>
      </View>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Inicio" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
      >
        {/* Saludo */}
        <View style={styles.greetingContainer}>
          <Text style={[styles.greeting, { color: theme.textPrimary }]}>
            {getGreeting()}, {user?.nombre}! 👋
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Aquí está el resumen de tus tareas
          </Text>
        </View>

        {/* Métricas */}
        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#3b82f6' }]}>
              <IconSymbol name="checklist" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{metrics.total}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#f59e0b' }]}>
              <IconSymbol name="arrow.clockwise" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{metrics.inProgress}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>En Progreso</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#10b981' }]}>
              <IconSymbol name="checkmark.circle.fill" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{metrics.completed}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Completadas</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#6366f1' }]}>
              <IconSymbol name="clock.fill" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{metrics.pending}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Pendientes</Text>
          </View>
        </View>

        {/* Accesos rápidos */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Accesos Rápidos</Text>
          
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => router.push('/(tabs)/tasks')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#3b82f620' }]}>
              <IconSymbol name="checklist" size={28} color="#3b82f6" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={[styles.quickActionTitle, { color: theme.textPrimary }]}>Mis Tareas</Text>
              <Text style={[styles.quickActionDescription, { color: theme.textSecondary }]}>
                Ver y gestionar tus tareas asignadas
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => router.push('/(tabs)/map')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#10b98120' }]}>
              <IconSymbol name="map.fill" size={28} color="#10b981" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={[styles.quickActionTitle, { color: theme.textPrimary }]}>Mapa Interactivo</Text>
              <Text style={[styles.quickActionDescription, { color: theme.textSecondary }]}>
                Visualiza los puntos de reposición y rutas
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Información del usuario */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Mi Perfil</Text>
          
          <View style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.profileRow}>
              <IconSymbol name="person.fill" size={20} color={theme.primary} />
              <Text style={[styles.profileLabel, { color: theme.textSecondary }]}>Nombre:</Text>
              <Text style={[styles.profileValue, { color: theme.textPrimary }]}>{user?.nombre}</Text>
            </View>
            
            <View style={styles.profileRow}>
              <IconSymbol name="envelope.fill" size={20} color={theme.primary} />
              <Text style={[styles.profileLabel, { color: theme.textSecondary }]}>Correo:</Text>
              <Text style={[styles.profileValue, { color: theme.textPrimary }]}>{user?.correo}</Text>
            </View>
            
            <View style={styles.profileRow}>
              <IconSymbol name="person.badge.shield.checkmark.fill" size={20} color={theme.primary} />
              <Text style={[styles.profileLabel, { color: theme.textSecondary }]}>Rol:</Text>
              <Text style={[styles.profileValue, { color: theme.textPrimary }]}>{user?.rol}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  greetingContainer: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 13,
  },
  profileCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  profileLabel: {
    fontSize: 14,
    minWidth: 60,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
