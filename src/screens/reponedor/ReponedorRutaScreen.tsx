import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tareaService } from '../../api';
import { Tarea } from '../../types';
import RutaVisualizacionScreen from './RutaVisualizacionScreen';

export const ReponedorRutaScreen: React.FC = () => {
  const [activeTask, setActiveTask] = useState<Tarea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Buscar la tarea activa
      const tasks = await tareaService.getTareas();
      const active = tasks.find(
        (t) =>
          t.estado.toLowerCase() === 'en progreso' ||
          t.estado.toLowerCase() === 'en_progreso'
      );

      setActiveTask(active || null);
    } catch (error) {
      console.error('Error al cargar tarea activa:', error);
      Alert.alert('Error', 'No se pudo cargar la tarea activa');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Cargando tarea activa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeTask) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No hay tarea activa</Text>
          <Text style={styles.emptyText}>
            Inicia una tarea desde la sección de Tareas para ver su ruta optimizada aquí.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Si hay tarea activa, mostrar la pantalla de visualización de ruta
  return <RutaVisualizacionScreen idTarea={activeTask.id_tarea} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
