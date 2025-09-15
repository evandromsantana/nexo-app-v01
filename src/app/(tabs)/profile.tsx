import * as ImagePicker from "expo-image-picker";
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
import { uploadImage } from "../../api/cloudinary";
import { getUserProfile, updateUserProfile } from "../../api/firestore";
import { COLORS } from "../../constants/colors";
import { useAuth } from "../../hooks/useAuth";
import { UserProfile } from "../../types/user";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal de edição
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<Partial<UserProfile>>({});
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setNewImage(result.assets[0].uri);
  };

  const openEditModal = () => {
    setEditProfile(userProfile || {});
    setNewImage(null);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!user) return;
    setIsUploading(true);

    try {
      let imageUrl = editProfile.photoUrl;
      if (newImage) imageUrl = await uploadImage(newImage);

      const skillsToTeach: string[] =
        typeof editProfile.skillsToTeach === "string"
          ? editProfile.skillsToTeach.split(",").map((s) => s.trim())
          : Array.isArray(editProfile.skillsToTeach)
          ? editProfile.skillsToTeach
          : [];

      const skillsToLearn: string[] =
        typeof editProfile.skillsToLearn === "string"
          ? editProfile.skillsToLearn.split(",").map((s) => s.trim())
          : Array.isArray(editProfile.skillsToLearn)
          ? editProfile.skillsToLearn
          : [];

      const dataToUpdate: Partial<UserProfile> = {
        displayName: editProfile.displayName,
        bio: editProfile.bio,
        photoUrl: imageUrl,
        skillsToTeach,
        skillsToLearn,
      };

      await updateUserProfile(user.uid, dataToUpdate);
      setUserProfile((prev) => ({ ...prev, ...dataToUpdate }));
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.name}>{userProfile?.displayName || "Usuário"}</Text>
        <Text style={styles.email}>{userProfile?.email}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Saldo de Tempo</Text>
          <Text style={styles.infoContent}>
            {userProfile?.timeBalance || 0} minutos
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Bio</Text>
          <Text style={styles.infoContent}>
            {userProfile?.bio || "Nenhuma bio definida."}
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={openEditModal}>
          <Text style={styles.buttonText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Edit Profile */}
      {isEditOpen && (
        <View style={styles.overlay}>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Pressable
                style={styles.closeButton}
                onPress={() => setIsEditOpen(false)}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>

              <Text style={styles.title}>Editar Perfil</Text>

              <Image
                source={
                  newImage
                    ? { uri: newImage }
                    : editProfile.photoUrl
                    ? { uri: editProfile.photoUrl }
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
                value={editProfile.displayName || ""}
                onChangeText={(text) =>
                  setEditProfile((p) => ({ ...p, displayName: text }))
                }
                placeholder="Digite seu nome"
                placeholderTextColor={COLORS.grayDark + "99"}
              />

              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editProfile.bio || ""}
                onChangeText={(text) =>
                  setEditProfile((p) => ({ ...p, bio: text }))
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
                value={
                  Array.isArray(editProfile.skillsToTeach)
                    ? editProfile.skillsToTeach.join(", ")
                    : ""
                }
                onChangeText={(text) =>
                  setEditProfile((p) => ({ ...p, skillsToTeach: text as any }))
                }
                placeholder="Ex.: Fotografia, Programação"
                placeholderTextColor={COLORS.grayDark + "99"}
              />

              <Text style={styles.label}>
                Habilidades para Aprender (separadas por vírgula)
              </Text>
              <TextInput
                style={styles.input}
                value={
                  Array.isArray(editProfile.skillsToLearn)
                    ? editProfile.skillsToLearn.join(", ")
                    : ""
                }
                onChangeText={(text) =>
                  setEditProfile((p) => ({ ...p, skillsToLearn: text as any }))
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold" as any,
    color: COLORS.primary,
    marginTop: 20,
  },
  email: {
    fontSize: 16,
    color: COLORS.grayDark,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: COLORS.card,
    width: "100%",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold" as any,
    color: COLORS.grayDark,
  },
  infoContent: { fontSize: 16, color: COLORS.primary, marginTop: 5 },
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
  logoutButton: { backgroundColor: COLORS.accent },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "95%", // antes estava 90%
    marginHorizontal: 0, // remove margens laterais
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeText: { fontSize: 20, color: COLORS.grayDark },
  title: {
    fontSize: 26,
    fontWeight: "bold" as any,
    color: COLORS.primary,
    marginBottom: 20,
    alignSelf: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    backgroundColor: COLORS.grayLight,
    alignSelf: "center",
  },
  changePhotoText: {
    color: COLORS.primary,
    fontSize: 16,
    marginBottom: 20,
    alignSelf: "center",
  },
  label: { fontSize: 16, color: COLORS.grayDark, marginBottom: 5 },
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
});
