import Cookies from 'js-cookie';

interface JwtPayload {
  id: number;
  username: string;
  role: 'laboran' | 'asisten';
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token payload tanpa verifikasi signature (client-side only).
 * Hanya untuk keperluan UI — validasi tetap dilakukan di server.
 */
export function decodeToken(): JwtPayload | null {
  try {
    const token = Cookies.get('token');
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function getUserRole(): 'laboran' | 'asisten' | null {
  return decodeToken()?.role ?? null;
}

export function isLaboran(): boolean {
  return getUserRole() === 'laboran';
}

export function isAsisten(): boolean {
  return getUserRole() === 'asisten';
}

/** True untuk semua role yang terautentikasi */
export function isAuthenticated(): boolean {
  return decodeToken() !== null;
}
