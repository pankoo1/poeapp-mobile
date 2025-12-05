import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CoordenadaRuta, PuntoVisitaDetalle } from '../../types';

interface RutaMapGridProps {
  coordenadas: CoordenadaRuta[];
  puntos: PuntoVisitaDetalle[];
  ancho?: number;
  alto?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 48) / 15); // Ajustar según necesidad

export const RutaMapGrid: React.FC<RutaMapGridProps> = ({
  coordenadas,
  puntos,
  ancho = 15,
  alto = 15,
}) => {
  // Crear mapa de coordenadas por posición (x,y) -> secuencia
  const coordMap = new Map<string, number>();
  coordenadas.forEach((coord) => {
    coordMap.set(`${coord.x},${coord.y}`, coord.secuencia);
  });

  // Crear mapa de puntos de llegada
  const puntosMap = new Map<string, PuntoVisitaDetalle>();
  puntos.forEach((punto) => {
    const coordX = punto.coordenada_llegada?.x ?? punto.x_acceso ?? 0;
    const coordY = punto.coordenada_llegada?.y ?? punto.y_acceso ?? 0;
    puntosMap.set(`${coordX},${coordY}`, punto);
  });

  // Renderizar grid
  const renderGrid = () => {
    const rows = [];
    
    for (let y = 0; y < alto; y++) {
      const cells = [];
      
      for (let x = 0; x < ancho; x++) {
        const key = `${x},${y}`;
        const secuencia = coordMap.get(key);
        const punto = puntosMap.get(key);
        
        let cellStyle: any = styles.cell;
        let content = null;

        if (punto) {
          // Es un punto de visita
          cellStyle = [styles.cell, styles.cellPuntoVisita];
          content = (
            <Text style={styles.textoPuntoVisita}>{punto.orden}</Text>
          );
        } else if (secuencia !== undefined) {
          // Es parte del camino
          cellStyle = [styles.cell, styles.cellCamino];
        } else {
          // Celda vacía
          cellStyle = [styles.cell, styles.cellVacia];
        }

        cells.push(
          <View key={`${x}-${y}`} style={cellStyle}>
            {content}
          </View>
        );
      }
      
      rows.push(
        <View key={`row-${y}`} style={styles.row}>
          {cells}
        </View>
      );
    }
    
    return rows;
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>{renderGrid()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  grid: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellVacia: {
    backgroundColor: '#F3F4F6',
  },
  cellCamino: {
    backgroundColor: '#DBEAFE', // Azul claro para el camino
  },
  cellPuntoVisita: {
    backgroundColor: '#10B981', // Verde para puntos de visita
    borderWidth: 2,
    borderColor: '#059669',
  },
  textoPuntoVisita: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default RutaMapGrid;
