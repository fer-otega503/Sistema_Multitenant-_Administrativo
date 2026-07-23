// Key names para LocalStorage
const TOKEN_KEY = 'auth_jwt_token';
const TENANT_KEY = 'tenant_id';
const USER_KEY = 'user_info';

export interface UserSession {
  id: string;
  email: string;
  role: 'Administrador' | 'Empleado';
  tenantId: string;
  companyName: string;
}

export const TokenService = {
  saveSession(token: string, user: UserSession) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TENANT_KEY, user.tenantId);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getTenantId(): string | null {
    return localStorage.getItem(TENANT_KEY);
  },

  getUser(): UserSession | null {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TENANT_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
