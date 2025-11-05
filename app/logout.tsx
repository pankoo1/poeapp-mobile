/**
 * Pantalla de Cerrar Sesión - POE-59
 * Muestra confirmación antes de cerrar sesión
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { spacing, typography, borders, shadows } from '@/constants/design';

export default function LogoutScreen() {
  const router = useRouter();
  const { theme, gradients } = useTheme();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      // El redirect a /login se maneja automáticamente en AuthContext
    } catch (error: any) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión. Intente nuevamente.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const styles = createStyles(theme);

  return (
    <LinearGradient colors={gradients.background as any} style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCancel}
            activeOpacity={0.7}
            disabled={loading}
          >
            <IconSymbol name="chevron.left" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cerrar Sesión</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Confirmation Card */}
        <View style={styles.confirmationCard}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[theme.error, theme.warning] as any}
              style={styles.iconGradient}
            >
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={48}
                color="#ffffff"
              />
            </LinearGradient>
          </View>

          <Text style={styles.confirmationTitle}>
            ¿Estás seguro que deseas salir?
          </Text>

          <Text style={styles.confirmationMessage}>
            Cerrarás tu sesión y necesitarás ingresar tus credenciales nuevamente
            para acceder a la aplicación.
          </Text>

          <View style={styles.infoBox}>
            <IconSymbol
              name="info.circle.fill"
              size={20}
              color={theme.info}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Tus datos y configuraciones se mantendrán guardados de forma segura.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>No, Regresar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
            disabled={loading}
          >
            <LinearGradient
              colors={[theme.error, theme.warning] as any}
              style={styles.logoutButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <IconSymbol
                    name="arrow.right.square.fill"
                    size={20}
                    color="#ffffff"
                  />
                  <Text style={styles.logoutButtonText}>Sí, Cerrar Sesión</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingBottom: spacing['4xl'],
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
    confirmationCard: {
      marginHorizontal: spacing.lg,
      marginTop: spacing['3xl'],
      padding: spacing.xl,
      backgroundColor: theme.cardBackground,
      borderRadius: borders.radius.lg,
      alignItems: 'center',
      ...shadows.medium,
    },
    iconContainer: {
      marginBottom: spacing.lg,
    },
    iconGradient: {
      width: 100,
      height: 100,
      borderRadius: borders.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.large,
    },
    confirmationTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    confirmationMessage: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: spacing.md,
      backgroundColor: `${theme.info}15`,
      borderRadius: borders.radius.md,
      borderLeftWidth: 3,
      borderLeftColor: theme.info,
      width: '100%',
    },
    infoIcon: {
      marginRight: spacing.sm,
      marginTop: 2,
    },
    infoText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    buttonsContainer: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing['3xl'],
      gap: spacing.md,
    },
    cancelButton: {
      paddingVertical: spacing.base,
      backgroundColor: theme.inputBackground,
      borderRadius: borders.radius.md,
      borderWidth: borders.width.thin,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.small,
    },
    cancelButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textPrimary,
    },
    logoutButton: {
      borderRadius: borders.radius.md,
      overflow: 'hidden',
      ...shadows.medium,
    },
    logoutButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.base,
      gap: spacing.xs,
    },
    logoutButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: '#ffffff',
    },
  });
