import { UserSession } from '../utils/token';

export interface LoginPayload {
  email: string;
  password: string;
  role: 'Administrador' | 'Empleado';
}

export interface LoginResponse {
  token: string;
  user: UserSession;
}

export const AuthService = {
  async login(credentials: LoginPayload): Promise<LoginResponse> {
    // Simula una pequeña demora de red (0.8 segundos)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Validamos datos de prueba "quemados" (mocked)
    if (credentials.email === 'admin@gmail.com' && credentials.password === '123456789012') {
      return {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_token_123',
        user: {
          id: 'usr_001',
          email: credentials.email,
          role: credentials.role,
          tenantId: 'tenant_demo_99',
          companyName: 'Mi Empresa Demo'
        }
      };
    }

    // Si las credenciales no coinciden con las de prueba arriba
    throw new Error('Error al iniciar sesión. Verifica tus credenciales.');
  }
};