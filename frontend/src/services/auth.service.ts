import { TokenService, UserSession } from '../utils/token';

export interface LoginPayload {
  email: string;
  password: string;
  role: 'Administrador' | 'Empleado' | 'Gestor';
  tenantId?: string;
}

export interface LoginResponse {
  token: string;
  user: UserSession;
}

const API_BASE = 'http://localhost:3000/api';

export const AuthService = {
  /**
   * Realiza el inicio de sesión contra el backend real de PostgreSQL.
   * El tenant_id se envía en el header X-Tenant-ID para que el tenantMiddleware
   * aísle la consulta al esquema correcto (ej. "ferreteria").
   */
  async login(credentials: LoginPayload): Promise<LoginResponse> {
    // Por defecto usamos el esquema "ferreteria" si no se especifica otro
    const tenantId = credentials.tenantId ?? 'ferreteria';

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        email:    credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      let errorMsg = 'Error al iniciar sesión. Verifica tus credenciales.';
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMsg = errorData.error;
        }
      } catch {
        // Ignorar si la respuesta no es JSON
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    // Construir el objeto UserSession con los datos que devuelve el backend
    const user: UserSession = {
      id:          String(data.usuario?.id ?? ''),
      email:       data.usuario?.email ?? credentials.email,
      name:        data.usuario?.nombre ?? credentials.email.split('@')[0],
      // Usamos el rol real que devuelve el backend (Administrador, Gestor, Empleado, Gerente, Limpieza...)
      // NO hacemos cast para no perder el valor
      role:        (data.usuario?.rol ?? credentials.role),
      tenantId:    data.usuario?.tenant_id ?? tenantId,
      companyName: 'El Martillo Ferretería',
    };


    // Guardar el token y la sesión en localStorage
    TokenService.saveSession(data.token, user);

    return {
      token: data.token,
      user,
    };
  },
};