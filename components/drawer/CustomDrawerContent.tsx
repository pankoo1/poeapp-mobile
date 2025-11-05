/**
 * Contenido personalizado del Drawer (menú hamburguesa)
 * Muestra las opciones de configuración
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { spacing, typography, borders, shadows } from '@/constants/design';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { theme, gradients, isDarkMode } = useTheme();
  const { user } = useAuth();

  const menuItems = [
    {
      id: 'profile',
      title: 'Mi Perfil',
      description: 'Ver y editar información',
      icon: 'person.circle.fill',
      route: '/profile',
    },
    {
      id: 'theme',
      title: 'Modo Oscuro',
      description: isDarkMode ? 'Activado' : 'Desactivado',
      icon: 'moon.fill',
      route: '/theme',
    },
    {
      id: 'logout',
      title: 'Cerrar Sesión',
      description: 'Salir de la aplicación',
      icon: 'arrow.right.square.fill',
      route: '/logout',
      danger: true,
    },
  ];

  const handleItemPress = (route: string) => {
    props.navigation.closeDrawer();
    router.push(route as any);
  };

  const styles = createStyles(theme);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      {/* Header con gradiente */}
      <LinearGradient
        colors={gradients.primary as any}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.rol || 'Usuario'}</Text>
        </View>
      </LinearGradient>

      {/* Título de configuraciones */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Configuraciones</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index === menuItems.length - 1 && styles.menuItemLast,
            ]}
            onPress={() => handleItemPress(item.route)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.menuIconContainer,
              item.danger && styles.menuIconContainerDanger,
            ]}>
              <IconSymbol
                name={item.icon as any}
                size={24}
                color={item.danger ? theme.error : theme.primary}
              />
            </View>

            <View style={styles.menuTextContainer}>
              <Text style={[
                styles.menuTitle,
                item.danger && styles.menuTitleDanger,
              ]}>
                {item.title}
              </Text>
              <Text style={styles.menuDescription}>
                {item.description}
              </Text>
            </View>

            <IconSymbol
              name="chevron.right"
              size={20}
              color={theme.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>POE App Móvil</Text>
        <Text style={styles.footerVersion}>Versión 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: spacing['4xl'],
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    avatarContainer: {
      marginBottom: spacing.md,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: borders.radius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    avatarText: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: '#ffffff',
    },
    userName: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: '#ffffff',
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    roleBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs / 2,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: borders.radius.full,
    },
    roleText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: '#ffffff',
      textTransform: 'capitalize',
    },
    sectionHeader: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    menuContainer: {
      paddingHorizontal: spacing.lg,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.cardBackground,
      borderRadius: borders.radius.md,
      marginBottom: spacing.sm,
      ...shadows.small,
    },
    menuItemLast: {
      marginTop: spacing.md,
    },
    menuIconContainer: {
      width: 44,
      height: 44,
      borderRadius: borders.radius.md,
      backgroundColor: `${theme.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    menuIconContainerDanger: {
      backgroundColor: `${theme.error}15`,
    },
    menuTextContainer: {
      flex: 1,
    },
    menuTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textPrimary,
      marginBottom: spacing.xs / 4,
    },
    menuTitleDanger: {
      color: theme.error,
    },
    menuDescription: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      color: theme.textSecondary,
    },
    footer: {
      marginTop: 'auto',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    footerText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textTertiary,
      marginBottom: spacing.xs / 4,
    },
    footerVersion: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.normal,
      color: theme.textTertiary,
    },
  });
