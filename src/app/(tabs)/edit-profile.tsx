import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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
} from "react-native";
import { uploadImage } from "../../api/cloudinary";
import { getUserProfile, updateUserProfile } from "../../api/firestore";
import { COLORS } from "../../constants/colors";
import { useAuth } from "../../hooks/useAuth";
import { UserProfile } from "../../types/user";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const currentProfile = await getUserProfile(user.uid);
          if (currentProfile) setProfile(currentProfile);
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

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    setIsUploading(true);

    try {
      let imageUrl = profile.photoUrl;
      if (newImage) imageUrl = await uploadImage(newImage);

      // Corrige tipagem e divide strings em arrays
      const skillsToTeach: string[] =
        typeof profile.skillsToTeach === "string"
          ? profile.skillsToTeach.split(",").map((s: string) => s.trim())
          : Array.isArray(profile.skillsToTeach)
          ? profile.skillsToTeach
          : [];

      const skillsToLearn: string[] =
        typeof profile.skillsToLearn === "string"
          ? profile.skillsToLearn.split(",").map((s: string) => s.trim())
          : Array.isArray(profile.skillsToLearn)
          ? profile.skillsToLearn
          : [];

      const dataToUpdate: Partial<UserProfile> = {
        displayName: profile.displayName,
        bio: profile.bio,
        photoUrl: imageUrl,
        skillsToTeach,
        skillsToLearn,
      };

      await updateUserProfile(user.uid, dataToUpdate);
      router.back();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        style={styles.centered}
        size="large"
        color={COLORS.primary}
      />
    );
  }

  const photoSource = newImage
    ? { uri: newImage }
    : profile.photoUrl
    ? { uri: profile.photoUrl }
    : undefined;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Editar Perfil</Text>

      {/* Avatar */}
      <Image source={photoSource} style={styles.avatar} />
      <Pressable onPress={pickImage}>
        <Text style={styles.changePhotoText}>Alterar Foto</Text>
      </Pressable>

      {/* Nome */}
      <Text style={styles.label}>Nome de Exibição</Text>
      <TextInput
        style={styles.input}
        value={profile.displayName || ""}
        onChangeText={(text) =>
          setProfile((p) => ({ ...p, displayName: text }))
        }
        placeholder="Digite seu nome"
        placeholderTextColor={COLORS.grayDark + "99"}
      />

      {/* Bio */}
      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={profile.bio || ""}
        onChangeText={(text) => setProfile((p) => ({ ...p, bio: text }))}
        multiline
        placeholder="Escreva algo sobre você"
        placeholderTextColor={COLORS.grayDark + "99"}
      />

      {/* Skills to teach */}
      <Text style={styles.label}>
        Habilidades para Ensinar (separadas por vírgula)
      </Text>
      <TextInput
        style={styles.input}
        value={
          Array.isArray(profile.skillsToTeach)
            ? profile.skillsToTeach.join(", ")
            : ""
        }
        onChangeText={(text) =>
          setProfile((p) => ({ ...p, skillsToTeach: text as any }))
        }
        placeholder="Ex.: Fotografia, Programação"
        placeholderTextColor={COLORS.grayDark + "99"}
      />

      {/* Skills to learn */}
      <Text style={styles.label}>
        Habilidades para Aprender (separadas por vírgula)
      </Text>
      <TextInput
        style={styles.input}
        value={
          Array.isArray(profile.skillsToLearn)
            ? profile.skillsToLearn.join(", ")
            : ""
        }
        onChangeText={(text) =>
          setProfile((p) => ({ ...p, skillsToLearn: text as any }))
        }
        placeholder="Ex.: Inglês, Culinária"
        placeholderTextColor={COLORS.grayDark + "99"}
      />

      {/* Botão Salvar */}
      {isUploading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Salvar Alterações</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { alignItems: "center", padding: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
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
  changePhotoText: { color: COLORS.primary, fontSize: 16, marginBottom: 20 },

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
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 15,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
});
