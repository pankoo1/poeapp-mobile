/**
 * Pantalla de Perfil - POE-59
 * Permite ver y editar la información personal del usuario
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { spacing, typography, borders, shadows } from '@/constants/design';
import { HttpClient } from '@/services/http.client';
import { API_ENDPOINTS } from '@/config/api';

interface UserProfile {
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, gradients } = useTheme();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await HttpClient.get<UserProfile>(API_ENDPOINTS.profile);
      setProfile(response.data);
      setNombre(response.data.nombre);
      setCorreo(response.data.correo);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!correo.trim() || !correo.includes('@')) {
      Alert.alert('Error', 'Ingrese un correo válido');
      return;
    }

    try {
      setSaving(true);
      
      // Actualizar perfil
      const endpoint = API_ENDPOINTS.usuarios.replace(':id', user?.id?.toString() || '');
      await HttpClient.put(endpoint, {
        nombre: nombre.trim(),
        correo: correo.trim(),
      });

      // Recargar datos
      await loadProfile();
      setEditing(false);
      
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setNombre(profile.nombre);
      setCorreo(profile.correo);
    }
    setEditing(false);
  };

  const styles = createStyles(theme);

  if (loading) {
    return (
      <LinearGradient colors={gradients.background as any} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!profile) {
    return (
      <LinearGradient colors={gradients.background as any} style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color={theme.error} />
          <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradients.background as any} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.left" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={gradients.primary as any}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>
              {nombre.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={styles.userName}>{nombre}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{profile.rol}</Text>
          </View>
        </View>

        {/* Profile Form */}
        <View style={styles.formContainer}>
          {/* Nombre Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nombre Completo</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol
                name="person.fill"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  !editing && styles.inputDisabled,
                ]}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ingrese su nombre"
                placeholderTextColor={theme.textTertiary}
                editable={editing}
              />
            </View>
          </View>

          {/* Correo Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Correo Electrónico</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol
                name="envelope.fill"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  !editing && styles.inputDisabled,
                ]}
                value={correo}
                onChangeText={setCorreo}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={theme.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={editing}
              />
            </View>
          </View>

          {/* Estado Field (Read-only) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Estado</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={20}
                color={profile.estado === 'activo' ? theme.success : theme.warning}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={profile.estado}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          {!editing ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.primaryButton as any}
                style={styles.editButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <IconSymbol name="pencil" size={20} color={theme.textInverse} />
                <Text style={styles.editButtonText}>Editar Perfil</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.editingButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.8}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={saving}
              >
                <LinearGradient
                  colors={gradients.primaryButton as any}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={theme.textInverse} />
                  ) : (
                    <>
                      <IconSymbol name="checkmark" size={20} color={theme.textInverse} />
                      <Text style={styles.saveButtonText}>Guardar</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing['4xl'],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    errorText: {
      marginTop: spacing.md,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.error,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      backgroundColor: theme.primary,
      borderRadius: borders.radius.md,
    },
    retryButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textInverse,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing['4xl'],
      paddingBottom: spacing.lg,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borders.radius.md,
      backgroundColor: theme.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    headerSpacer: {
      width: 40,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    avatarGradient: {
      width: 100,
      height: 100,
      borderRadius: borders.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
      ...shadows.large,
    },
    avatarText: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      color: '#ffffff',
    },
    userName: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
      marginBottom: spacing.xs,
    },
    roleBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs / 2,
      backgroundColor: `${theme.primary}15`,
      borderRadius: borders.radius.full,
    },
    roleText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.primary,
      textTransform: 'capitalize',
    },
    formContainer: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing.lg,
    },
    fieldContainer: {
      marginBottom: spacing.lg,
    },
    fieldLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
      marginBottom: spacing.xs,
      marginLeft: spacing.xs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBackground,
      borderRadius: borders.radius.md,
      borderWidth: borders.width.thin,
      borderColor: theme.border,
      paddingHorizontal: spacing.md,
    },
    inputIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      paddingVertical: spacing.md,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      color: theme.textPrimary,
    },
    inputDisabled: {
      opacity: 0.6,
    },
    buttonsContainer: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xl,
    },
    editButton: {
      borderRadius: borders.radius.md,
      overflow: 'hidden',
      ...shadows.medium,
    },
    editButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.base,
      gap: spacing.xs,
    },
    editButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: theme.textInverse,
    },
    editingButtons: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: spacing.base,
      backgroundColor: theme.inputBackground,
      borderRadius: borders.radius.md,
      borderWidth: borders.width.thin,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    saveButton: {
      flex: 1,
      borderRadius: borders.radius.md,
      overflow: 'hidden',
      ...shadows.medium,
    },
    saveButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.base,
      gap: spacing.xs,
    },
    saveButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: theme.textInverse,
    },
  });
