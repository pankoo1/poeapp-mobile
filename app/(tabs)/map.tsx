import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { MapaService } from '@/services/mapa.service';
import { CustomHeader } from '@/components/drawer/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TaskService } from '@/services/task.service';
import type { Mapa, UbicacionFisica, PuntoReposicion } from '@/types/mapa.types';
import type { OptimizedRoute, Task } from '@/types/task.types';
import { useTaskActive } from '@/contexts/TaskActiveContext';

const CELL_SIZE = 30; // Tamaño de cada celda en píxeles

export default function MapScreen() {
  const { theme } = useTheme();
  const { activeTask } = useTaskActive();
  const [mapa, setMapa] = useState<Mapa | null>(null);
  const [ubicaciones, setUbicaciones] = useState<UbicacionFisica[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<PuntoReposicion | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [noPointsAssigned, setNoPointsAssigned] = useState(false);
  const [route, setRoute] = useState<OptimizedRoute | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        console.log('🔍 Cargando mapa y verificando tarea activa...');
        console.log('📋 Tarea activa desde contexto:', activeTask);
        
        // Buscar tarea activa directamente si el contexto está vacío
        let currentActiveTask = activeTask;
        if (!currentActiveTask) {
          console.log('🔎 Contexto vacío, buscando tarea activa directamente...');
          const allTasks = await TaskService.getMyTasks();
          console.log('📋 Todas las tareas:', allTasks.map(t => ({ id: t.id_tarea, estado: t.estado })));
          currentActiveTask = allTasks.find((t) => t.estado === 'en progreso') || null;
          console.log('✅ Tarea activa encontrada directamente:', currentActiveTask);
        }
        
        // Obtener mapa
        const data = await MapaService.getMapaReponedorVista();
        if (data.mensaje && !data.mapa) {
          setNoPointsAssigned(true);
          setLoading(false);
          return;
        }
        if (!data.mapa) {
          setNoPointsAssigned(true);
          setLoading(false);
          return;
        }
        setMapa(data.mapa);
        // Filtrar ubicaciones igual que antes
        const ubicacionesFiltradas = (data.ubicaciones || [])
          .map((ub: UbicacionFisica) => {
            if (ub.mueble && ub.mueble.puntos_reposicion) {
              const puntosConProducto = ub.mueble.puntos_reposicion.filter(
                (p: PuntoReposicion) => p.producto !== null && p.producto !== undefined
              );
              if (puntosConProducto.length > 0) {
                return {
                  ...ub,
                  mueble: {
                    ...ub.mueble,
                    puntos_reposicion: puntosConProducto
                  }
                };
              }
            }
            return ub;
          });
        setUbicaciones(ubicacionesFiltradas);
        const totalPuntos = ubicacionesFiltradas.reduce((acc: number, ub: UbicacionFisica) => acc + (ub.mueble?.puntos_reposicion?.length || 0), 0);
        if (totalPuntos === 0) setNoPointsAssigned(true);

        // Si hay tarea activa, obtener ruta optimizada
        if (currentActiveTask) {
          console.log('🚀 Obteniendo ruta optimizada para tarea:', currentActiveTask.id_tarea);
          try {
            const routeData = await TaskService.getOptimizedRoute(currentActiveTask.id_tarea);
            console.log('✅ Ruta optimizada obtenida:', JSON.stringify(routeData, null, 2));
            console.log('📊 Coordenadas de la ruta:', routeData.coordenadas_ruta);
            setRoute(routeData);
            setRouteError(null);
          } catch (err: any) {
            console.log('❌ Error obteniendo ruta optimizada:', err);
            setRoute(null);
            setRouteError(err.message || 'No se pudo obtener la ruta optimizada');
          }
        } else {
          console.log('⚠️ No hay tarea activa, limpiando ruta');
          setRoute(null);
        }
      } catch (err: any) {
        Alert.alert('Error', `No se pudo cargar el mapa o tareas: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTask]);

  const handlePointPress = (punto: PuntoReposicion) => {
    setSelectedPoint(punto);
    setModalVisible(true);
  };

  const renderMapa = () => {
    if (!mapa) {
      console.log('renderMapa: No hay mapa');
      return null;
    }

    console.log('Renderizando mapa:', mapa.ancho, 'x', mapa.alto);
    console.log('Total ubicaciones:', ubicaciones.length);

    const mapWidth = mapa.ancho * CELL_SIZE;
    const mapHeight = mapa.alto * CELL_SIZE;

    // Recolectar todos los puntos de reposición con sus ubicaciones
    const puntosConUbicacion: Array<{ punto: PuntoReposicion; x: number; y: number }> = [];
    ubicaciones.forEach((ub) => {
      if (ub.mueble && ub.mueble.puntos_reposicion) {
        ub.mueble.puntos_reposicion.forEach((punto) => {
          if (punto.producto) {
            puntosConUbicacion.push({ punto, x: ub.x, y: ub.y });
          }
        });
      }
    });

    // Dibujar ruta optimizada si existe
    const renderRouteLines = () => {
      // Usar coordenadas_ruta_global si existe, sino coordenadas_ruta
      const coordenadas = route?.coordenadas_ruta_global || route?.coordenadas_ruta;
      
      if (!route || !coordenadas || coordenadas.length < 2) {
        console.log('⚠️ No se dibuja ruta:', { 
          hasRoute: !!route, 
          hasCoordenadas: !!coordenadas,
          coordenadasLength: coordenadas?.length,
          tieneGlobal: !!route?.coordenadas_ruta_global,
          tieneNormal: !!route?.coordenadas_ruta
        });
        return null;
      }
      
      console.log('🎨 Dibujando ruta con', coordenadas.length, 'puntos');
      
      // Convertir coordenadas lógicas a píxeles
      const points = coordenadas.map(coord => {
        const x = coord.x * CELL_SIZE + CELL_SIZE / 2;
        const y = coord.y * CELL_SIZE + CELL_SIZE / 2;
        return `${x},${y}`;
      }).join(' ');

      console.log('📍 Puntos SVG:', points);

      // Marcar punto inicial y final
      const puntoInicial = coordenadas[0];
      const puntoFinal = coordenadas[coordenadas.length - 1];
      const xInicial = puntoInicial.x * CELL_SIZE + CELL_SIZE / 2;
      const yInicial = puntoInicial.y * CELL_SIZE + CELL_SIZE / 2;
      const xFinal = puntoFinal.x * CELL_SIZE + CELL_SIZE / 2;
      const yFinal = puntoFinal.y * CELL_SIZE + CELL_SIZE / 2;

      return (
        <View style={{ position: 'absolute', top: 0, left: 0, width: mapWidth, height: mapHeight, zIndex: 10 }}>
          <Svg width={mapWidth} height={mapHeight} style={{ position: 'absolute' }}>
            {/* Línea de la ruta */}
            <Polyline
              points={points}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={4}
              strokeOpacity={0.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Marcador del punto inicial (verde) */}
            <Circle
              cx={xInicial}
              cy={yInicial}
              r={8}
              fill="#10b981"
              opacity={0.9}
            />
            <Circle
              cx={xInicial}
              cy={yInicial}
              r={4}
              fill="#FFFFFF"
              opacity={1}
            />
            
            {/* Marcador del punto final (rojo) */}
            <Circle
              cx={xFinal}
              cy={yFinal}
              r={8}
              fill="#ef4444"
              opacity={0.9}
            />
            <Circle
              cx={xFinal}
              cy={yFinal}
              r={4}
              fill="#FFFFFF"
              opacity={1}
            />
          </Svg>
        </View>
      );
    };

    return (
      <View style={styles.mapContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ padding: 10 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ padding: 10 }}
          >
            <View style={{ position: 'relative' }}>
              {/* Dibujar cuadrícula fila por fila */}
              {Array.from({ length: mapa.alto }).map((_, y) => (
                <View key={`row-${y}`} style={{ flexDirection: 'row' }}>
                  {Array.from({ length: mapa.ancho }).map((_, x) => {
                    const ubicacion = ubicaciones.find((ub: UbicacionFisica) => ub.x === x && ub.y === y);
                    let backgroundColor = theme.backgroundSecondary;
                    if (ubicacion?.objeto) {
                      if (ubicacion.objeto.caminable) backgroundColor = '#e0e0e0';
                      else backgroundColor = '#757575';
                    }
                    if (ubicacion?.mueble) backgroundColor = '#8b5cf6';
                    return (
                      <View
                        key={`cell-${x}-${y}`}
                        style={[
                          styles.cell,
                          {
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            backgroundColor,
                            borderColor: theme.border,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}

              {/* Capa para la ruta optimizada (líneas) */}
              {renderRouteLines()}

              {/* Capa superpuesta para puntos de reposición */}
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: mapWidth,
                  height: mapHeight,
                }}
              >
                {puntosConUbicacion.map((item, index) => {
                  const left = item.x * CELL_SIZE + CELL_SIZE / 2 - CELL_SIZE / 3;
                  const top = item.y * CELL_SIZE + CELL_SIZE / 2 - CELL_SIZE / 3;
                  return (
                    <TouchableOpacity
                      key={`point-${item.punto.id_punto}-${index}`}
                      style={[
                        styles.point,
                        {
                          left,
                          top,
                          width: (CELL_SIZE * 2) / 3,
                          height: (CELL_SIZE * 2) / 3,
                          borderRadius: CELL_SIZE / 3,
                          backgroundColor: theme.primary,
                        },
                      ]}
                      onPress={() => handlePointPress(item.punto)}
                    >
                      <Text style={styles.pointText}>{item.punto.id_punto}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </ScrollView>

        {/* Métricas de la ruta optimizada */}
        {route && (
          <View style={[styles.legend, { backgroundColor: theme.cardBackground }]}> 
            <Text style={[styles.legendTitle, { color: theme.textPrimary }]}>Ruta optimizada</Text>
            <Text style={{ color: theme.textPrimary }}>Distancia total: <Text style={{ fontWeight: 'bold' }}>{route.distancia_total || 0} m</Text></Text>
            <Text style={{ color: theme.textPrimary }}>Tiempo estimado: <Text style={{ fontWeight: 'bold' }}>{route.tiempo_estimado_total || route.tiempo_estimado_minutos || 0} min</Text></Text>
            <Text style={{ color: theme.textPrimary }}>Algoritmo: <Text style={{ fontWeight: 'bold' }}>{route.algoritmo_utilizado?.nombre || 'N/A'}</Text></Text>
          </View>
        )}

        {/* Leyenda */}
        <View style={[styles.legend, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.legendTitle, { color: theme.textPrimary }]}>Leyenda</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: theme.primary }]} />
            <Text style={[styles.legendText, { color: theme.textPrimary }]}>
              Punto de reposición
            </Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#8b5cf6' }]} />
            <Text style={[styles.legendText, { color: theme.textPrimary }]}>Mueble</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendColor, { backgroundColor: '#e0e0e0' }]} />
            <Text style={[styles.legendText, { color: theme.textPrimary }]}>Caminable</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Cargando mapa...
        </Text>
      </View>
    );
  }

  if (noPointsAssigned) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <IconSymbol name="map" size={64} color={theme.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          No tienes puntos de reposición asignados
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Mapa Interactivo" />

      {renderMapa()}

      {/* Modal de detalle del punto */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <IconSymbol name="shippingbox.fill" size={28} color={theme.primary} />
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Punto #{selectedPoint?.id_punto}
              </Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
                Ubicación:
              </Text>
              <Text style={[styles.modalValue, { color: theme.textPrimary }]}>
                Estantería {selectedPoint?.estanteria} - Nivel {selectedPoint?.nivel}
              </Text>
            </View>

            {selectedPoint?.producto ? (
              <>
                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
                    Producto:
                  </Text>
                  <Text style={[styles.modalValue, { color: theme.textPrimary }]}>
                    {selectedPoint.producto.nombre}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
                    Categoría:
                  </Text>
                  <Text style={[styles.modalValue, { color: theme.textPrimary }]}>
                    {selectedPoint.producto.categoria}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
                    Presentación:
                  </Text>
                  <Text style={[styles.modalValue, { color: theme.textPrimary }]}>
                    {selectedPoint.producto.unidad_cantidad} {selectedPoint.producto.unidad_tipo}
                  </Text>
                </View>
              </>
            ) : (
              <View style={[styles.emptyProductContainer, { backgroundColor: theme.backgroundSecondary }]}>
                <IconSymbol name="exclamationmark.triangle" size={24} color={theme.textSecondary} />
                <Text style={[styles.emptyProductText, { color: theme.textSecondary }]}>
                  Este punto no tiene producto asignado en este momento
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  cell: {
    borderWidth: 0.5,
  },
  point: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  pointText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  legend: {
    padding: 12,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalRow: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  emptyProductContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  emptyProductText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
