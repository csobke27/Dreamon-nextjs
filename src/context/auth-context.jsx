"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

const AuthContext = createContext(undefined);

const REMEMBER_ME_KEY = "dreamon_remember_me";
const SESSION_MARKER_KEY = "dreamon_session_marker";

export function AuthProvider({ children }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadRole(userId) {
    if (!userId) {
      setRole(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    setRole(data?.role ?? "user");
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();

      // If the user chose not to be remembered and the browser (not just the
      // tab) was closed since then, sessionStorage is empty again: sign out.
      const rememberMe = window.localStorage.getItem(REMEMBER_ME_KEY);
      const hasSessionMarker = window.sessionStorage.getItem(SESSION_MARKER_KEY);
      if (data.user && rememberMe === "false" && !hasSessionMarker) {
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      if (data.user) {
        window.sessionStorage.setItem(SESSION_MARKER_KEY, "1");
      }
      setUser(data.user ?? null);
      await loadRole(data.user?.id);
      setLoading(false);
    }

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        await loadRole(session?.user?.id);
        setLoading(false);
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, [supabase]);

  async function signIn(email, password, rememberMe) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      window.localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? "true" : "false");
      window.sessionStorage.setItem(SESSION_MARKER_KEY, "1");
      setUser(data.user);
      await loadRole(data.user?.id);
    }

    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.localStorage.removeItem(REMEMBER_ME_KEY);
    window.sessionStorage.removeItem(SESSION_MARKER_KEY);
    setUser(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
