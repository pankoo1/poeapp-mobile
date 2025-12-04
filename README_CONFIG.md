# Configuración de la aplicación móvil POE

## Configuración del API

Para conectar la aplicación con el backend, debes editar el archivo:
`src/api/client.ts`

Cambia la constante `API_URL` por la dirección IP de tu servidor backend:

```typescript
const API_URL = 'http://TU_IP_AQUI:8000';
```

### Ejemplos:

- **Desarrollo local:** `http://192.168.1.100:8000`
- **Red local:** `http://192.168.0.50:8000`
- **Servidor remoto:** `https://api.tupoe.com`

### Encontrar tu IP local:

**Windows:**
```bash
ipconfig
```
Busca "Dirección IPv4" en tu adaptador de red activo.

**macOS/Linux:**
```bash
ifconfig
```

## Ejecutar la aplicación

1. Asegúrate de tener instalado Expo Go en tu dispositivo móvil
2. Ejecuta el servidor de desarrollo:
   ```bash
   cd PoeAppMobile
   npm start
   ```
3. Escanea el código QR con Expo Go

## Usuarios de prueba

Puedes usar estos usuarios para probar (si están en tu backend):

**Supervisor:**
- Email: supervisor@poe.com
- Contraseña: (según tu configuración)

**Reponedor:**
- Email: reponedor@poe.com
- Contraseña: (según tu configuración)
