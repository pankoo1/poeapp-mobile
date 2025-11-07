// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navegación principal
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.up': 'keyboard-arrow-up',
  'chevron.down': 'keyboard-arrow-down',
  
  // Menú hamburguesa
  'line.3.horizontal': 'menu',
  
  // Drawer - Configuraciones
  'person.circle.fill': 'account-circle',
  'moon.fill': 'nightlight-round',
  'sun.max.fill': 'wb-sunny',
  'arrow.right.square.fill': 'exit-to-app',
  'gearshape.fill': 'settings',
  
  // Perfil
  'person.fill': 'person',
  'envelope.fill': 'email',
  'checkmark.circle.fill': 'check-circle',
  'exclamationmark.triangle.fill': 'warning',
  'pencil': 'edit',
  'checkmark': 'check',
  
  // Tema
  'eye.fill': 'visibility',
  'battery.100': 'battery-full',
  'moon.stars.fill': 'bedtime',
  'info.circle.fill': 'info',
  
  // Tareas y métricas
  'checklist': 'checklist',
  'list.bullet': 'list',
  'arrow.clockwise': 'refresh',
  'arrow.counterclockwise': 'history',
  'clock.fill': 'schedule',
  'calendar': 'event',
  'map.fill': 'map',
  'shippingbox.fill': 'inventory',
  'location.fill': 'place',
  'number': 'tag',
  
  // Acciones de tareas
  'play.fill': 'play-arrow',
  'xmark.circle.fill': 'cancel',
  
  // Filtros y ordenamiento
  'line.3.horizontal.decrease.circle': 'filter-list',
  'arrow.up': 'arrow-upward',
  'arrow.down': 'arrow-downward',
  
  // Login
  'lock.fill': 'lock',
  
  // Otros
  'person.badge.shield.checkmark.fill': 'verified-user',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
