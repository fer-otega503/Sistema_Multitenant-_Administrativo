import axios from 'axios';

// Instancia global y aislada para la API Gateway
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Endpoint unificado para la autenticación de operarios
 * @param {string} username - Identificador de usuario (Mapeado a email en backend)
 * @param {string} password - Clave secreta
 * @param {string} tenant - Aislamiento del esquema multi-tenant
 */
export const authenticateUser = async (username, password, tenant) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email: username,
      password,
      tenant,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error crítico en la infraestructura de red.';
  }
};