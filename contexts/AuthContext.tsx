'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, type UserSettings } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  settings: UserSettings | null;
  authLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const settingsLoaded = useRef<string | null>(null);

  const loadSettings = useCallback(async (userId: string) => {
    if (settingsLoaded.current === userId) return;
    settingsLoaded.current = userId;
    const { data } = await supabase
      .from('user_settings')
      .select('youtube_api_key, default_region, fetch_count')
      .eq('user_id', userId)
      .single();
    if (data) setSettings(data as UserSettings);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadSettings(session.user.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSettings(session.user.id);
      } else {
        setSettings(null);
        settingsLoaded.current = null;
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadSettings]);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return { error: '로그인이 필요합니다.' };
    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });
    if (!error) setSettings((prev) => ({ ...({ youtube_api_key: '', default_region: 'KR', fetch_count: 100 }), ...prev, ...updates }));
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider value={{
      user, session, settings, authLoading,
      signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, updateSettings,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
