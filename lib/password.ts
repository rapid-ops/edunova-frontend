export function passwordError(p: string): string | null {
  if (p.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return 'Password must include a letter and a number';
  return null;
}

export function passwordStrength(p: string): 0 | 1 | 2 | 3 {
  if (!p) return 0;
  if (passwordError(p)) return 1;
  const mixed = /[A-Z]/.test(p) && /[a-z]/.test(p) && /[^A-Za-z0-9]/.test(p);
  return p.length >= 12 || mixed ? 3 : 2;
}
