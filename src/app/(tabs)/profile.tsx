import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../api/firestore';
import { UserProfile } from '../../types/user';
import { COLORS } from '../../constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          setIsLoading(true);
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{userProfile?.displayName || 'Usuário'}</Text>
      <Text style={styles.email}>{userProfile?.email}</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Saldo de Tempo</Text>
        <Text style={styles.infoContent}>{userProfile?.timeBalance || 0} minutos</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Bio</Text>
        <Text style={styles.infoContent}>{userProfile?.bio || 'Nenhuma bio definida.'}</Text>
      </View>
      
      <Link href="/edit-profile" asChild>
        <Button title="Editar Perfil" />
      </Link>

      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={logout} color={COLORS.accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 20,
  },
  email: {
    fontSize: 16,
    color: COLORS.grayDark,
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: COLORS.white,
    width: '100%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 14,
    color: COLORS.grayDark,
    fontWeight: 'bold',
  },
  infoContent: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 5,
  },
  logoutButtonContainer: {
    marginTop: 30,
    width: '80%',
  }
});
