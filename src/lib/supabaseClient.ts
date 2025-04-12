import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("Sign in response:", { data, error });
    return { data, error };
  } catch (e) {
    console.error("Sign in error:", e);
    return { data: null, error: e as any };
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    console.log("Sign up response:", { data, error });
    return { data, error };
  } catch (e) {
    console.error("Sign up error:", e);
    return { data: null, error: e as any };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    console.log("Sign out response:", { error });
    return { error };
  } catch (e) {
    console.error("Sign out error:", e);
    return { error: e as any };
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

export async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}
