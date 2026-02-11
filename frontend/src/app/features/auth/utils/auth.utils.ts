/**
 * Auth Utilities
 * Helper functions for common auth operations
 */

export function parseToken(rawToken: string): string {
  const parts = rawToken.split('|');
  return parts.length === 2 ? parts[1] : rawToken;
}


export function isTokenExpired(tokenTimestamp: number, expiryHours: number = 24): boolean {
  const now = Date.now();
  const expiryMs = expiryHours * 60 * 60 * 1000;
  return (now - tokenTimestamp) > expiryMs;
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function formatUserName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak';
  
  let strength = 0;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 1) return 'weak';
  if (strength <= 2) return 'medium';
  return 'strong';
}
