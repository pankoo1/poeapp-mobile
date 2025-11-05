/**
 * Estilos para la pantalla de Login
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borders, shadows, sizes } from '@/constants/design';

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    marginBottom: spacing.base,
  },
  logoGradient: {
    width: sizes.logo.medium,
    height: sizes.logo.medium,
    borderRadius: borders.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  logoText: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  formContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    ...shadows.medium,
  },
  formTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: borders.width.medium,
    borderColor: colors.border,
    borderRadius: borders.radius.md,
    padding: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  button: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    borderRadius: borders.radius.md,
    overflow: 'hidden',
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    padding: spacing.base,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  testCredentials: {
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.border,
    paddingTop: spacing.xl,
  },
  testTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borders.radius.md,
    marginBottom: spacing.md,
    borderWidth: borders.width.thin,
  },
  testButtonAdmin: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderColor: 'rgba(79, 70, 229, 0.3)',
  },
  testButtonSupervisor: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  testButtonReponedor: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  testButtonEmoji: {
    fontSize: typography.fontSize['2xl'],
    marginRight: spacing.md,
  },
  testButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testButtonRole: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  testButtonEmail: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});
