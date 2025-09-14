import React, { useState, useEffect } from 'react';
import { View, Button, Text, TextInput, StyleSheet, ActivityIndicator, ScrollView, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../../api/firestore';
import { UserProfile } from '../../types/user';
import { COLORS } from '../../constants/colors';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [newImage, setNewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const currentProfile = await getUserProfile(user.uid);
          if (currentProfile) {
            setProfile(currentProfile);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    try {
      // TODO: Upload newImage to Cloudinary and get URL

      const dataToUpdate = { ...profile };
      // if (newImageUrl) {
      //   dataToUpdate.photoUrl = newImageUrl;
      // }

      await updateUserProfile(user.uid, dataToUpdate);
      router.back();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} size="large" color={COLORS.primary} />;
  }

  const photoSource = newImage ? { uri: newImage } : (profile.photoUrl ? { uri: profile.photoUrl } : require('../../assets/images/default-avatar.png'));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Editar Perfil</Text>
      
      <Image source={photoSource} style={styles.avatar} />
      <Pressable onPress={pickImage}>
        <Text style={styles.changePhotoText}>Alterar Foto</Text>
      </Pressable>

      <Text style={styles.label}>Nome de Exibição</Text>
      <TextInput
        style={styles.input}
        value={profile.displayName || ''}
        onChangeText={(text) => setProfile(p => ({ ...p, displayName: text }))}
      />

      {/* ... other fields ... */}

      <Button title="Salvar Alterações" onPress={handleUpdate} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { alignItems: 'center', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 10, backgroundColor: '#e0e0e0' },
  changePhotoText: { color: COLORS.primary, fontSize: 16, marginBottom: 20 },
  label: { fontSize: 16, color: COLORS.grayDark, marginBottom: 5, alignSelf: 'flex-start' },
  input: { width: '100%', minHeight: 50, backgroundColor: COLORS.white, borderRadius: 10, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
});