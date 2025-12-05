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
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando mapa...</Text>
        </View>
      ) : hasWarehouseData ? (
        <>
          {/* Mapa en pantalla completa */}
          <View style={styles.mapFullScreen}>
            <MapGrid
              width={warehouseMap?.mapa.ancho || 10}
              height={warehouseMap?.mapa.alto || 10}
              ubicaciones={warehouseMap?.ubicaciones || []}
              onPointPress={handlePointPress}
            />
          </View>

          {/* Botón flotante para refrescar */}
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapFullScreen: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
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
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});