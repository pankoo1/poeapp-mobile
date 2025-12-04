
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import type { UbicacionFisica, PuntoReposicion } from '../../types';


interface MapGridProps {
  width: number;
  height: number;
  ubicaciones?: UbicacionFisica[];
  ruta?: Array<{ x: number; y: number }>;
  onPointPress?: (punto: PuntoReposicion, x: number, y: number) => void;
  selectedPoints?: number[]; // IDs de puntos seleccionados
}

const CELL_SIZE = 30;

export const MapGrid: React.FC<MapGridProps> = ({ 
  width, 
  height, 
  ubicaciones = [],
  ruta = [],
  onPointPress,
  selectedPoints = []
}) => {
  const mapWidth = width * CELL_SIZE;
  const mapHeight = height * CELL_SIZE;

  const getBackgroundColor = (x: number, y: number): string => {
    const ubicacion = ubicaciones.find(ub => ub.x === x && ub.y === y);
    
    if (!ubicacion || !ubicacion.objeto) {
      return '#F3F4F6'; // Gris muy claro para espacios sin definir
    }

    // PRIORIDAD 1: Si tiene mueble asociado
    if (ubicacion.mueble) {
      return '#8B5CF6'; // Morado para muebles
    }

    // PRIORIDAD 2: Usar el campo tipo del backend
    if (ubicacion.objeto) {
      const tipoObjeto = ubicacion.objeto.tipo?.toLowerCase() || '';
      
      console.log(`🎨 MapGrid color debug - (${x},${y}):`, {
        tipo: tipoObjeto,
        tieneMueble: !!ubicacion.mueble,
        caminable: ubicacion.objeto.caminable
      });
      
      // Tipos específicos del backend
      if (tipoObjeto.includes('mueble') || tipoObjeto.includes('estanteria')) {
        return '#8B5CF6'; // Morado para muebles
      }
      if (tipoObjeto.includes('salida') || tipoObjeto.includes('entrada')) {
        return '#22c55e'; // Verde para salidas
      }
      if (tipoObjeto.includes('muro') || tipoObjeto.includes('pared') || tipoObjeto.includes('obstaculo')) {
        return '#757575'; // Gris oscuro para obstáculos
      }
      if (tipoObjeto.includes('pasillo') || tipoObjeto.includes('camino') || tipoObjeto.includes('caminable')) {
        return '#E0E0E0'; // Gris claro para pasillos
      }
      
      // PRIORIDAD 3: Usar el campo caminable del objeto
      if (ubicacion.objeto.caminable !== undefined) {
        return ubicacion.objeto.caminable ? '#E0E0E0' : '#757575';
      }
      
      // Por defecto: obstáculo
      return '#757575';
    }

    return '#F3F4F6';
  };

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

  // Debug: Log para ver cuántos puntos se encontraron
  console.log('🔍 MapGrid - Puntos con productos encontrados:', {
    total: puntosConUbicacion.length,
    muestras: puntosConUbicacion.slice(0, 3).map(p => ({
      id: p.punto.id_punto,
      pos: `(${p.x},${p.y})`,
      producto: p.punto.producto?.nombre
    }))
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={{ position: 'relative' }}>
            {/* Dibujar cuadrícula fila por fila */}
            {Array.from({ length: height }).map((_, y) => (
              <View key={`row-${y}`} style={styles.row}>
                {Array.from({ length: width }).map((_, x) => (
                  <View
                    key={`cell-${x}-${y}`}
                    style={[
                      styles.cell,
                      {
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: getBackgroundColor(x, y),
                      },
                    ]}
                  />
                ))}
              </View>
            ))}

            {/* Dibujar la ruta optimizada como línea azul */}
            {ruta && ruta.length > 1 && (
              <Svg
                style={{ position: 'absolute', top: 0, left: 0 }}
                width={mapWidth}
                height={mapHeight}
              >
                <Polyline
                  points={ruta.map(p => `${p.x * CELL_SIZE + CELL_SIZE / 2},${p.y * CELL_SIZE + CELL_SIZE / 2}`).join(' ')}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth={4}
                  strokeLinejoin="round"
                />
              </Svg>
            )}

            {/* Capa superpuesta para puntos de reposición */}
            {puntosConUbicacion.length > 0 && (
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
                  const isSelected = selectedPoints.includes(item.punto.id_punto);
                  
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
                          backgroundColor: isSelected ? '#10B981' : '#3B82F6',
                          borderWidth: isSelected ? 3 : 0,
                          borderColor: isSelected ? '#FFFFFF' : 'transparent',
                        },
                      ]}
                      onPress={() => onPointPress?.(item.punto, item.x, item.y)}
                    >
                      <Text style={styles.pointText}>{item.punto.id_punto}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#E5E7EB' }]} />
          <Text style={styles.legendText}>Pasillo</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#374151' }]} />
          <Text style={styles.legendText}>Muro</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>Mueble</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.legendText}>Salida</Text>
        </View>
        {puntosConUbicacion.length > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Producto</Text>
          </View>
        )}
        {ruta && ruta.length > 1 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2563eb' }]} />
            <Text style={styles.legendText}>Ruta optimizada</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  filterInfo: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  scrollContent: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
  },
  point: {
    position: 'absolute',
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  legend: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#9CA3AF',
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
