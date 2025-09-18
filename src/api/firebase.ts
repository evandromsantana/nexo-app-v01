// Imports atualizados para incluir persistência
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Importamos o AsyncStorage
import { initializeApp } from 'firebase/app';
import {
  getReactNativePersistence,
  initializeAuth
} from 'firebase/auth'; // Trocamos getAuth por initializeAuth

// Sua configuração do Firebase (continua a mesma)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa o Firebase (continua o mesmo)
const app = initializeApp(firebaseConfig);

// ✅ CORREÇÃO: Inicializa o Firebase Auth com persistência para React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Exporta a instância do auth
export { auth };
