'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { UserProfile, UserSession } from '@/lib/types/user';
import {
  fetchCurrentUserApi,
  logoutUserApi,
  trackCommodityHitApi,
} from '@/lib/api/user-auth.api';

export const USER_SESSION_STORAGE_KEY = 'pasarku_user_session_v1';

interface UserAuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthLoaded: boolean;
  setSession: (session: UserSession) => void;
  updateUserState: (user: UserProfile) => void;
  refreshUser: () => Promise<void>;
  logoutUser: () => Promise<void>;
  trackCommodityQuery: (commoditySlug: string) => void;
  getAuthHeaders: () => Record<string, string>;
}

const UserAuthContext = createContext<UserAuthContextValue | null>(null);

function readStoredSession(): UserSession | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserSession;
    if (!parsed?.user?.id || !parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(USER_SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredSession(session: UserSession | null): void {
  try {
    if (typeof window === 'undefined') return;
    if (!session) {
      localStorage.removeItem(USER_SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
  }
}

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  const setSession = useCallback((session: UserSession) => {
    setUser(session.user);
    setToken(session.token);
    setExpiresAt(session.expiresAt);
    writeStoredSession(session);
  }, []);

  const updateUserState = useCallback(
    (nextUser: UserProfile) => {
      setUser(nextUser);
      if (token) {
        writeStoredSession({
          token,
          user: nextUser,
          expiresAt: expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
      }
    },
    [token, expiresAt]
  );

  const refreshUser = useCallback(async () => {
    const stored = readStoredSession();
    const activeToken = token || stored?.token || null;
    try {
      const json = await fetchCurrentUserApi(activeToken);
      if (json.success && json.data?.user) {
        setUser(json.data.user);
        setExpiresAt(json.data.expiresAt);
        if (activeToken) {
          setToken(activeToken);
          writeStoredSession({
            token: activeToken,
            user: json.data.user,
            expiresAt: json.data.expiresAt,
          });
        }
        return;
      }
    } catch {
    }

    if (stored) {
      setUser(stored.user);
      setToken(stored.token);
      setExpiresAt(stored.expiresAt);
    } else {
      setUser(null);
      setToken(null);
      setExpiresAt(0);
    }
  }, [token]);

  useEffect(() => {
    let active = true;
    const stored = readStoredSession();
    if (stored) {
      setUser(stored.user);
      setToken(stored.token);
      setExpiresAt(stored.expiresAt);
    }

    fetchCurrentUserApi(stored?.token || null)
      .then((json) => {
        if (!active) return;
        if (json.success && json.data?.user) {
          setUser(json.data.user);
          setExpiresAt(json.data.expiresAt);
          if (stored?.token) {
            writeStoredSession({
              token: stored.token,
              user: json.data.user,
              expiresAt: json.data.expiresAt,
            });
          }
        } else if (!stored) {
          setUser(null);
          setToken(null);
        }
      })
      .catch(() => {
      })
      .finally(() => {
        if (active) setIsAuthLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const logoutUser = useCallback(async () => {
    await logoutUserApi();
    setUser(null);
    setToken(null);
    setExpiresAt(0);
    writeStoredSession(null);
  }, []);

  const trackCommodityQuery = useCallback(
    (commoditySlug: string) => {
      const clean = commoditySlug.trim().toLowerCase();
      if (!user || !clean) return;
      const nextFreq = {
        ...user.frequentCommodities,
        [clean]: (user.frequentCommodities[clean] || 0) + 1,
      };
      updateUserState({ ...user, frequentCommodities: nextFreq });
      void trackCommodityHitApi(clean, token).catch(() => {});
    },
    [user, token, updateUserState]
  );

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const value = useMemo<UserAuthContextValue>(
    () => ({
      user,
      token,
      isAuthLoaded,
      setSession,
      updateUserState,
      refreshUser,
      logoutUser,
      trackCommodityQuery,
      getAuthHeaders,
    }),
    [
      user,
      token,
      isAuthLoaded,
      setSession,
      updateUserState,
      refreshUser,
      logoutUser,
      trackCommodityQuery,
      getAuthHeaders,
    ]
  );

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
}

export function useUserAuth(): UserAuthContextValue {
  const ctx = useContext(UserAuthContext);
  if (!ctx) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return ctx;
}
