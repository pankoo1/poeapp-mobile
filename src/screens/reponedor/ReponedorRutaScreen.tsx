import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { tareaService, mapaService } from '../../api';
import { Tarea, RutaOptimizada, MapaResponse } from '../../types';
import { MapGridInteractive } from '../../components/map';

export const ReponedorRutaScreen: React.FC = () => {
  const [activeTask, setActiveTask] = useState<Tarea | null>(null);
  const [route, setRoute] = useState<RutaOptimizada | null>(null);
  const [warehouseMap, setWarehouseMap] = useState<MapaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar tareas
      const tasks = await tareaService.getTareas();
      const active = tasks.find(
        (t) =>
          t.estado.toLowerCase() === 'en progreso' ||
          t.estado.toLowerCase() === 'en_progreso'
      );

      setActiveTask(active || null);

      if (active) {
        // Cargar ruta optimizada si hay tarea activa
        try {
          const routeData = await mapaService.obtenerRutaOptimizada(active.id_tarea);
          setRoute(routeData);
        } catch (error) {
          console.error('Error loading route:', error);
        }
      }

      // Siempre cargar el mapa completo del almacén
      try {
        const mapData = await mapaService.obtenerMapa();
        console.log('📍 Mapa cargado:', JSON.stringify(mapData, null, 2));
        console.log('📍 Ubicaciones en mapa:', mapData?.ubicaciones?.length || 0);
        setWarehouseMap(mapData);
      } catch (error) {
        console.error('Error loading warehouse map:', error);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando ruta...</Text>
      </View>
    );
  }

  // Determinar ubicaciones a mostrar
  const locationsToShow = activeTask
    ? route?.puntos_visita || activeTask.productos.map((p) => ({
        id_punto: p.ubicacion.id_punto,
        estanteria: p.ubicacion.estanteria,
        nivel: p.ubicacion.nivel,
      }))
    : warehouseMap?.ubicaciones.flatMap((u) =>
        u.punto ? [u.punto] : u.mueble?.puntos_reposicion || []
      ) || [];

  const isTaskActive = !!activeTask;
  const hasWarehouseData = (warehouseMap?.ubicaciones?.length || 0) > 0;

  console.log('🗺️ Estado actual:', {
    isTaskActive,
    activeTaskId: activeTask?.id_tarea,
    hasRoute: !!route,
    hasWarehouseMap: !!warehouseMap,
    hasWarehouseData,
    totalUbicaciones: warehouseMap?.ubicaciones?.length || 0,
    locationsCount: locationsToShow.length,
  });

  const totalDistance = route?.distancia_total || 0;
  const totalTime = route?.tiempo_estimado_min ? route.tiempo_estimado_min * 60 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
      >
        {/* Header */}
        <View style={styles.taskHeader}>
          {isTaskActive ? (
            <>
              <View style={styles.taskHeaderLeft}>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeBadgeText}>Tarea Activa</Text>
                </View>
                <Text style={styles.taskId}>Tarea #{activeTask.id_tarea}</Text>
              </View>
              <View style={styles.productCount}>
                <Ionicons name="cube" size={16} color="#007AFF" />
                <Text style={styles.productCountText}>
                  {activeTask.productos.length} productos
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.taskHeaderLeft}>
                <Ionicons name="map" size={24} color="#007AFF" />
                <Text style={styles.taskId}>Mapa del Almacén</Text>
              </View>
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Explorar</Text>
              </View>
            </>
          )}
        </View>

        {/* Métricas */}
        {isTaskActive ? (
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Ionicons name="speedometer" size={32} color="#3b82f6" />
              <Text style={styles.metricValue}>
                {totalDistance > 0 ? `${totalDistance.toFixed(0)}m` : 'N/A'}
              </Text>
              <Text style={styles.metricLabel}>Distancia</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="time" size={32} color="#10b981" />
              <Text style={styles.metricValue}>
                {totalTime > 0 ? `${Math.ceil(totalTime / 60)}min` : 'N/A'}
              </Text>
              <Text style={styles.metricLabel}>Tiempo est.</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="location" size={32} color="#f59e0b" />
              <Text style={styles.metricValue}>
                {route?.puntos_visita?.length || activeTask?.productos.length || 0}
              </Text>
              <Text style={styles.metricLabel}>Paradas</Text>
            </View>
          </View>
        ) : (
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Ionicons name="grid" size={32} color="#8b5cf6" />
              <Text style={styles.metricValue}>
                {warehouseMap?.mapa.ancho || 0}×{warehouseMap?.mapa.alto || 0}
              </Text>
              <Text style={styles.metricLabel}>Dimensiones</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="albums" size={32} color="#3b82f6" />
              <Text style={styles.metricValue}>{locationsToShow.length}</Text>
              <Text style={styles.metricLabel}>Ubicaciones</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="information-circle" size={32} color="#10b981" />
              <Text style={styles.metricValue}>-</Text>
              <Text style={styles.metricLabel}>Disponible</Text>
            </View>
          </View>
        )}

        {/* Mapa visual */}
        {isTaskActive && hasWarehouseData ? (
          <View style={styles.mapContainer}>
            <MapGridInteractive
              ubicaciones={warehouseMap?.ubicaciones || []}
              ruta={route?.coordenadas_ruta?.map(c => ({ x: c.x, y: c.y })) || []}
              showRoute={true}
            />
          </View>
        ) : (!isTaskActive && hasWarehouseData ? (
          <View style={styles.mapContainer}>
            <MapGridInteractive
              ubicaciones={warehouseMap?.ubicaciones || []}
              showRoute={false}
            />
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name={isTaskActive ? 'navigate' : 'map'} size={48} color="#9ca3af" />
            <Text style={styles.mapPlaceholderText}>
              {isTaskActive ? 'Ruta Optimizada' : 'Mapa del Almacén'}
            </Text>
            <Text style={styles.mapPlaceholderSubtext}>
              {isTaskActive
                ? 'Visualización de ruta próximamente'
                : 'Vista general del almacén próximamente'}
            </Text>
            {!isTaskActive && (
              <Text style={styles.mapPlaceholderHint}>
                Inicia una tarea para ver tu ruta optimizada
              </Text>
            )}
          </View>
        ))}

        {/* Consejos */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.tipTitle}>
              {isTaskActive ? 'Consejos de Recolección' : 'Información'}
            </Text>
          </View>
          <Text style={styles.tipText}>
            {isTaskActive
              ? '• Sigue el orden sugerido para optimizar tu tiempo\n• Verifica la ubicación antes de moverte\n• Marca los productos recolectados en tu lista'
              : '• El mapa muestra todas las ubicaciones del almacén\n• Inicia una tarea para ver tu ruta optimizada\n• Usa la pestaña Tareas para gestionar tus asignaciones'}
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
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  taskHeader: {
    backgroundColor: '#ffffff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  taskHeaderLeft: {
    gap: 8,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  taskId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  productCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  productCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  metricsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
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
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  mapContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    height: 500,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapPlaceholder: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
  mapPlaceholderHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 12,
    fontStyle: 'italic',
  },
  inactiveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
  },
  inactiveBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyListText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyListHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  moreLocations: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b7280',
    marginTop: 12,
    fontStyle: 'italic',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  routeItemNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeItemNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  routeItemContent: {
    flex: 1,
  },
  routeItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  routeItemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  routeItemLocationText: {
    fontSize: 12,
    color: '#666',
  },
  routeItemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  tipCard: {
    backgroundColor: '#eff6ff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
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
    color: '#1e40af',
  },
  tipText: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 20,
  },
});
