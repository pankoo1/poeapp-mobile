import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { tareaService } from '../../api';
import { obtenerReponedoresAsignados } from '../../api/supervisorService';
import type { PuntoReposicion } from '../../types';

interface TaskCreationSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedPoints: SelectedPoint[];
  onTaskCreated: () => void;
  onUpdateQuantity: (pointId: number, quantity: number) => void;
  onRemovePoint: (pointId: number) => void;
}

interface SelectedPoint {
  punto: PuntoReposicion;
  cantidad: number;
  ubicacion?: { x: number; y: number };
}

interface Reponedor {
  id_usuario: number;
  nombre: string;
  correo: string;
  estado: string;
}

export const TaskCreationSheet: React.FC<TaskCreationSheetProps> = ({
  visible,
  onClose,
  selectedPoints,
  onTaskCreated,
  onUpdateQuantity,
  onRemovePoint,
}) => {
  const [reponedorSeleccionado, setReponedorSeleccionado] = useState<string>('sin_asignar');
  const [reponedores, setReponedores] = useState<Reponedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingReponedores, setLoadingReponedores] = useState(true);
  const [cantidadesPorProducto, setCantidadesPorProducto] = useState<Map<string, number>>(new Map());

  // Memoizar agrupación de productos por mueble
  const mueblesAgrupados = useMemo(() => {
    const mueblesMap = new Map<string, typeof selectedPoints>();
    selectedPoints.forEach(sp => {
      const key = sp.ubicacion 
        ? `${sp.ubicacion.x},${sp.ubicacion.y}`
        : `${sp.punto.estanteria},${sp.punto.nivel}`;
      if (!mueblesMap.has(key)) {
        mueblesMap.set(key, []);
      }
      mueblesMap.get(key)!.push(sp);
    });
    return mueblesMap;
  }, [selectedPoints]);

  useEffect(() => {
    if (visible) {
      cargarReponedores();
      // Inicializar cantidades en 0 para cada producto único solo si no existen
      setCantidadesPorProducto(prev => {
        const inicial = new Map(prev);
        mueblesAgrupados.forEach((puntos, muebleKey) => {
          puntos.forEach(sp => {
            if (sp.punto.producto) {
              const productoKey = `${muebleKey}_${sp.punto.producto.nombre}`;
              if (!inicial.has(productoKey)) {
                inicial.set(productoKey, 0);
              }
            }
          });
        });
        return inicial;
      });
    } else {
      // Limpiar cuando se cierra el modal
      setCantidadesPorProducto(new Map());
    }
  }, [visible]);

  const cargarReponedores = async () => {
    try {
      setLoadingReponedores(true);
      const data = await obtenerReponedoresAsignados();
      setReponedores(data);
    } catch (error) {
      console.error('Error al cargar reponedores:', error);
      Alert.alert('Error', 'No se pudieron cargar los reponedores disponibles');
    } finally {
      setLoadingReponedores(false);
    }
  };

  const handleCantidadProductoChange = (muebleKey: string, nombreProducto: string, cantidadTotal: number) => {
    const productoKey = `${muebleKey}_${nombreProducto}`;
    setCantidadesPorProducto(prev => {
      const newMap = new Map(prev);
      newMap.set(productoKey, cantidadTotal);
      return newMap;
    });

    // Distribuir la cantidad solo entre los puntos que tienen este producto específico
    const puntos = mueblesAgrupados.get(muebleKey);
    if (puntos && puntos.length > 0) {
      const puntosDelProducto = puntos.filter(sp => sp.punto.producto?.nombre === nombreProducto);
      
      if (puntosDelProducto.length > 0) {
        const cantidadPorPunto = Math.floor(cantidadTotal / puntosDelProducto.length);
        const resto = cantidadTotal % puntosDelProducto.length;
        
        puntosDelProducto.forEach((sp, index) => {
          // Los primeros 'resto' puntos reciben 1 unidad extra
          const cantidad = cantidadPorPunto + (index < resto ? 1 : 0);
          onUpdateQuantity(sp.punto.id_punto, cantidad);
        });

        // Resetear a 0 los puntos que NO son de este producto
        puntos.forEach(sp => {
          if (sp.punto.producto?.nombre !== nombreProducto) {
            // Mantener su cantidad actual si ya tiene una asignada
            // No hacemos nada aquí para no sobrescribir otras cantidades
          }
        });
      }
    }
  };

  const handleCreateTask = async () => {
    // Validación 1: Al menos un producto debe tener cantidad > 0
    const productosConCantidad = Array.from(cantidadesPorProducto.entries()).filter(([_, cant]) => cant > 0);
    
    if (productosConCantidad.length === 0) {
      Alert.alert('Error', 'Debes ingresar al menos una cantidad para algún producto');
      return;
    }

    // Validación 2: Confirmar si no hay reponedor
    if (reponedorSeleccionado === 'sin_asignar') {
      Alert.alert(
        'Confirmar',
        'No has seleccionado un reponedor. La tarea quedará sin asignar. ¿Continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => ejecutarCreacionTarea() },
        ]
      );
      return;
    }

    ejecutarCreacionTarea();
  };

  const ejecutarCreacionTarea = async () => {
    try {
      setLoading(true);
      
      // Filtrar solo los puntos con cantidad > 0
      const puntosParaEnviar = selectedPoints.filter(sp => sp.cantidad > 0);
      
      await tareaService.crearTarea({
        id_reponedor: reponedorSeleccionado !== 'sin_asignar' 
          ? parseInt(reponedorSeleccionado) 
          : null,
        estado_id: reponedorSeleccionado !== 'sin_asignar' ? 1 : 5,
        puntos: puntosParaEnviar.map(sp => ({
          id_punto: sp.punto.id_punto,
          cantidad: sp.cantidad,
        })),
      });

      Alert.alert(
        'Éxito',
        reponedorSeleccionado !== 'sin_asignar'
          ? 'Tarea creada y asignada correctamente'
          : 'Tarea creada sin asignar',
        [
          {
            text: 'OK',
            onPress: () => {
              onTaskCreated();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error al crear tarea:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo crear la tarea'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Ionicons name="create" size={24} color="#10B981" />
              <Text style={styles.title}>Crear Tarea de Reposición</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Banner informativo */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text style={styles.infoBannerText}>
                Ingresa la cantidad total por producto. Se distribuirá automáticamente.
              </Text>
            </View>

            {/* Muebles Seleccionados */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="cube" size={20} color="#3B82F6" />
                <Text style={styles.sectionTitle}>
                  Muebles Seleccionados ({mueblesAgrupados.size})
                </Text>
              </View>
              
              {selectedPoints.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>
                    No hay muebles seleccionados
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={Array.from(mueblesAgrupados.entries())}
                  keyExtractor={([ubicacion]) => ubicacion}
                  renderItem={({ item: [ubicacion, puntos] }) => {
                    const [x, y] = ubicacion.split(',');
                    
                    // Agrupar productos únicos por nombre con sus puntos (con fallback)
                    const productosPorNombre = new Map<string, typeof puntos>();
                    puntos.forEach(sp => {
                      if (sp?.punto?.producto?.nombre) {
                        const nombre = sp.punto.producto.nombre;
                        if (!productosPorNombre.has(nombre)) {
                          productosPorNombre.set(nombre, []);
                        }
                        productosPorNombre.get(nombre)!.push(sp);
                      }
                    });

                    // Si no hay productos válidos, no renderizar este mueble
                    if (productosPorNombre.size === 0) return null;

                    return (
                      <View style={styles.muebleCard}>
                        {/* Header del Mueble */}
                        <View style={styles.muebleHeader}>
                          <View style={styles.muebleHeaderLeft}>
                            <Ionicons name="filing" size={24} color="#10B981" />
                            <View style={styles.muebleHeaderInfo}>
                              <Text style={styles.muebleTitle}>
                                Mueble ({x}, {y})
                              </Text>
                              <Text style={styles.muebleSubtitle}>
                                {Array.from(productosPorNombre.keys()).join(', ')}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Lista de productos con inputs individuales */}
                        {Array.from(productosPorNombre.entries()).map(([nombreProducto, puntosProducto]) => {
                          const productoKey = `${ubicacion}_${nombreProducto}`;
                          const cantidadTotal = cantidadesPorProducto.get(productoKey) || 0;
                          
                          return (
                            <View key={productoKey} style={styles.productoSection}>
                              {/* Info del Producto */}
                              <View style={styles.productoHeader}>
                                <Ionicons name="cube" size={20} color="#059669" />
                                <View style={styles.productoHeaderInfo}>
                                  <Text style={styles.productoNombre}>{nombreProducto}</Text>
                                  <Text style={styles.productoPuntos}>
                                    {puntosProducto.length} ubicaciones
                                  </Text>
                                </View>
                              </View>

                              {/* Input de cantidad para este producto */}
                              <View style={styles.cantidadInputContainer}>
                                <View style={styles.cantidadInputHeader}>
                                  <Ionicons name="calculator" size={16} color="#10B981" />
                                  <Text style={styles.cantidadInputLabel}>
                                    Cantidad total:
                                  </Text>
                                </View>
                                <TextInput
                                  style={[
                                    styles.cantidadInput,
                                    cantidadTotal <= 0 && styles.cantidadInputError
                                  ]}
                                  value={cantidadTotal === 0 ? '' : cantidadTotal.toString()}
                                  onChangeText={(text) => {
                                    if (text === '') {
                                      handleCantidadProductoChange(ubicacion, nombreProducto, 0);
                                    } else {
                                      const num = parseInt(text);
                                      if (!isNaN(num) && num >= 0) {
                                        handleCantidadProductoChange(ubicacion, nombreProducto, num);
                                      }
                                    }
                                  }}
                                  keyboardType="numeric"
                                  placeholder="Ej: 100"
                                  placeholderTextColor="#9CA3AF"
                                />
                                {cantidadTotal > 0 && (
                                  <Text style={styles.distribucionInfo}>
                                    ✓ ~{Math.floor(cantidadTotal / puntosProducto.length)} unidades por ubicación
                                  </Text>
                                )}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    );
                  }}
                  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                  contentContainerStyle={{ paddingVertical: 8 }}
                  initialNumToRender={3}
                  maxToRenderPerBatch={5}
                  windowSize={5}
                  removeClippedSubviews={true}
                  scrollEnabled={false}
                />
              )}
            </View>

            {/* Asignar Reponedor */}
            {selectedPoints.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={20} color="#3B82F6" />
                  <Text style={styles.sectionTitle}>Asignar a Reponedor</Text>
                </View>
                
                {loadingReponedores ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando reponedores...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.helperText}>
                      Selecciona quién ejecutará esta tarea:
                    </Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={reponedorSeleccionado}
                        onValueChange={(value) => setReponedorSeleccionado(value)}
                        style={styles.picker}
                      >
                        <Picker.Item 
                          label="⚠️ Sin asignar (asignar después)" 
                          value="sin_asignar" 
                        />
                        {reponedores.map((rep) => (
                          <Picker.Item
                            key={rep.id_usuario}
                            label={`👤 ${rep.nombre} - ${rep.correo}`}
                            value={rep.id_usuario.toString()}
                          />
                        ))}
                      </Picker>
                    </View>
                    {reponedorSeleccionado === 'sin_asignar' && (
                      <View style={styles.warningBox}>
                        <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                        <Text style={styles.warningText}>
                          La tarea quedará sin asignar hasta que un supervisor la asigne manualmente
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {/* Resumen */}
            {selectedPoints.length > 0 && (
              <View style={styles.summarySection}>
                <View style={styles.summaryHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.summaryTitle}>Resumen de la Tarea</Text>
                </View>
                <View style={styles.summaryContent}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tipos de productos:</Text>
                    <Text style={styles.summaryValue}>{cantidadesPorProducto.size}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Cantidad total:</Text>
                    <Text style={styles.summaryValue}>
                      {Array.from(cantidadesPorProducto.values()).reduce((sum, cant) => sum + cant, 0)} unidades
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Asignado a:</Text>
                    <Text style={[styles.summaryValue, reponedorSeleccionado === 'sin_asignar' && styles.summaryValueWarning]}>
                      {reponedorSeleccionado === 'sin_asignar' 
                        ? 'Sin asignar'
                        : reponedores.find(r => r.id_usuario.toString() === reponedorSeleccionado)?.nombre || 'Desconocido'
                      }
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.createButton, loading && styles.createButtonDisabled]}
              onPress={handleCreateTask}
              disabled={loading || selectedPoints.length === 0}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Crear Tarea</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  pointsList: {
    gap: 16,
  },
  muebleCard: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    overflow: 'hidden',
  },
  muebleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderBottomWidth: 1,
    borderBottomColor: '#10B981',
  },
  muebleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  muebleHeaderInfo: {
    flex: 1,
  },
  muebleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
  },
  muebleSubtitle: {
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
    fontWeight: '500',
  },
  productoSection: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  productoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  productoHeaderInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  productoPuntos: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cantidadInputContainer: {
    marginTop: 8,
  },
  cantidadInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cantidadInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  cantidadInput: {
    height: 50,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  cantidadInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  distribucionInfo: {
    fontSize: 12,
    color: '#059669',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  productosListContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  productosListTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  productoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  productoItemText: {
    fontSize: 13,
    color: '#374151',
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  summarySection: {
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderTopWidth: 2,
    borderTopColor: '#10B981',
    borderRadius: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#166534',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  summaryValueWarning: {
    color: '#D97706',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
