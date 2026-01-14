/*
 * CONFIGURACIÓN CENTRALIZADA DE API
 * Para producción: Comentar la línea de desarrollo y descomentar la de producción.
 * Opcional: Se incluye auto-detección para evitar cambios manuales.
 */

// 2. URL de DESARROLLO

// 3. SELECCIÓN AUTOMÁTICA O MANUAL
// Para forzar una URL, simplemente asigna el valor directamente a API_BASE_URL
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Identificador de la Ejecutora actual (IDE_EJE)
export const PIDE_EJE_CURRENT = parseInt(
  import.meta.env.VITE_PIDE_EJE_CURRENT || "1",
  10
);

/**
 * Construye una URL completa para una ruta de API
 */
export const getApiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export default {
  API_BASE_URL,
  PIDE_EJE_CURRENT,
  getApiUrl,
};
