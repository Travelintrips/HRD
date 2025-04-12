import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, AuthError } from "@supabase/supabase-js";
import {
  getSession,
  getUser,
  signIn,
  signOut,
  signUp,
  supabase,
} from "@/lib/supabaseClient";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    data: any;
    error: AuthError | null;
  }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    data: any;
    error: AuthError | null;
  }>;
  signOut: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        // Check if there's an active session
        const { data: sessionData, error: sessionError } = await getSession();

        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          setError(sessionError.message);
          setIsLoading(false);
          return;
        }

        if (sessionData?.session) {
          // If there's a session, get the user
          const { user: userData, error: userError } = await getUser();

          if (userError) {
            console.error("Error fetching user:", userError);
            setError(userError.message);
            setIsLoading(false);
            return;
          }

          setUser(userData);
        }
      } catch (err) {
        console.error("Unexpected error in auth context:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      },
    );

    // Clean up the subscription
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
