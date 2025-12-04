import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (visible) {
      cargarReponedores();
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

  const handleCreateTask = async () => {
    if (selectedPoints.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos un punto de reposición');
      return;
    }

    try {
      setLoading(true);
      await tareaService.crearTarea({
        id_reponedor: reponedorSeleccionado !== 'sin_asignar' 
          ? parseInt(reponedorSeleccionado) 
          : null,
        estado_id: reponedorSeleccionado !== 'sin_asignar' ? 1 : 5, // 1: pendiente, 5: sin asignar
        puntos: selectedPoints.map(sp => ({
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
              onClose();
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
            <Text style={styles.title}>Crear Tarea de Reposición</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Puntos Seleccionados */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Puntos Seleccionados ({selectedPoints.length})
              </Text>
              
              {selectedPoints.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>
                    No hay puntos seleccionados
                  </Text>
                </View>
              ) : (
                <View style={styles.pointsList}>
                  {selectedPoints.map((sp, index) => (
                    <View key={sp.punto.id_punto} style={styles.pointCard}>
                      <View style={styles.pointHeader}>
                        <View style={styles.pointInfo}>
                          <Text style={styles.pointNumber}>#{index + 1}</Text>
                          <View>
                            <Text style={styles.pointLocation}>
                              Estantería {sp.punto.estanteria}, Nivel {sp.punto.nivel}
                            </Text>
                            {sp.punto.producto && (
                              <Text style={styles.pointProduct}>
                                {sp.punto.producto.nombre}
                              </Text>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => onRemovePoint(sp.punto.id_punto)}
                          style={styles.removeButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>

                      {/* Cantidad Input */}
                      <View style={styles.quantityContainer}>
                        <Text style={styles.quantityLabel}>Cantidad:</Text>
                        <TextInput
                          style={styles.quantityInput}
                          value={sp.cantidad.toString()}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 1;
                            onUpdateQuantity(sp.punto.id_punto, num);
                          }}
                          keyboardType="numeric"
                          maxLength={4}
                        />
                        {sp.punto.producto && (
                          <Text style={styles.unit}>
                            {sp.punto.producto.unidad_tipo}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Asignar Reponedor */}
            {selectedPoints.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Asignar a Reponedor</Text>
                
                {loadingReponedores ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando reponedores...</Text>
                  </View>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={reponedorSeleccionado}
                      onValueChange={(value) => setReponedorSeleccionado(value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Sin asignar" value="sin_asignar" />
                      {reponedores.map((rep) => (
                        <Picker.Item
                          key={rep.id_usuario}
                          label={`${rep.nombre} (${rep.correo})`}
                          value={rep.id_usuario.toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer - Botones de acción */}
          {selectedPoints.length > 0 && (
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
                disabled={loading}
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
          )}
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  pointsList: {
    gap: 12,
  },
  pointCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pointInfo: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  pointNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  pointLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  pointProduct: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 80,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  unit: {
    fontSize: 14,
    color: '#6B7280',
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
