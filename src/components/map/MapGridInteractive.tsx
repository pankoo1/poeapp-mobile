import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import type { UbicacionFisica, PuntoReposicion } from '../../types';

interface MapGridInteractiveProps {
  width?: number;  // Ancho del mapa en celdas
  height?: number; // Alto del mapa en celdas
  ubicaciones?: UbicacionFisica[];
  ruta?: Array<{ x: number; y: number }>;
  currentPosition?: { x: number; y: number };
  showRoute?: boolean;
  onPointPress?: (punto: PuntoReposicion, x: number, y: number) => void;
}

const CELL_SIZE = 50; // Aumentado de 35 a 50 para mejor visibilidad

export default function MapGridInteractive({
  width,   // Ahora representa el ancho del mapa en celdas
  height,  // Ahora representa el alto del mapa en celdas
  ubicaciones = [],
  ruta = [],
  currentPosition,
  showRoute = false,
  onPointPress,
}: MapGridInteractiveProps) {
  const [zoom, setZoom] = useState(1.2); // Iniciar con zoom aumentado

  // Calcular dimensiones del mapa usando los props o calculándolos de ubicaciones
  const maxX = width !== undefined ? width - 1 : Math.max(...ubicaciones.map((u) => u.x), 0);
  const maxY = height !== undefined ? height - 1 : Math.max(...ubicaciones.map((u) => u.y), 0);
  const mapWidth = (maxX + 1) * CELL_SIZE;
  const mapHeight = (maxY + 1) * CELL_SIZE;

  // Debug logs
  console.log('🗺️ MapGridInteractive - Renderizando:', {
    propsWidth: width,
    propsHeight: height,
    maxX,
    maxY,
    mapWidth,
    mapHeight,
    ubicacionesCount: ubicaciones.length,
    cellSize: CELL_SIZE,
    zoom
  });

  const getBackgroundColor = (x: number, y: number): string => {
    const ubicacion = ubicaciones.find((ub) => ub.x === x && ub.y === y);

    if (!ubicacion || !ubicacion.objeto) {
      return '#F3F4F6';
    }

    // PRIORIDAD 1: Si tiene mueble asociado
    if (ubicacion.mueble) {
      return '#8B5CF6'; // Morado para muebles
    }

    // PRIORIDAD 2: Usar el campo tipo del objeto del backend
    if (ubicacion.objeto) {
      const tipoObjeto = ubicacion.objeto.tipo?.toLowerCase() || '';

      // Tipos específicos del backend
      if (tipoObjeto.includes('mueble') || tipoObjeto.includes('estanteria')) {
        return '#8B5CF6'; // Morado para muebles
      }
      if (tipoObjeto.includes('salida') || tipoObjeto.includes('entrada')) {
        return '#22c55e'; // Verde para salidas
      }
      if (tipoObjeto.includes('muro') || tipoObjeto.includes('pared') || tipoObjeto.includes('obstaculo')) {
        return '#374151'; // Gris oscuro para obstáculos
      }
      if (tipoObjeto.includes('pasillo') || tipoObjeto.includes('camino') || tipoObjeto.includes('caminable')) {
        return '#E5E7EB'; // Gris claro para pasillos
      }

      // PRIORIDAD 3: Usar el campo caminable del objeto
      if (ubicacion.objeto.caminable !== undefined) {
        return ubicacion.objeto.caminable ? '#E5E7EB' : '#374151';
      }
    }

    return '#E5E7EB'; // Por defecto, pasillo
  };

  // Recolectar puntos de reposición
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

  // Determinar si un punto está en la ruta
  const isPuntoEnRuta = (x: number, y: number): boolean => {
    return ruta.some((r) => r.x === x && r.y === y);
  };

  // Controles de zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.3, 4)); // Aumentar rango a 4x
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.3, 0.6)); // Mínimo 0.6x
  };

  const handleZoomReset = () => {
    setZoom(1.2); // Reset a 1.2x
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Controles de zoom */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
          <Text style={styles.controlButtonText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomReset}>
          <Text style={styles.controlButtonText}>⊙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.scrollView}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          style={styles.scrollView}
        >
          <View
            style={{
              transform: [{ scale: zoom }],
              width: mapWidth,
              height: mapHeight,
              padding: 20,
            }}
          >
            {/* Renderizar grilla */}
            <View style={styles.grid}>
              {Array.from({ length: maxY + 1 }, (_, y) =>
                Array.from({ length: maxX + 1 }, (_, x) => {
                  const backgroundColor = getBackgroundColor(x, y);
                  const enRuta = showRoute && isPuntoEnRuta(x, y);
                  const esPosicionActual =
                    currentPosition && currentPosition.x === x && currentPosition.y === y;

                  return (
                    <View
                      key={`${x}-${y}`}
                      style={[
                        styles.cell,
                        {
                          backgroundColor,
                          borderColor: enRuta ? '#f59e0b' : '#D1D5DB',
                          borderWidth: enRuta ? 4 : 0.5,
                        },
                      ]}
                    >
                      {esPosicionActual && (
                        <View style={styles.currentPositionMarker} />
                      )}
                    </View>
                  );
                })
              )}
            </View>

            {/* Renderizar ruta con SVG */}
            {showRoute && ruta.length > 0 && (
              <Svg
                height={mapHeight}
                width={mapWidth}
                style={StyleSheet.absoluteFill}
              >
                {/* Línea de la ruta */}
                <Polyline
                  points={ruta
                    .map((point) => `${point.x * CELL_SIZE + CELL_SIZE / 2},${point.y * CELL_SIZE + CELL_SIZE / 2}`)
                    .join(' ')}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="4"
                />

                {/* Marcador de inicio */}
                {ruta.length > 0 && (
                  <Circle
                    cx={ruta[0].x * CELL_SIZE + CELL_SIZE / 2}
                    cy={ruta[0].y * CELL_SIZE + CELL_SIZE / 2}
                    r="8"
                    fill="#10b981"
                  />
                )}

                {/* Marcador de fin */}
                {ruta.length > 1 && (
                  <Circle
                    cx={ruta[ruta.length - 1].x * CELL_SIZE + CELL_SIZE / 2}
                    cy={ruta[ruta.length - 1].y * CELL_SIZE + CELL_SIZE / 2}
                    r="8"
                    fill="#ef4444"
                  />
                )}
              </Svg>
            )}

            {/* Marcadores de puntos con producto */}
            {puntosConUbicacion.map(({ punto, x, y }, index) => {
              const enRuta = showRoute && isPuntoEnRuta(x, y);
              return (
                <TouchableOpacity
                  key={`punto-${punto.id_punto}-${index}`}
                  style={[
                    styles.puntoMarker,
                    {
                      left: x * CELL_SIZE + CELL_SIZE / 2 - 10,
                      top: y * CELL_SIZE + CELL_SIZE / 2 - 10,
                      backgroundColor: enRuta ? '#f59e0b' : '#3B82F6',
                    },
                  ]}
                  onPress={() => onPointPress && onPointPress(punto, x, y)}
                >
                  <Text style={styles.puntoMarkerText}>{punto.nivel}-{punto.estanteria}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>Mueble</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.legendText}>Salida</Text>
        </View>
        {showRoute && (
          <>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#2563eb' }]} />
              <Text style={styles.legendText}>Ruta</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.legendText}>Punto en ruta</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    gap: 12,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  controlButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentPositionMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 8,
  },
  puntoMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  puntoMarkerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
  },
});
