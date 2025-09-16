import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { uploadImage } from "@/api/cloudinary";
import { getUserProfile, updateUserProfile } from "@/api/firestore";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types/user";

interface ProfileFormData {
  displayName: string;
  bio: string;
  photoUrl: string | null;
  skillsToTeach: string;
  skillsToLearn: string;
}

export default function EditProfileModal() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          setIsLoading(true);
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setFormData({
              displayName: profile.displayName || "",
              bio: profile.bio || "",
              photoUrl: profile.photoUrl,
              skillsToTeach: profile.skillsToTeach?.join(", ") || "",
              skillsToLearn: profile.skillsToLearn?.join(", ") || "",
            });
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setNewImage(result.assets[0].uri);
  };

  const handleUpdate = async () => {
    if (!user || !formData) return;
    setIsUploading(true);

    try {
      let imageUrl = formData.photoUrl;
      if (newImage) imageUrl = await uploadImage(newImage);

      const skillsToTeach = formData.skillsToTeach
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const skillsToLearn = formData.skillsToLearn
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const dataToUpdate: Partial<UserProfile> = {
        displayName: formData.displayName,
        bio: formData.bio,
        photoUrl: imageUrl,
        skillsToTeach,
        skillsToLearn,
      };

      await updateUserProfile(user.uid, dataToUpdate);
      router.back(); // Go back to the profile screen
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || !formData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Image
            source={
              newImage
                ? { uri: newImage }
                : formData.photoUrl
                ? { uri: formData.photoUrl }
                : undefined
            }
            style={styles.avatar}
          />
          <Pressable onPress={pickImage}>
            <Text style={styles.changePhotoText}>Alterar Foto</Text>
          </Pressable>

          <Text style={styles.label}>Nome de Exibição</Text>
          <TextInput
            style={styles.input}
            value={formData.displayName}
            onChangeText={(text) =>
              setFormData((p) => (p ? { ...p, displayName: text } : null))
            }
            placeholder="Digite seu nome"
            placeholderTextColor={COLORS.grayDark + "99"}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(text) =>
              setFormData((p) => (p ? { ...p, bio: text } : null))
            }
            multiline
            placeholder="Escreva algo sobre você"
            placeholderTextColor={COLORS.grayDark + "99"}
          />

          <Text style={styles.label}>
            Habilidades para Ensinar (separadas por vírgula)
          </Text>
          <TextInput
            style={styles.input}
            value={formData.skillsToTeach}
            onChangeText={(text) =>
              setFormData((p) => (p ? { ...p, skillsToTeach: text } : null))
            }
            placeholder="Ex.: Fotografia, Programação"
            placeholderTextColor={COLORS.grayDark + "99"}
          />

          <Text style={styles.label}>
            Habilidades para Aprender (separadas por vírgula)
          </Text>
          <TextInput
            style={styles.input}
            value={formData.skillsToLearn}
            onChangeText={(text) =>
              setFormData((p) => (p ? { ...p, skillsToLearn: text } : null))
            }
            placeholder="Ex.: Inglês, Culinária"
            placeholderTextColor={COLORS.grayDark + "99"}
          />

          {isUploading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  card: {
    width: "95%",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold" as any,
    color: COLORS.primary,
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    backgroundColor: COLORS.grayLight,
  },
  changePhotoText: {
    color: COLORS.primary,
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: COLORS.grayDark,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    minHeight: 50,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    color: COLORS.grayDark,
  },
  textArea: { height: 100, textAlignVertical: "top", paddingVertical: 15 },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 15,
  },
  buttonText: { color: COLORS.white, fontWeight: "bold" as any, fontSize: 16 },
});
