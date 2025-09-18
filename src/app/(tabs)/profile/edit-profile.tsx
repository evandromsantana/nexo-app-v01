import { COLORS } from "@/constants";
import { TaughtSkill, UserProfile } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { uploadImage } from "../../../api/cloudinary";
import { getUserProfile, updateUserProfile } from "../../../api/firestore";
import ProfileImagePicker from "../../../components/app/profile/ProfileImagePicker";
import ProfileInputField from "../../../components/app/profile/ProfileInputField";
import ProfileSaveButton from "../../../components/app/profile/ProfileSaveButton";
import SkillsToTeachEditor from "../../../components/app/profile/SkillsToTeachEditor";
import { useAuth } from "../../../hooks/useAuth";

interface EditableTaughtSkill {
  skillName: string;
  multiplier: string;
}

const EditProfileScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [skillsToTeach, setSkillsToTeach] = useState<EditableTaughtSkill[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  // 1. Query to fetch existing profile data
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: !!user,
  });

  // Effect to populate form when query data is loaded
  useEffect(() => {
    if (profileData) {
      setDisplayName(profileData.displayName || "");
      setBio(profileData.bio || "");
      setSkillsToTeach(
        (profileData.skillsToTeach || []).map((skill) => ({
          ...skill,
          multiplier: String(skill.multiplier),
        }))
      );
      setSkillsToLearn(profileData.skillsToLearn?.join(", ") || "");
      setImageUri(profileData.photoUrl || null);
    }
  }, [profileData]);

  // 2. Mutation to update the profile
  const { mutate: update, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!displayName || !user) {
        throw new Error("O nome é obrigatório.");
      }

      const skillsToSave: TaughtSkill[] = [];
      for (const taughtSkill of skillsToTeach) {
        if (!taughtSkill.skillName.trim()) continue; // Ignore empty skills
        const finalMultiplier = parseFloat(taughtSkill.multiplier);
        if (isNaN(finalMultiplier) || finalMultiplier <= 0) {
          throw new Error(
            `O multiplicador "${taughtSkill.multiplier}" para "${taughtSkill.skillName}" é inválido.`
          );
        }
        skillsToSave.push({
          skillName: taughtSkill.skillName.trim(),
          multiplier: finalMultiplier,
        });
      }

      let photoUrl: string | null = imageUri;
      if (imageUri && imageUri.startsWith("file://")) {
        photoUrl = await uploadImage(imageUri);
      }

      const updatedData: Partial<UserProfile> = {
        displayName,
        bio,
        skillsToTeach: skillsToSave,
        skillsToLearn: skillsToLearn.split(",").map((s) => s.trim()).filter(Boolean),
        photoUrl,
      };

      await updateUserProfile(user.uid, updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.uid] });
      Alert.alert("Sucesso", "Perfil atualizado!");
      router.back();
    },
    onError: (error) => {
      console.error("Erro ao atualizar o perfil:", error);
      Alert.alert("Erro", error.message || "Não foi possível atualizar o seu perfil.");
    },
  });

  // --- Form handlers ---
  const handleAddSkill = () => setSkillsToTeach([...skillsToTeach, { skillName: "", multiplier: "1.0" }]);
  const handleRemoveSkill = (index: number) => setSkillsToTeach(skillsToTeach.filter((_, i) => i !== index));
  const handleSkillChange = (index: number, field: "skillName" | "multiplier", value: string) => {
    const updatedSkills = [...skillsToTeach];
    updatedSkills[index][field] = value;
    setSkillsToTeach(updatedSkills);
  };
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  if (isProfileLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <ProfileImagePicker imageUri={imageUri} onPickImage={handlePickImage} />
      <ProfileInputField label="Nome" value={displayName} onChangeText={setDisplayName} />
      <ProfileInputField label="Sobre mim" value={bio} onChangeText={setBio} multiline textArea />
      <SkillsToTeachEditor
        skillsToTeach={skillsToTeach}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
        onSkillChange={handleSkillChange}
      />
      <ProfileInputField
        label="Habilidades que quero aprender"
        placeholder="Separadas por vírgula"
        value={skillsToLearn}
        onChangeText={setSkillsToLearn}
      />
      <ProfileSaveButton isSubmitting={isSubmitting} onPress={() => update()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background || "#f5f5f5" },
});

export default EditProfileScreen;
