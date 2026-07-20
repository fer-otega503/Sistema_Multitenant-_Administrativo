/**
 * Métodos de seguridad y validación para el sistema
 */

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/u;
const VALID_CHARS_REGEX = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;

// Expresión regular estándar para validar correos estructurados correctamente
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Diccionario de "typos" o errores de escritura comunes y sus respectivas correcciones
const COMMON_DOMAINS_TYPOS: Record<string, string> = {
  'gamil.com': 'gmail.com',
  'gamil.co': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'hotamil.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outlok.co': 'outlook.com',
  'outlok.es': 'outlook.es',
  'yahoo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
};

interface ValidationResult {
  isValid: boolean;
  message: string | null;
}

export const containsEmojis = (text: string): boolean => {
  return EMOJI_REGEX.test(text);
};

/**
 * Valida si un correo electrónico tiene una estructura correcta y previene errores de dedo comunes.
 * @param email Correo a evaluar
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { isValid: false, message: "El correo electrónico es requerido." };
  }

  // 1. Validar la estructura general con la expresión regular estándar
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { 
      isValid: false, 
      message: "Por favor, introduce un correo electrónico válido (ejemplo@dominio.com)." 
    };
  }

  // 2. Extraer el dominio (lo que va después del '@') y pasarlo a minúsculas para comparar
  const domain = trimmedEmail.split('@')[1]?.toLowerCase();

  // 3. Verificar si el dominio se encuentra en nuestra lista de errores comunes
  if (domain && domain in COMMON_DOMAINS_TYPOS) {
    const correctDomain = COMMON_DOMAINS_TYPOS[domain];
    return {
      isValid: false,
      message: `¿Quisiste decir @${correctDomain}? Por favor, verifica el dominio.`
    };
  }

  return { isValid: true, message: null };
};

/**
 * Realiza todas las comprobaciones de seguridad para la contraseña del login.
 */
export const validateLoginPassword = (password: string): ValidationResult => {
  if (password.length !== 12) {
    return { isValid: false, message: "La contraseña debe tener exactamente 12 caracteres." };
  }

  if (containsEmojis(password)) {
    return { isValid: false, message: "La contraseña no puede contener emojis." };
  }

  if (!VALID_CHARS_REGEX.test(password)) {
    return {
      isValid: false,
      message: "La contraseña contiene caracteres no permitidos (solo letras, números o símbolos comunes)."
    };
  }

  return { isValid: true, message: null };
};