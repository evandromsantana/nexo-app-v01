import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS } from "@/constants";
import { uploadImage } from "../../../api/cloudinary";
import { getUserProfile, updateUserProfile } from "../../../api/firestore";
import { useAuth } from "../../../hooks/useAuth";
import { TaughtSkill, UserProfile } from "../../../types/user";
import ProfileImagePicker from "../../../components/app/profile/ProfileImagePicker";
import ProfileInputField from "../../../components/app/profile/ProfileInputField";
import SkillsToTeachEditor from "../../../components/app/profile/SkillsToTeachEditor";
import ProfileSaveButton from "../../../components/app/profile/ProfileSaveButton";

// Use a local interface for the form state to handle the multiplier as a string
interface EditableTaughtSkill {
  skillName: string;
  multiplier: string;
}

const EditProfileScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  // State for the form data
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [skillsToTeach, setSkillsToTeach] = useState<EditableTaughtSkill[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  // State for loading and submitting
  const [isLoading, setIsLoading] = useState(true); // For initial profile load
  const [isSubmitting, setIsSubmitting] = useState(false); // For submission process

  // Fetch profile data on component mount
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setDisplayName(profile.displayName || "");
            setBio(profile.bio || "");
            // Convert the numeric multiplier to a string for the form state
            setSkillsToTeach(
              (profile.skillsToTeach || []).map((skill) => ({
                ...skill,
                multiplier: String(skill.multiplier),
              }))
            );
            setSkillsToLearn(profile.skillsToLearn?.join(", ") || "");
            setImageUri(profile.photoUrl || null);
          }
        } catch (error) {
          console.error("Failed to fetch profile for editing:", error);
          Alert.alert(
            "Erro",
            "Não foi possível carregar seu perfil para edição."
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleAddSkill = () => {
    setSkillsToTeach([...skillsToTeach, { skillName: "", multiplier: "1.0" }]);
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...skillsToTeach];
    updatedSkills.splice(index, 1);
    setSkillsToTeach(updatedSkills);
  };

  const handleSkillChange = (
    index: number,
    field: "skillName" | "multiplier",
    value: string
  ) => {
    const updatedSkills = [...skillsToTeach];
    if (field === "multiplier") {
      // Allow only valid characters for a float number
      const sanitizedValue = value.replace(/[^0-9.,]/g, "").replace(",", ".");
      updatedSkills[index][field] = sanitizedValue;
    } else {
      updatedSkills[index][field] = value;
    }
    setSkillsToTeach(updatedSkills);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!displayName || !user) {
      Alert.alert("Erro", "O nome é obrigatório.");
      return;
    }

    const skillsToSave: TaughtSkill[] = [];
    // Validate and convert skills back to the correct numeric type before saving
    for (const taughtSkill of skillsToTeach) {
      if (!taughtSkill.skillName.trim()) {
        Alert.alert("Erro", "O nome de uma das habilidades está vazio.");
        return;
      }
      const finalMultiplier = parseFloat(taughtSkill.multiplier);
      if (isNaN(finalMultiplier) || finalMultiplier <= 0) {
        Alert.alert(
          "Erro",
          `O multiplicador "${taughtSkill.multiplier}" para "${taughtSkill.skillName}" é inválido. Deve ser um número maior que zero.`
        );
        return;
      }
      skillsToSave.push({
        skillName: taughtSkill.skillName.trim(),
        multiplier: finalMultiplier,
      });
    }

    setIsSubmitting(true);
    try {
      let photoUrl: string | null = imageUri;

      if (imageUri && imageUri.startsWith("file://")) {
        photoUrl = await uploadImage(imageUri);
      }

      const skillsToLearnArray = skillsToLearn
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedData: Partial<UserProfile> = {
        displayName,
        bio,
        skillsToTeach: skillsToSave, // Save the correctly typed array
        skillsToLearn: skillsToLearnArray,
        photoUrl,
      };

      await updateUserProfile(user.uid, updatedData);

      Alert.alert("Sucesso", "Perfil atualizado!");
      router.back();
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
      Alert.alert("Erro", "Não foi possível atualizar o seu perfil.");
    } finally {
      setIsSubmitting(false);
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}>
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

      <ProfileSaveButton isSubmitting={isSubmitting} onPress={handleUpdate} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background || "#f5f5f5",
  },
  
  
  
  
});

export default EditProfileScreen;
