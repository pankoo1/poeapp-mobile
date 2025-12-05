import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { rutaService, mapaService } from '../../api';
import { RutaVisualResponse, MapaResponse, PuntoReposicion } from '../../types';
import { MapGrid } from '../../components/map';

type RutaVisualizacionRouteProp = RouteProp<
  { RutaVisualizacion: { idTarea: number } },
  'RutaVisualizacion'
>;

interface RutaVisualizacionScreenProps {
  idTarea?: number;
}

export const RutaVisualizacionScreen: React.FC<RutaVisualizacionScreenProps> = ({ idTarea: idTareaProp }) => {
  const route = useRoute<RutaVisualizacionRouteProp>();
  const navigation = useNavigation();
  
  // Obtener idTarea de props o de route.params
  const idTarea = idTareaProp || route.params?.idTarea;

  const [ruta, setRuta] = useState<RutaVisualResponse | null>(null);
  const [mapaAlmacen, setMapaAlmacen] = useState<MapaResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    cargarRuta();
  }, [idTarea]);

  const cargarRuta = async (mostrarAlertSiNoExiste: boolean = true) => {
    try {
      setCargando(true);
      
      // Cargar mapa del almacén
      const mapaData = await mapaService.obtenerMapa();
      setMapaAlmacen(mapaData);
      
      // Cargar ruta visual
      const data = await rutaService.obtenerRutaVisual(idTarea);
      setRuta(data);
    } catch (error: any) {
      console.error('Error al cargar ruta:', error);
      
      if (error.response?.status === 404 && mostrarAlertSiNoExiste && !generando) {
        Alert.alert(
          'Ruta no encontrada',
          'No se ha generado una ruta para esta tarea. ¿Deseas generarla ahora?',
          [
            { 
              text: 'Cancelar', 
              style: 'cancel',
              onPress: () => navigation.goBack()
            },
            { text: 'Generar', onPress: generarRuta },
          ]
        );
      } else if (!generando) {
        Alert.alert('Error', 'No se pudo cargar la ruta');
      }
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  };

  const generarRuta = async () => {
    try {
      setGenerando(true);
      setCargando(true);
      
      // Generar la ruta
      await rutaService.generarRuta(idTarea);
      
      // Esperar un momento adicional para asegurar que la ruta esté disponible
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Intentar cargar la ruta sin mostrar alert si falla
      const data = await rutaService.obtenerRutaVisual(idTarea);
      setRuta(data);
      
      Alert.alert('Éxito', 'Ruta generada correctamente');
    } catch (error: any) {
      console.error('Error al generar ruta:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo generar la ruta'
      );
    } finally {
      setGenerando(false);
      setCargando(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarRuta(false); // No mostrar alert en refresh
  };

  if (cargando && !generando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Cargando ruta optimizada...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (generando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Generando ruta optimizada...</Text>
          <Text style={styles.loadingSubtext}>Esto puede tardar unos segundos</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ruta) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={80} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No hay ruta disponible</Text>
          <Text style={styles.emptyText}>
            Esta tarea no tiene una ruta generada
          </Text>
          <TouchableOpacity style={styles.generateButton} onPress={generarRuta}>
            <Ionicons name="flash" size={20} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Generar Ruta</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tiempoMinutos = Math.round((ruta.tiempo_estimado_minutos || ruta.tiempo_estimado_min || 0) / 60);
  const reponedor = ruta.reponedor || 'Reponedor';
  const fechaCreacion = ruta.fecha_creacion ? new Date(ruta.fecha_creacion).toLocaleDateString() : new Date().toLocaleDateString();
  const algoritmo = ruta.algoritmo_usado || 'Algoritmo optimizado';

  return (
    <SafeAreaView style={styles.container}>
      {/* Mapa en pantalla completa */}
      <View style={styles.mapFullScreen}>
        {mapaAlmacen && (
          <MapGrid
            width={mapaAlmacen.mapa.ancho}
            height={mapaAlmacen.mapa.alto}
            ubicaciones={mapaAlmacen.ubicaciones}
            ruta={ruta.coordenadas_ruta.map(c => ({ x: c.x, y: c.y }))}
            selectedPoints={ruta.puntos_visita.map(p => p.id_punto)}
            showIndividualPoints={true}
          />
        )}
      </View>

      {/* Botón flotante para ver detalles */}
      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={() => Alert.alert(
          'Detalles de la Ruta',
          `Puntos a visitar: ${ruta.puntos_visita.length}\n` +
          `Distancia: ${ruta.distancia_total} pasos\n` +
          `Tiempo estimado: ${tiempoMinutos} minutos\n` +
          `Algoritmo: ${algoritmo.replace(/_/g, ' ')}`,
          [
            { text: 'Regenerar Ruta', onPress: generarRuta },
            { text: 'Cerrar', style: 'cancel' }
          ]
        )}
      >
        <Ionicons name="information-circle" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  detailsButton: {
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
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  algorithmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  algorithmText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  badgeCount: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  pointsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pointItemLast: {
    borderBottomWidth: 0,
  },
  pointNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pointNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pointInfo: {
    flex: 1,
  },
  pointProducto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  pointDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  pointDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  pointCoords: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  coordText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  regenerateButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RutaVisualizacionScreen;
