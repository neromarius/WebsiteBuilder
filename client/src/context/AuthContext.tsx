import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isPending: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  location?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  // Query current user
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string, password: string }) => {
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Autentificare reușită",
        description: "Bine ai revenit!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare de autentificare",
        description: error.message || "Numele de utilizator sau parola sunt incorecte.",
        variant: "destructive",
      });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Înregistrare reușită",
        description: "Contul tău a fost creat cu succes!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare la înregistrare",
        description: error.message || "Nu am putut crea contul. Încearcă din nou.",
        variant: "destructive",
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Deconectare reușită",
        description: "Te-ai deconectat cu succes.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare la deconectare",
        description: error.message || "A apărut o eroare la deconectare.",
        variant: "destructive",
      });
    }
  });

  const login = async (username: string, password: string) => {
    setIsPending(true);
    try {
      await loginMutation.mutateAsync({ username, password });
    } finally {
      setIsPending(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsPending(true);
    try {
      await registerMutation.mutateAsync(userData);
    } finally {
      setIsPending(false);
    }
  };

  const logout = async () => {
    setIsPending(true);
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isPending: isPending || isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
