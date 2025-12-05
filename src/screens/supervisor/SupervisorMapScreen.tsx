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
import { MapGrid } from '../../components/map';
import { obtenerMapaSupervisor } from '../../api/mapaService';
import { TaskCreationSheet } from '../../components/supervisor/TaskCreationSheet';
import type { MapaResponse, PuntoReposicion, UbicacionFisica } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SelectedPoint {
  punto: PuntoReposicion;
  cantidad: number;
}

interface SelectedMueble {
  ubicacion: UbicacionFisica;
  puntosDisponibles: PuntoReposicion[];
}

export const SupervisorMapScreen: React.FC = () => {
  const { user } = useAuth();
  const [warehouseMap, setWarehouseMap] = useState<MapaResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPoints, setSelectedPoints] = useState<SelectedPoint[]>([]);
  const [selectedMuebles, setSelectedMuebles] = useState<SelectedMueble[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const loadMap = async () => {
    try {
      setLoading(true);
      // Supervisor usa el endpoint del mapa para supervisores
      const data = await obtenerMapaSupervisor();
      setWarehouseMap(data);
      
      console.log('📍 Mapa cargado (Supervisor):', {
        ancho: data.mapa.ancho,
        alto: data.mapa.alto,
        ubicaciones: data.ubicaciones.length,
      });
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

  const handlePointPress = (punto: any, x: number, y: number) => {
    console.log('🎯 Punto presionado:', {
      id: punto.id_punto,
      pos: `(${x},${y})`,
      tieneProducto: !!punto.producto,
      modoSeleccion: selectionMode
    });

    // Buscar el mueble en esta ubicación
    const ubicacion = warehouseMap?.ubicaciones.find(u => u.x === x && u.y === y);
    
    if (!ubicacion || !ubicacion.mueble) {
      console.log('⚠️ No hay mueble en esta ubicación');
      return;
    }

    // Obtener todos los puntos con producto del mueble
    const puntosConProducto = ubicacion.mueble.puntos_reposicion?.filter(p => p.producto) || [];
    
    if (puntosConProducto.length === 0) {
      console.log('⚠️ El mueble no tiene productos asignados');
      Alert.alert('Aviso', 'Este mueble no tiene productos asignados');
      return;
    }

    // Si está en modo selección, toggle el mueble completo
    if (selectionMode) {
      console.log('✅ Modo selección activo, toggleando mueble');
      toggleMuebleSelection(ubicacion, puntosConProducto);
      return;
    }

    // Si no está en modo selección, mostrar información del mueble
    // Agrupar productos únicos
    const productosUnicos = new Map<string, number>();
    puntosConProducto.forEach(p => {
      if (p.producto?.nombre) {
        productosUnicos.set(
          p.producto.nombre, 
          (productosUnicos.get(p.producto.nombre) || 0) + 1
        );
      }
    });
    
    const productosInfo = Array.from(productosUnicos.entries())
      .map(([nombre, cantidad]) => `• ${nombre} (${cantidad} ubicaciones)`)
      .join('\n');
    
    Alert.alert(
      `Mueble en (${x}, ${y})`,
      `Productos disponibles:\n\n${productosInfo}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Seleccionar para Tarea',
          onPress: () => {
            setSelectionMode(true);
            toggleMuebleSelection(ubicacion, puntosConProducto);
          },
        },
      ]
    );
  };

  const toggleMuebleSelection = (ubicacion: UbicacionFisica, puntosConProducto: PuntoReposicion[]) => {
    const muebleKey = `${ubicacion.x},${ubicacion.y}`;
    console.log('🔄 Toggle selección de mueble:', {
      ubicacion: muebleKey,
      productosDisponibles: puntosConProducto.length
    });

    const isSelected = selectedMuebles.some(m => `${m.ubicacion.x},${m.ubicacion.y}` === muebleKey);
    
    if (isSelected) {
      // Remover el mueble y todos sus puntos
      setSelectedMuebles(prev => prev.filter(m => `${m.ubicacion.x},${m.ubicacion.y}` !== muebleKey));
      setSelectedPoints(prev => prev.filter(sp => 
        !puntosConProducto.some(p => p.id_punto === sp.punto.id_punto)
      ));
      console.log('➖ Mueble removido de selección');
    } else {
      // Agregar el mueble con todos sus puntos (cantidad inicial = 0, se configurará en el sheet)
      setSelectedMuebles(prev => [...prev, { ubicacion, puntosDisponibles: puntosConProducto }]);
      const nuevosPuntos = puntosConProducto.map(punto => ({ 
        punto, 
        cantidad: 0,
        ubicacion: { x: ubicacion.x, y: ubicacion.y }
      }));
      setSelectedPoints(prev => [...prev, ...nuevosPuntos]);
      console.log('➕ Mueble agregado a selección');
    }
  };

  const togglePointSelection = (punto: PuntoReposicion) => {
    // Esta función ya no se usa con el nuevo flujo
    console.log('⚠️ togglePointSelection llamado (deprecated)');
  };

  const handleUpdateQuantity = (pointId: number, quantity: number) => {
    setSelectedPoints(prev =>
      prev.map(sp =>
        sp.punto.id_punto === pointId ? { ...sp, cantidad: quantity } : sp
      )
    );
  };

  const handleRemovePoint = (pointId: number) => {
    setSelectedPoints(prev => prev.filter(sp => sp.punto.id_punto !== pointId));
  };

  const handleTaskCreated = () => {
    setSelectedPoints([]);
    setSelectedMuebles([]);
    setSelectionMode(false);
    loadMap(); // Recargar mapa
  };

  const toggleSelectionMode = () => {
    console.log('🔀 Toggle modo selección:', {
      estadoActual: selectionMode,
      mueblesSeleccionados: selectedMuebles.length,
      puntosSeleccionados: selectedPoints.length
    });

    if (selectionMode) {
      // Saliendo del modo selección
      if (selectedMuebles.length > 0 || selectedPoints.length > 0) {
        Alert.alert(
          'Confirmar',
          '¿Deseas cancelar la selección de muebles?',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Sí, cancelar',
              style: 'destructive',
              onPress: () => {
                setSelectedPoints([]);
                setSelectedMuebles([]);
                setSelectionMode(false);
                console.log('❌ Modo selección desactivado, muebles limpiados');
              },
            },
          ]
        );
      } else {
        setSelectionMode(false);
        console.log('❌ Modo selección desactivado');
      }
    } else {
      // Entrando al modo selección
      setSelectionMode(true);
      console.log('✅ Modo selección activado');
    }
  };

  const openTaskCreationSheet = () => {
    if (selectedPoints.length === 0) {
      Alert.alert('Aviso', 'Debes seleccionar al menos un mueble con productos');
      return;
    }
    setSheetVisible(true);
  };

  const hasWarehouseData = (warehouseMap?.ubicaciones?.length || 0) > 0;
  
  // Contar puntos con productos asignados
  const puntosConProducto = warehouseMap?.ubicaciones.reduce(
    (acc, u) => acc + (u.mueble?.puntos_reposicion?.filter(p => p.producto).length || 0),
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
          <View>
            <Text style={styles.title}>Mapa del Almacén</Text>
            {selectionMode && (
              <Text style={styles.selectionHint}>
                {selectedMuebles.length} mueble(s) seleccionado(s) • {selectedPoints.length} producto(s)
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.selectionButton,
              selectionMode && styles.selectionButtonActive,
            ]}
            onPress={toggleSelectionMode}
          >
            <Ionicons
              name={selectionMode ? 'close-circle' : 'add-circle'}
              size={24}
              color={selectionMode ? '#EF4444' : '#3B82F6'}
            />
          </TouchableOpacity>
        </View>

        {/* Mapa visual */}
        {hasWarehouseData ? (
          <View style={styles.mapContainer}>
            <MapGrid
              width={warehouseMap?.mapa.ancho || 10}
              height={warehouseMap?.mapa.alto || 10}
              ubicaciones={warehouseMap?.ubicaciones || []}
              onPointPress={handlePointPress}
              selectedPoints={selectedPoints.map(sp => sp.punto.id_punto)}
              selectedMuebles={selectedMuebles.map(m => `${m.ubicacion.x},${m.ubicacion.y}`)}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>Mapa no configurado</Text>
            <Text style={styles.emptyStateText}>
              El almacén no tiene ubicaciones configuradas todavía.
            </Text>
          </View>
        )}

        {/* Botón flotante para crear tarea */}
        {selectionMode && selectedMuebles.length > 0 && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={openTaskCreationSheet}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.floatingButtonText}>
              Crear Tarea ({selectedMuebles.length} mueble{selectedMuebles.length > 1 ? 's' : ''})
            </Text>
          </TouchableOpacity>
        )}

        {/* Consejo */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.tipTitle}>
              {selectionMode ? 'Modo Selección Activo' : 'Información'}
            </Text>
          </View>
          <Text style={styles.tipText}>
            {selectionMode
              ? 'Toca los muebles (morados) para agregarlos. Luego podrás seleccionar qué productos reponer y sus cantidades.'
              : 'Toca el botón + para activar el modo selección y crear tareas de reposición.'}
          </Text>
        </View>
      </ScrollView>

      {/* Modal para crear tarea */}
      <TaskCreationSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectionHint: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 4,
  },
  selectionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  selectionButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  mapContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 100,
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
    color: '#1E40AF',
  },
  tipText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
});
