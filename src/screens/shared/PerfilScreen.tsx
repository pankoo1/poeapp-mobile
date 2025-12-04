import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function PerfilScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const getRoleName = (rol: string | number) => {
    if (typeof rol === 'string') {
      return rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase();
    }
    switch (rol) {
      case 2: return 'Supervisor';
      case 3: return 'Reponedor';
      default: return 'Usuario';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.nombre?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.nombre}</Text>
        <Text style={styles.role}>{getRoleName(user?.rol || '')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.correo}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              user?.estado === 'activo' ? styles.statusActive : styles.statusInactive
            ]} />
            <Text style={styles.value}>
              {user?.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        {user?.id_empresa && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID Empresa</Text>
            <Text style={styles.value}>{user.id_empresa}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>ID Usuario</Text>
          <Text style={styles.value}>{user?.id}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aplicación</Text>
        <Text style={styles.infoText}>
          Versión: 1.0.0
        </Text>
        <Text style={styles.infoText}>
          POE Mobile App
        </Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 POE App - Todos los derechos reservados
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '400',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#34C759',
  },
  statusInactive: {
    backgroundColor: '#FF3B30',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
  },
});
