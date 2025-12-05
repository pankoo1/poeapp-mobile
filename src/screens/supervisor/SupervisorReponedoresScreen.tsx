import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supervisorService, ReponedorAsignado } from '../../api/supervisorService';

export const SupervisorReponedoresScreen: React.FC = () => {
  const [reponedores, setReponedores] = useState<ReponedorAsignado[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
  });
  const [creatingReponedor, setCreatingReponedor] = useState(false);

  useEffect(() => {
    cargarReponedores();
  }, []);

  const cargarReponedores = async () => {
    try {
      setLoading(true);
      const data = await supervisorService.obtenerReponedoresAsignados();
      setReponedores(data);
    } catch (error) {
      console.error('Error al cargar reponedores:', error);
      Alert.alert('Error', 'No se pudieron cargar los reponedores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarReponedores();
  };

  const abrirModalCrear = () => {
    setFormData({ nombre: '', correo: '', contraseña: '' });
    setModalVisible(true);
  };

  const validarFormulario = (): string | null => {
    if (!formData.nombre.trim()) {
      return 'El nombre es obligatorio';
    }
    if (!formData.correo.trim()) {
      return 'El correo es obligatorio';
    }
    if (!formData.correo.includes('@')) {
      return 'El correo debe ser válido';
    }
    if (!formData.contraseña) {
      return 'La contraseña es obligatoria';
    }
    if (formData.contraseña.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  const crearReponedor = async () => {
    const error = validarFormulario();
    if (error) {
      Alert.alert('Error de validación', error);
      return;
    }

    try {
      setCreatingReponedor(true);
      const nuevoReponedor = await supervisorService.registrarReponedor(formData);
      
      Alert.alert(
        'Éxito',
        `Reponedor ${nuevoReponedor.nombre} creado correctamente`,
        [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              cargarReponedores();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error al crear reponedor:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo crear el reponedor'
      );
    } finally {
      setCreatingReponedor(false);
    }
  };

  const filteredReponedores = reponedores.filter((rep) =>
    rep.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return '#10B981';
      case 'inactivo':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

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
            <Text style={styles.title}>Gestión de Reponedores</Text>
            <Text style={styles.subtitle}>
              {reponedores.length} reponedor{reponedores.length !== 1 ? 'es' : ''} asignado{reponedores.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={abrirModalCrear}>
            <Ionicons name="add-circle" size={28} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Búsqueda */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar reponedores..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9CA3AF"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de reponedores */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Cargando reponedores...</Text>
          </View>
        ) : filteredReponedores.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>
              {searchTerm ? 'No se encontraron reponedores' : 'Sin reponedores'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchTerm
                ? 'Intenta con otra búsqueda'
                : 'Comienza agregando tu primer reponedor'}
            </Text>
          </View>
        ) : (
          <View style={styles.reponedoresList}>
            {filteredReponedores.map((reponedor) => (
              <View key={reponedor.id_usuario} style={styles.reponedorCard}>
                <View style={styles.reponedorHeader}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.reponedorInfo}>
                    <Text style={styles.reponedorNombre}>{reponedor.nombre}</Text>
                    <Text style={styles.reponedorCorreo}>{reponedor.correo}</Text>
                  </View>
                  <View
                    style={[
                      styles.estadoBadge,
                      { backgroundColor: `${getEstadoColor(reponedor.estado)}20` },
                    ]}
                  >
                    <View
                      style={[
                        styles.estadoDot,
                        { backgroundColor: getEstadoColor(reponedor.estado) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.estadoText,
                        { color: getEstadoColor(reponedor.estado) },
                      ]}
                    >
                      {reponedor.estado}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Consejo */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.tipTitle}>Información</Text>
          </View>
          <Text style={styles.tipText}>
            Los reponedores creados aquí se asignarán automáticamente a tu supervisión y podrás asignarles tareas desde el mapa.
          </Text>
        </View>
      </ScrollView>

      {/* Modal para crear reponedor */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !creatingReponedor && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Reponedor</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                disabled={creatingReponedor}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {/* Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre Completo *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Juan Pérez"
                    value={formData.nombre}
                    onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                    editable={!creatingReponedor}
                  />
                </View>
              </View>

              {/* Correo */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Correo Electrónico *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="correo@ejemplo.com"
                    value={formData.correo}
                    onChangeText={(text) => setFormData({ ...formData, correo: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!creatingReponedor}
                  />
                </View>
              </View>

              {/* Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contraseña *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.contraseña}
                    onChangeText={(text) => setFormData({ ...formData, contraseña: text })}
                    secureTextEntry
                    editable={!creatingReponedor}
                  />
                </View>
              </View>

              <View style={styles.helperTextContainer}>
                <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                <Text style={styles.helperText}>
                  El reponedor podrá iniciar sesión con estos datos
                </Text>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={creatingReponedor}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.createButton, creatingReponedor && styles.createButtonDisabled]}
                onPress={crearReponedor}
                disabled={creatingReponedor}
              >
                {creatingReponedor ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Crear Reponedor</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  reponedoresList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  reponedorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reponedorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reponedorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reponedorNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reponedorCorreo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  estadoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 40,
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
    color: '#3B82F6',
    lineHeight: 18,
  },
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalScrollView: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  helperTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },
  modalFooter: {
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
    backgroundColor: '#3B82F6',
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
