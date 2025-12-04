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
import { useNavigation } from '@react-navigation/native';
import { MapGrid } from '../../components/map';
import { mapaService } from '../../api/mapaService';
import type { MapaResponse, PuntoReposicion } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const ReponedorMapScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [warehouseMap, setWarehouseMap] = useState<MapaResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOnlyAssigned, setShowOnlyAssigned] = useState(false);

  const loadMap = async () => {
    try {
      setLoading(true);
      const data = await mapaService.obtenerMapa();
      setWarehouseMap(data);
      
      console.log('📍 Mapa cargado (Reponedor):', {
        ancho: data.mapa.ancho,
        alto: data.mapa.alto,
        ubicaciones: data.ubicaciones.length,
      });
      
      // Debug: Ver ubicaciones con muebles
      const ubicacionesConMuebles = data.ubicaciones.filter(u => u.mueble);
      console.log('🪑 Ubicaciones con muebles:', ubicacionesConMuebles.length);
      console.log('🪑 Primeros 3 muebles:', 
        ubicacionesConMuebles.slice(0, 3).map(u => ({
          x: u.x,
          y: u.y,
          nombre_objeto: u.objeto?.nombre,
          tipo_objeto: u.objeto?.tipo,
          puntos: u.mueble?.puntos_reposicion?.length || 0,
          filas: u.mueble?.filas,
          columnas: u.mueble?.columnas
        }))
      );
      
      // Debug: Ver tipos de objetos
      const tiposObjetos = [...new Set(data.ubicaciones.map(u => u.objeto?.tipo).filter(Boolean))];
      console.log('📋 Tipos de objetos en el mapa:', tiposObjetos);
    } catch (error: any) {
      console.error('Error loading map:', error);
      Alert.alert('Error', 'No se pudo cargar el mapa del almacén');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMap();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMap();
  };

  const handlePointPress = (punto: PuntoReposicion, x: number, y: number) => {
    const productoInfo = punto.producto 
      ? `\n\nProducto Asignado:\n${punto.producto.nombre}`
      : '\n\nSin producto asignado';
    
    Alert.alert(
      `Punto de Reposición #${punto.id_punto}`,
      `Ubicación: (${x}, ${y})\nEstantería: ${punto.estanteria}\nNivel: ${punto.nivel}${productoInfo}`,
      [{ text: 'Cerrar', style: 'cancel' }]
    );
  };

  const handleNavigateToTasks = () => {
    navigation.navigate('ReponedorTasks' as never);
  };

  const hasWarehouseData = (warehouseMap?.ubicaciones?.length || 0) > 0;
  
  // Contar puntos asignados al usuario actual
  const misPuntos = warehouseMap?.ubicaciones.reduce(
    (acc, u) => acc + (u.mueble?.puntos_reposicion?.filter(p => p.producto).length || 0),
    0
  ) || 0;

  const totalPuntos = warehouseMap?.ubicaciones.reduce(
    (acc, u) => acc + (u.mueble?.puntos_reposicion?.length || 0),
    0
  ) || 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mapa del Almacén</Text>
        </View>

        {/* Mapa */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        ) : hasWarehouseData ? (
          <>
            <View style={styles.mapContainer}>
              <MapGrid
                width={warehouseMap?.mapa.ancho || 10}
                height={warehouseMap?.mapa.alto || 10}
                ubicaciones={warehouseMap?.ubicaciones || []}
                onPointPress={handlePointPress}
              />
            </View>

            {/* Leyenda del mapa */}
            <View style={styles.legendCard}>
              <Text style={styles.legendTitle}>Leyenda del Mapa</Text>
              <View style={styles.legendGrid}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#F3F4F6' }]} />
                  <Text style={styles.legendText}>Sin configurar</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#E0E0E0' }]} />
                  <Text style={styles.legendText}>Pasillo</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#757575' }]} />
                  <Text style={styles.legendText}>Muro</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.legendText}>Mueble</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#22c55e' }]} />
                  <Text style={styles.legendText}>Salida</Text>
                </View>
                {misPuntos > 0 && (
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.legendText}>Producto asignado</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Información */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="cube-outline" size={20} color="#3b82f6" />
                <Text style={styles.infoLabel}>Puntos con productos:</Text>
                <Text style={styles.infoValue}>{misPuntos} / {totalPuntos}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="map-outline" size={20} color="#3b82f6" />
                <Text style={styles.infoLabel}>Dimensiones del mapa:</Text>
                <Text style={styles.infoValue}>{warehouseMap?.mapa.ancho} x {warehouseMap?.mapa.alto}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No hay datos del mapa</Text>
            <Text style={styles.emptySubtitle}>
              No se encontraron ubicaciones configuradas en el almacén.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  infoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  filterSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonInactive: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  filterButtonTextInactive: {
    color: '#3b82f6',
  },
  actionsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#3b82f6',
  },
  mapContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  legendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '45%',
  },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#9CA3AF',
  },
  legendText: {
    fontSize: 13,
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});