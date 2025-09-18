import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { Platform } from "react-native";
import { auth } from "../api/firebase";
import { createUserProfile } from "../api/firestore";

type User = FirebaseUser;

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  authError: Error | null;
  isLoggingIn: boolean;
  isRegistering: boolean;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setAuthError(error);
      throw error; // Re-throw to allow components to handle it
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error: any) {
      setAuthError(error);
      throw error; // Re-throw to allow components to handle it
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    setAuthError(null);
    setIsRegistering(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await createUserProfile(userCredential.user, displayName);
    } catch (error: any) {
      setAuthError(error);
      throw error; // Re-throw to allow components to handle it
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        authError,
        isLoggingIn,
        isRegistering,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
