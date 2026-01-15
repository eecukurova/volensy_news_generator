import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'volensy_session';
const SESSION_SECRET = 'volensy-secret-key-change-in-production';

export interface SessionData {
  username: string;
  authenticated: boolean;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);
    if (sessionData.authenticated && sessionData.username) {
      return sessionData;
    }
  } catch (error) {
    return null;
  }

  return null;
}

export async function createSession(username: string): Promise<void> {
  const cookieStore = await cookies();
  const sessionData: SessionData = {
    username,
    authenticated: true,
  };

  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session?.authenticated === true;
}
