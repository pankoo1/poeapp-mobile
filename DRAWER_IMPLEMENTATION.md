# Actualización POE-59: Menú Hamburguesa (Drawer Navigation)

## 📋 Cambios Realizados

### Interfaz Rediseñada
Se reemplazó el tab de "Configuraciones" por un **menú hamburguesa (drawer)** que se abre:
- Presionando el ícono de menú (☰) en la esquina superior izquierda
- Deslizando el dedo desde el borde izquierdo de la pantalla

## 🔧 Implementación Técnica

### Nuevas Dependencias Instaladas
```bash
@react-navigation/drawer
react-native-gesture-handler
react-native-reanimated
```

### Archivos Creados

#### 1. `components/drawer/CustomDrawerContent.tsx`
Contenido personalizado del drawer con:
- **Header con gradiente**: Avatar, nombre y rol del usuario
- **Menú de opciones**:
  - Mi Perfil → `/profile`
  - Modo Oscuro → `/theme` (muestra si está activado/desactivado)
  - Cerrar Sesión → `/logout` (con estilo de advertencia)
- **Footer**: Información de la app y versión
- **Diseño adaptable al tema**: Light/Dark mode

#### 2. `components/drawer/CustomHeader.tsx`
Header personalizado para las pantallas de tabs con:
- **Botón de menú hamburguesa** (☰) en la izquierda
- **Título de la pantalla** centrado
- **Espaciador** a la derecha para balance visual
- **Estilos dinámicos** según el tema activo

### Archivos Modificados

#### 1. `app/_layout.tsx`
```typescript
// Agregado al inicio del archivo
import 'react-native-gesture-handler';
```
Necesario para que funcione correctamente el drawer.

#### 2. `app/(tabs)/_layout.tsx`
Cambios principales:
- Importado `createDrawerNavigator` de `@react-navigation/drawer`
- Creado `TabsNavigator` que envuelve los tabs existentes
- Exportado `TabLayout` que retorna un `Drawer.Navigator`
- Configuración del drawer:
  - **drawerContent**: Componente personalizado `CustomDrawerContent`
  - **drawerType**: 'slide' (desliza desde el lado)
  - **drawerStyle**: Ancho de 300px
  - **swipeEnabled**: true (gesto de deslizar habilitado)
  - **swipeEdgeWidth**: 50px (área sensible al toque)

Antes (con tabs):
```typescript
<Tabs>
  <Tabs.Screen name="index" ... />
  <Tabs.Screen name="explore" ... />
  <Tabs.Screen name="settings" ... />
</Tabs>
```

Después (con drawer):
```typescript
<Drawer.Navigator>
  <Drawer.Screen name="tabs" component={TabsNavigator} />
</Drawer.Navigator>

// TabsNavigator solo tiene index y explore
```

#### 3. `app/(tabs)/index.tsx`
- Agregado import de `CustomHeader` y `View`
- Envuelto `ParallaxScrollView` en `<View style={{ flex: 1 }}>`
- Agregado `<CustomHeader title="Inicio" />` al inicio

#### 4. `app/(tabs)/explore.tsx`
- Agregado import de `CustomHeader` y `View`
- Envuelto `ParallaxScrollView` en `<View style={{ flex: 1 }}>`
- Agregado `<CustomHeader title="Explorar" />` al inicio

### Archivo Eliminado
- ❌ `app/(tabs)/settings.tsx` - Ya no es necesario como tab

## 🎨 Diseño del Drawer

### Header (Gradiente)
```
┌─────────────────────────┐
│    [Gradiente Primario] │
│                         │
│         [Avatar]        │
│       Nombre Usuario    │
│       [Badge Rol]       │
│                         │
└─────────────────────────┘
```

### Opciones de Menú
```
CONFIGURACIONES
┌─────────────────────────┐
│ [👤] Mi Perfil       › │
│      Ver y editar...    │
└─────────────────────────┘
┌─────────────────────────┐
│ [🌙] Modo Oscuro     › │
│      Activado           │
└─────────────────────────┘
┌─────────────────────────┐
│ [🚪] Cerrar Sesión   › │ (Rojo)
│      Salir de la app    │
└─────────────────────────┘
```

### Footer
```
    POE App Móvil
    Versión 1.0.0
```

## 🔄 Flujo de Usuario

### Abrir el Drawer
1. **Opción 1**: Tocar el ícono ☰ en la esquina superior izquierda
2. **Opción 2**: Deslizar el dedo desde el borde izquierdo de la pantalla hacia la derecha

### Navegar
1. El drawer se desliza mostrando las opciones
2. Usuario toca una opción
3. El drawer se cierra automáticamente
4. La navegación ocurre a la pantalla seleccionada

### Cerrar el Drawer
- Tocar fuera del drawer (en el área oscurecida)
- Deslizar el drawer hacia la izquierda
- Tocar una opción del menú

## 📱 Pantallas Afectadas

### Con Header Personalizado
- ✅ `Home` (index.tsx) - Botón de menú visible
- ✅ `Explore` (explore.tsx) - Botón de menú visible

### Pantallas de Configuración (Sin cambios)
- ✅ `/profile` - Mantiene su header con botón "atrás"
- ✅ `/theme` - Mantiene su header con botón "atrás"
- ✅ `/logout` - Mantiene su header con botón "atrás"

## 🎯 Ventajas del Drawer vs Tabs

### Ventajas
1. **Más espacio en pantalla**: No ocupa espacio permanente en la barra inferior
2. **Mejor organización**: Las configuraciones están agrupadas jerárquicamente
3. **Gestos intuitivos**: Deslizar es un patrón conocido en apps móviles
4. **Escalable**: Fácil agregar más opciones sin saturar la interfaz
5. **Información contextual**: Muestra avatar y rol del usuario
6. **Profesional**: Patrón de diseño común en apps empresariales

### UX Mejorada
- El usuario puede acceder a configuraciones desde cualquier pantalla
- No hay cambio de contexto al navegar entre Home y Explore
- Las opciones de configuración están organizadas visualmente
- Feedback visual claro (estado del modo oscuro visible en el drawer)

## 🧪 Pruebas Sugeridas

### Gestos
- [ ] Deslizar desde borde izquierdo abre el drawer
- [ ] Tocar icono ☰ abre el drawer
- [ ] Tocar fuera del drawer lo cierra
- [ ] Deslizar drawer hacia izquierda lo cierra

### Navegación
- [ ] Tocar "Mi Perfil" navega a `/profile`
- [ ] Tocar "Modo Oscuro" navega a `/theme`
- [ ] Tocar "Cerrar Sesión" navega a `/logout`
- [ ] Drawer se cierra automáticamente al navegar

### Visual
- [ ] Avatar muestra inicial del nombre
- [ ] Nombre y rol se muestran correctamente
- [ ] Estado del modo oscuro actualizado en tiempo real
- [ ] Tema light/dark se aplica al drawer
- [ ] Gradientes se muestran correctamente

### Responsive
- [ ] Drawer funciona en diferentes tamaños de pantalla
- [ ] Gestos funcionan en toda el área sensible (50px)
- [ ] Animaciones son fluidas

## 🔐 Consideraciones de Seguridad

- El drawer solo es accesible después del login
- Usa `useProtectedRoute` en las pantallas principales
- El logout limpia completamente la sesión
- No expone información sensible en el drawer

## 📝 Notas de Implementación

### Orden de Imports en _layout.tsx
⚠️ **IMPORTANTE**: `react-native-gesture-handler` DEBE ser el primer import:
```typescript
import 'react-native-gesture-handler'; // ← PRIMERO
import { DarkTheme, ... } from '@react-navigation/native';
```

### Configuración del Drawer
```typescript
<Drawer.Navigator
  drawerContent={(props) => <CustomDrawerContent {...props} />}
  screenOptions={{
    drawerType: 'slide',      // Tipo de animación
    drawerStyle: { width: 300 }, // Ancho del drawer
    swipeEnabled: true,       // Permitir gesto
    swipeEdgeWidth: 50,       // Área sensible al toque
  }}
>
```

### TypeScript
```typescript
// Props del drawer content
DrawerContentComponentProps from '@react-navigation/drawer'

// Navigation hook
DrawerNavigationProp<any> from '@react-navigation/drawer'
```

## ✨ Resultado Final

### Antes
```
┌─────────────────────────┐
│                         │
│      Contenido          │
│                         │
├─────────────────────────┤
│ Home | Explore | ⚙️ Settings│ ← Tab bar siempre visible
└─────────────────────────┘
```

### Después
```
┌─────────────────────────┐
│ ☰  Título           [ ] │ ← Header con menú
│                         │
│      Contenido          │
│       completo          │
│                         │
│                         │
├─────────────────────────┤
│    Home  |  Explore     │ ← Solo 2 tabs
└─────────────────────────┘

[Deslizar desde izquierda]
→ Se abre el drawer con todas las configuraciones
```

## 🚀 Próximos Pasos Sugeridos

1. Agregar animaciones personalizadas al drawer
2. Implementar notificaciones/badges en opciones del menú
3. Agregar más opciones de configuración según necesidades
4. Implementar búsqueda en el drawer para muchas opciones
5. Agregar accesos directos a funcionalidades frecuentes

---

**Fecha de actualización**: 4 de noviembre de 2025
**Versión**: 1.1.0
