"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { googleClientId } from "@/lib/firebase/public-config";

const SESSION_KEY = "easeitr-google-session";

export interface SignedInUser {
  uid: string;
  email: string | null;
  getIdToken: () => Promise<string>;
}

interface AuthContextValue {
  user: SignedInUser | null;
  ready: boolean;
  signIn: () => Promise<SignedInUser | null>;
  signOutUser: () => Promise<void>;
}

interface StoredSession {
  accessToken: string;
  expiresAt: number;
  email: string | null;
  uid: string;
}

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: () => void;
          }) => GoogleTokenClient;
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

const signedOut: AuthContextValue = {
  user: null,
  ready: true,
  signIn: async () => null,
  signOutUser: async () => undefined,
};

const AuthContext = createContext<AuthContextValue>(signedOut);

function readSession(): StoredSession | null {
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as StoredSession;
    if (!session.accessToken || !session.uid || session.expiresAt < Date.now()) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function toUser(session: StoredSession): SignedInUser {
  return {
    uid: session.uid,
    email: session.email,
    getIdToken: async () => {
      if (session.expiresAt < Date.now()) throw new Error("Sign in again to continue.");
      return session.accessToken;
    },
  };
}

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-easeitr-gis]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google sign-in could not be loaded.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.dataset.easeitrGis = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google sign-in could not be loaded."));
    document.head.appendChild(script);
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadGoogleScript().catch(() => undefined);
    const session = readSession();
    const handle = window.setTimeout(() => {
      if (session) setUser(toUser(session));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      signIn: async () => {
        await loadGoogleScript();
        const oauth = window.google?.accounts.oauth2;
        if (!oauth) throw new Error("Google sign-in could not be loaded.");
        const session = await new Promise<StoredSession>((resolve, reject) => {
          const client = oauth.initTokenClient({
            client_id: googleClientId,
            scope: "openid email profile",
            callback: (response) => {
              void (async () => {
                if (!response.access_token) {
                  reject(new Error("Google sign-in did not finish."));
                  return;
                }
                const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${response.access_token}` },
                });
                if (!profileResponse.ok) {
                  reject(new Error("Google sign-in did not finish."));
                  return;
                }
                const profile = (await profileResponse.json()) as { sub?: string; email?: string };
                if (!profile.sub) {
                  reject(new Error("Google sign-in did not finish."));
                  return;
                }
                resolve({
                  accessToken: response.access_token,
                  expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
                  email: profile.email ?? null,
                  uid: profile.sub,
                });
              })().catch(() => reject(new Error("Google sign-in did not finish.")));
            },
            error_callback: () => reject(new Error("Google sign-in did not finish.")),
          });
          client.requestAccessToken({ prompt: "select_account" });
        });
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        const next = toUser(session);
        setUser(next);
        return next;
      },
      signOutUser: async () => {
        const session = readSession();
        window.sessionStorage.removeItem(SESSION_KEY);
        setUser(null);
        if (session && window.google?.accounts.oauth2) {
          window.google.accounts.oauth2.revoke(session.accessToken, () => undefined);
        }
      },
    }),
    [ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
