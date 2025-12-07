import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskCreationSheet } from '../../components/supervisor/TaskCreationSheet';
import type { PuntoReposicion } from '../../types';

interface SelectedPoint {
  punto: PuntoReposicion;
  cantidad: number;
}

type SupervisorStackParamList = {
  SupervisorTabs: undefined;
  CreateTask: {
    selectedPoints: SelectedPoint[];
  };
};

type CreateTaskRouteProp = RouteProp<SupervisorStackParamList, 'CreateTask'>;
type CreateTaskNavigationProp = NativeStackNavigationProp<SupervisorStackParamList, 'CreateTask'>;

export const SupervisorCreateTaskScreen: React.FC = () => {
  const navigation = useNavigation<CreateTaskNavigationProp>();
  const route = useRoute<CreateTaskRouteProp>();
  
  const [selectedPoints, setSelectedPoints] = useState<SelectedPoint[]>(
    route.params?.selectedPoints || []
  );
  const [sheetVisible, setSheetVisible] = useState(true);

  useEffect(() => {
    // Si no hay puntos seleccionados, regresar automáticamente
    if (selectedPoints.length === 0 && !route.params?.selectedPoints) {
      Alert.alert(
        'Sin Selección',
        'No se han seleccionado muebles. Regresando al mapa.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, []);

  const handleTaskCreated = () => {
    console.log('✅ Tarea creada exitosamente');
    Alert.alert(
      '¡Éxito!',
      'La tarea se ha creado correctamente.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSheetVisible(false);
            // Navegar de vuelta al mapa y limpiar la selección
            navigation.navigate('SupervisorTabs');
          },
        },
      ]
    );
  };

  const handleClose = () => {
    Alert.alert(
      'Cancelar Creación',
      '¿Estás seguro de que deseas cancelar la creación de la tarea?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            setSheetVisible(false);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleUpdateQuantity = (puntoId: number, cantidad: number) => {
    setSelectedPoints((prev) =>
      prev.map((sp) =>
        sp.punto.id_punto === puntoId ? { ...sp, cantidad } : sp
      )
    );
  };

  const handleRemovePoint = (puntoId: number) => {
    setSelectedPoints((prev) => {
      const updated = prev.filter((sp) => sp.punto.id_punto !== puntoId);
      
      // Si no quedan puntos, cerrar y regresar
      if (updated.length === 0) {
        Alert.alert(
          'Sin Productos',
          'Has eliminado todos los productos. Regresando al mapa.',
          [
            {
              text: 'OK',
              onPress: () => {
                setSheetVisible(false);
                navigation.goBack();
              },
            },
          ]
        );
      }
      
      return updated;
    });
  };

  if (selectedPoints.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Crear Tarea de Reposición</Text>
          <Text style={styles.headerSubtitle}>
            {selectedPoints.length} producto{selectedPoints.length > 1 ? 's' : ''} seleccionado{selectedPoints.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            Revisa los productos y cantidades, asigna un reponedor y crea la tarea.
          </Text>
        </View>
      </View>

      {/* Task Creation Sheet (Full Screen Mode) */}
      <TaskCreationSheet
        visible={sheetVisible}
        onClose={handleClose}
        selectedPoints={selectedPoints}
        onTaskCreated={handleTaskCreated}
        onUpdateQuantity={handleUpdateQuantity}
        onRemovePoint={handleRemovePoint}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
  },
});
