import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  getReactNativePersistence,
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

  useEffect(() => {
    const setupPersistence = async () => {
      if (Platform.OS === "web") {
        await setPersistence(auth, browserLocalPersistence);
      } else {
        await setPersistence(
          auth,
          getReactNativePersistence(ReactNativeAsyncStorage)
        );
      }
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setIsLoading(false);
      });
      return () => unsubscribe();
    };

    setupPersistence();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await createUserProfile(userCredential.user, displayName);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
