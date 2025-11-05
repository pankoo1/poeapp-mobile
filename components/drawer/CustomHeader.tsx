/**
 * Header personalizado con botón de menú hamburguesa
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borders, shadows } from '@/constants/design';

interface CustomHeaderProps {
  title: string;
}

export function CustomHeader({ title }: CustomHeaderProps) {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.openDrawer()}
        activeOpacity={0.7}
      >
        <IconSymbol name="line.3.horizontal" size={24} color={theme.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.rightSpace} />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing['4xl'],
      paddingBottom: spacing.md,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuButton: {
      width: 44,
      height: 44,
      borderRadius: borders.radius.md,
      backgroundColor: theme.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.small,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: spacing.md,
    },
    rightSpace: {
      width: 44,
    },
  });
