/**
 * Métodos de seguridad y validación para el sistema
 */

// Regex para detectar cualquier emoji en el texto
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/u;

// Regex para caracteres permitidos (Letras, números y símbolos comunes)
const VALID_CHARS_REGEX = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;

interface ValidationResult {
  isValid: boolean;
  message: string | null;
}

/**
 * Valida si una cadena contiene emojis.
 * @param text Texto a evaluar
 * @returns true si contiene emojis, false si está limpio
 */
export const containsEmojis = (text: string): boolean => {
  return EMOJI_REGEX.test(text);
};

/**
 * Realiza todas las comprobaciones de seguridad para la contraseña del login.
 * @param password Contraseña en texto plano a validar
 * @returns Un objeto indicando si es válida y el mensaje de error correspondiente
 */
export const validateLoginPassword = (password: string): ValidationResult => {
  // 1. Validar longitud exacta
  if (password.length !== 12) {
    return {
      isValid: false,
      message: "La contraseña debe tener exactamente 12 caracteres."
    };
  }

  // 2. Validar que no tenga emojis (doble check de seguridad)
  if (containsEmojis(password)) {
    return {
      isValid: false,
      message: "La contraseña no puede contener emojis."
    };
  }

  // 3. Validar tipo de caracteres (sin obligar símbolos, pero restringiendo a los seguros)
  if (!VALID_CHARS_REGEX.test(password)) {
    return {
      isValid: false,
      message: "La contraseña contiene caracteres no permitidos (solo letras, números o símbolos comunes)."
    };
  }

  return {
    isValid: true,
    message: null
  };
};