/**
 * Pantalla de Configuración de Tema - POE-59
 * Permite cambiar entre modo claro y oscuro
 */

import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borders, shadows } from '@/constants/design';

export default function ThemeScreen() {
  const router = useRouter();
  const { theme, gradients, isDarkMode, toggleTheme } = useTheme();

  const styles = createStyles(theme);

  return (
    <LinearGradient colors={gradients.background as any} style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.left" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modo Oscuro</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Theme Preview Card */}
        <View style={styles.previewCard}>
          <View style={styles.previewIconContainer}>
            <LinearGradient
              colors={gradients.primary as any}
              style={styles.previewIconGradient}
            >
              <IconSymbol
                name={isDarkMode ? 'moon.fill' : 'sun.max.fill'}
                size={48}
                color="#ffffff"
              />
            </LinearGradient>
          </View>

          <Text style={styles.previewTitle}>
            {isDarkMode ? 'Modo Oscuro Activado' : 'Modo Claro Activado'}
          </Text>
          <Text style={styles.previewDescription}>
            {isDarkMode
              ? 'Reduce la fatiga visual en ambientes con poca luz'
              : 'Mejor visibilidad en ambientes luminosos'}
          </Text>
        </View>

        {/* Theme Toggle Card */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleContent}>
            <View style={styles.toggleInfo}>
              <View style={[
                styles.toggleIconContainer,
                isDarkMode && styles.toggleIconContainerActive,
              ]}>
                <IconSymbol
                  name="moon.fill"
                  size={24}
                  color={isDarkMode ? theme.primary : theme.textSecondary}
                />
              </View>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Activar Modo Oscuro</Text>
                <Text style={styles.toggleDescription}>
                  Cambia la apariencia de la aplicación
                </Text>
              </View>
            </View>

            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.border,
                true: theme.primary,
              }}
              thumbColor="#ffffff"
              ios_backgroundColor={theme.border}
            />
          </View>
        </View>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Beneficios del Modo Oscuro</Text>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <IconSymbol name="eye.fill" size={20} color={theme.primary} />
            </View>
            <Text style={styles.benefitText}>
              Reduce la fatiga visual durante el uso prolongado
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <IconSymbol name="battery.100" size={20} color={theme.primary} />
            </View>
            <Text style={styles.benefitText}>
              Ahorra batería en dispositivos con pantallas OLED
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <IconSymbol name="moon.stars.fill" size={20} color={theme.primary} />
            </View>
            <Text style={styles.benefitText}>
              Ideal para usar la app en ambientes oscuros
            </Text>
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.noteContainer}>
          <IconSymbol
            name="info.circle.fill"
            size={20}
            color={theme.info}
            style={styles.noteIcon}
          />
          <Text style={styles.noteText}>
            Tu preferencia de tema se guardará automáticamente y se aplicará
            cada vez que abras la aplicación.
          </Text>
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
    previewCard: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.xl,
      padding: spacing.xl,
      backgroundColor: theme.cardBackground,
      borderRadius: borders.radius.lg,
      alignItems: 'center',
      ...shadows.medium,
    },
    previewIconContainer: {
      marginBottom: spacing.lg,
    },
    previewIconGradient: {
      width: 100,
      height: 100,
      borderRadius: borders.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.large,
    },
    previewTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    previewDescription: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    toggleCard: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.xl,
      backgroundColor: theme.cardBackground,
      borderRadius: borders.radius.lg,
      ...shadows.small,
    },
    toggleContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
    },
    toggleInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: spacing.md,
    },
    toggleIconContainer: {
      width: 48,
      height: 48,
      borderRadius: borders.radius.md,
      backgroundColor: `${theme.textSecondary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    toggleIconContainerActive: {
      backgroundColor: `${theme.primary}15`,
    },
    toggleTextContainer: {
      flex: 1,
    },
    toggleTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textPrimary,
      marginBottom: spacing.xs / 2,
    },
    toggleDescription: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      color: theme.textSecondary,
    },
    benefitsContainer: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.xl,
    },
    benefitsTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
      marginBottom: spacing.md,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    benefitIconContainer: {
      width: 32,
      height: 32,
      borderRadius: borders.radius.sm,
      backgroundColor: `${theme.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
      marginTop: 2,
    },
    benefitText: {
      flex: 1,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    noteContainer: {
      flexDirection: 'row',
      marginHorizontal: spacing.lg,
      marginTop: spacing.xl,
      padding: spacing.md,
      backgroundColor: `${theme.info}15`,
      borderRadius: borders.radius.md,
      borderLeftWidth: 3,
      borderLeftColor: theme.info,
    },
    noteIcon: {
      marginRight: spacing.sm,
      marginTop: 2,
    },
    noteText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      color: theme.textSecondary,
      lineHeight: 20,
    },
  });
