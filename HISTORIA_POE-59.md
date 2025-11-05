# Historia de Usuario POE-59: Acceso a Configuraciones Generales

## 📋 Resumen
Implementación completa del sistema de configuraciones generales para la aplicación móvil POE, incluyendo gestión de perfil, modo oscuro/claro, y cierre de sesión.

## ✅ Estado: COMPLETADO

## 🎯 Criterios de Aceptación

### 1. Ver y Editar Perfil de Usuario ✅
- ✅ Pantalla de perfil (`app/profile.tsx`) implementada
- ✅ Consulta de datos del perfil con `GET /usuarios/me`
- ✅ Actualización de perfil con `PUT /usuarios/{id}`
- ✅ Campos editables: nombre y correo electrónico
- ✅ Campos de solo lectura: rol y estado
- ✅ Validación de formularios
- ✅ Estados de carga y error
- ✅ Modo edición/vista con botones de acción

### 2. Cambiar entre Modo Oscuro y Claro ✅
- ✅ Sistema de temas completo (`constants/appTheme.ts`)
- ✅ ThemeContext y ThemeProvider (`contexts/ThemeContext.tsx`)
- ✅ Pantalla de configuración de tema (`app/theme.tsx`)
- ✅ Switch para cambiar entre modos
- ✅ Persistencia en AsyncStorage
- ✅ Actualización inmediata de la UI
- ✅ Temas light y dark con colores personalizados
- ✅ Integración en todas las pantallas

### 3. Cerrar Sesión ✅
- ✅ Pantalla de confirmación de logout (`app/logout.tsx`)
- ✅ Mensaje de confirmación antes de cerrar sesión
- ✅ Integración con AuthContext.logout
- ✅ Limpieza de sesión y redirección a login
- ✅ Estados de carga durante el proceso
- ✅ Manejo de errores

### 4. Navegación y Acceso ✅
- ✅ Pantalla de configuraciones principales (`app/(tabs)/settings.tsx`)
- ✅ Agregada al tab navigator con ícono de engranaje
- ✅ Navegación a todas las sub-pantallas
- ✅ Diseño consistente con el resto de la app

## 📁 Archivos Creados/Modificados

### Archivos Nuevos
```
PoeApp/
  ├── constants/
  │   └── appTheme.ts                 # Sistema de temas light/dark
  ├── contexts/
  │   └── ThemeContext.tsx            # Contexto y provider de tema
  ├── app/
  │   ├── profile.tsx                 # Pantalla de perfil
  │   ├── theme.tsx                   # Pantalla de modo oscuro
  │   ├── logout.tsx                  # Pantalla de confirmación logout
  │   └── (tabs)/
  │       └── settings.tsx            # Pantalla principal de configuraciones
```

### Archivos Modificados
```
PoeApp/
  ├── app/
  │   ├── _layout.tsx                 # Agregado ThemeProvider
  │   ├── login.tsx                   # Actualizado para usar useTheme
  │   └── (tabs)/
  │       └── _layout.tsx             # Agregado tab de configuraciones
```

## 🎨 Sistema de Temas

### appTheme.ts
- **Tema Claro**: Colores brillantes, fondos blancos
- **Tema Oscuro**: Colores vibrantes sobre fondos oscuros
- **Propiedades**:
  - Colores primarios, secundarios y de acento
  - Fondos y gradientes
  - Textos (primario, secundario, terciario, inverso)
  - Estados (success, warning, error, info)
  - Bordes y transparencias

### ThemeContext.tsx
- **Estado**: `themeMode` ('light' | 'dark')
- **Funciones**:
  - `toggleTheme()`: Alterna entre modos
  - `setThemeMode(mode)`: Establece modo específico
- **Persistencia**: AsyncStorage con clave `@poe_theme_mode`
- **Carga inicial**: Restaura tema guardado al iniciar

## 🖥️ Pantallas Implementadas

### 1. Configuraciones (settings.tsx)
**Ubicación**: Tab principal de navegación

**Características**:
- Lista de opciones con íconos
- Navegación a sub-pantallas:
  - Mi Perfil → `/profile`
  - Modo Oscuro → `/theme`
  - Cerrar Sesión → `/logout`
- Información de la app (versión)
- Diseño con gradientes dinámicos según tema

### 2. Perfil (profile.tsx)
**Ubicación**: `/profile`

**Características**:
- Avatar con inicial del nombre
- Badge de rol
- Formulario con campos:
  - Nombre (editable)
  - Correo (editable)
  - Estado (solo lectura)
- Modo vista/edición
- Botones de acción:
  - "Editar Perfil" (en modo vista)
  - "Cancelar" y "Guardar" (en modo edición)
- Estados de carga y error
- Validación de campos

**Endpoints**:
- `GET /usuarios/me` - Obtener perfil
- `PUT /usuarios/{id}` - Actualizar perfil

### 3. Modo Oscuro (theme.tsx)
**Ubicación**: `/theme`

**Características**:
- Ícono dinámico (sol/luna) según tema activo
- Switch para cambiar tema
- Lista de beneficios del modo oscuro:
  - Reduce fatiga visual
  - Ahorra batería (OLED)
  - Ideal para ambientes oscuros
- Nota informativa sobre persistencia
- Actualización inmediata de UI

### 4. Cerrar Sesión (logout.tsx)
**Ubicación**: `/logout`

**Características**:
- Mensaje de confirmación
- Ícono de advertencia con gradiente
- Información sobre datos guardados
- Botones de acción:
  - "No, Regresar" (cancelar)
  - "Sí, Cerrar Sesión" (confirmar)
- Estado de carga durante logout
- Manejo de errores

## 🔄 Flujo de Usuario

### Acceder a Configuraciones
1. Usuario toca tab "Configuraciones" en navegación inferior
2. Ve lista de opciones disponibles
3. Selecciona opción deseada

### Ver/Editar Perfil
1. Usuario toca "Mi Perfil"
2. Se carga y muestra información del perfil
3. Usuario toca "Editar Perfil"
4. Modifica nombre y/o correo
5. Toca "Guardar" o "Cancelar"
6. Si guarda, se actualiza en backend y recarga datos

### Cambiar Tema
1. Usuario toca "Modo Oscuro"
2. Ve estado actual del tema
3. Activa/desactiva switch
4. Tema cambia inmediatamente en toda la app
5. Preferencia se guarda en AsyncStorage

### Cerrar Sesión
1. Usuario toca "Cerrar Sesión"
2. Ve mensaje de confirmación
3. Toca "Sí, Cerrar Sesión"
4. Se limpia sesión local
5. Redirección automática a login

## 🎨 Diseño y Estilos

### Componentes Reutilizables
- Gradientes dinámicos según tema activo
- Cards con sombras y bordes redondeados
- Íconos de SF Symbols
- Inputs con estilos consistentes
- Botones primarios con gradientes
- Botones secundarios con bordes

### Constantes Utilizadas
- `spacing`: Espaciado consistente
- `typography`: Tamaños y pesos de fuente
- `borders`: Radios y grosores
- `shadows`: Sombras predefinidas

### Responsive
- KeyboardAvoidingView en formularios
- ScrollView para contenido extenso
- Diseño adaptable a diferentes tamaños

## 🔒 Seguridad

### Autenticación
- Todas las peticiones usan Bearer token
- HttpClient con interceptores automáticos
- Manejo de errores 401 (sesión expirada)

### Validación
- Validación de correo electrónico
- Campos requeridos verificados
- Mensajes de error descriptivos

### Privacidad
- Datos de perfil protegidos
- Sesión limpiada completamente al logout
- Tokens almacenados de forma segura

## 📊 Manejo de Estados

### Estados de Carga
- Loading spinners durante peticiones
- Botones deshabilitados mientras se procesa
- Mensajes informativos al usuario

### Estados de Error
- Captura de errores en try/catch
- Alerts con mensajes descriptivos
- Pantallas de error con opción de reintentar
- Logs en consola para debugging

### Estados de Éxito
- Confirmación visual al guardar
- Actualización inmediata de UI
- Feedback al usuario

## 🧪 Pruebas

### Casos de Prueba Sugeridos

#### Perfil
- [ ] Cargar perfil al abrir pantalla
- [ ] Editar nombre y guardar
- [ ] Editar correo y guardar
- [ ] Validar correo inválido
- [ ] Validar campos vacíos
- [ ] Cancelar edición restaura valores
- [ ] Manejar error de red

#### Tema
- [ ] Cambiar a modo oscuro
- [ ] Verificar persistencia al reabrir app
- [ ] Cambiar a modo claro
- [ ] Verificar actualización de todos los componentes

#### Logout
- [ ] Mostrar confirmación
- [ ] Cancelar logout
- [ ] Confirmar logout
- [ ] Verificar redirección a login
- [ ] Verificar limpieza de sesión

## 📝 Notas Técnicas

### TypeScript
- Tipos definidos para todas las props
- Interfaces para respuestas de API
- Type safety en ThemeContext

### React Native Best Practices
- Componentes funcionales con hooks
- Context API para estado global
- Estilos dinámicos con StyleSheet.create
- Optimización de renderizado

### AsyncStorage
- Clave única para tema: `@poe_theme_mode`
- Carga asíncrona al iniciar app
- Guardado automático al cambiar

## 🚀 Próximos Pasos

### POE-60 y siguientes
Con las configuraciones implementadas, la base está lista para:
- Gestión completa de usuarios
- Planificación de rutas
- Visualización de mapas
- Reportes y estadísticas

### Mejoras Futuras
- Tema automático según hora del día
- Más opciones de personalización
- Cambio de idioma
- Notificaciones push
- Biometría para login

## ✨ Conclusión

La historia POE-59 ha sido completada exitosamente con todas las funcionalidades requeridas:
- ✅ Sistema de temas completo y funcional
- ✅ Gestión de perfil con edición
- ✅ Modo oscuro con persistencia
- ✅ Cierre de sesión con confirmación
- ✅ Navegación intuitiva
- ✅ Diseño consistente y profesional
- ✅ Manejo robusto de errores
- ✅ Integración con backend

Fecha de completación: 2024
