/**
 * Utilidad para deshabilitar logs en producción
 * Este archivo se importa automáticamente en App.tsx
 */

if (!__DEV__) {
  // Deshabilitar console.log en producción
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  
  // Mantener console.warn y console.error para depuración crítica
}

export {};
