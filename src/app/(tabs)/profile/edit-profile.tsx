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
      <TouchableOpacity onPress={handlePickImage} style={styles.imagePicker}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.profileImage} />
        ) : (
          <Text style={styles.imagePickerText}>Escolher foto</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
      />

      <Text style={styles.label}>Sobre mim</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <Text style={styles.label}>Habilidades que ensino</Text>
      {skillsToTeach.map((item, index) => (
        <View key={index} style={styles.skillRow}>
          <TextInput
            style={[styles.input, styles.skillInput]}
            placeholder="Ex: Aula de violão"
            value={item.skillName}
            onChangeText={(text) => handleSkillChange(index, "skillName", text)}
          />
          <TextInput
            style={[styles.input, styles.rateInput]}
            placeholder="1.0"
            value={item.multiplier} // Value is now a string
            onChangeText={(text) =>
              handleSkillChange(index, "multiplier", text)
            }
            keyboardType="numeric"
          />
          <TouchableOpacity
            onPress={() => handleRemoveSkill(index)}
            style={styles.removeButton}>
            <Text style={styles.removeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={handleAddSkill} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Adicionar Habilidade</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Habilidades que quero aprender</Text>
      <TextInput
        style={styles.input}
        placeholder="Separadas por vírgula"
        value={skillsToLearn}
        onChangeText={setSkillsToLearn}
      />

      <TouchableOpacity
        style={[styles.button, isSubmitting ? styles.buttonDisabled : {}]}
        onPress={handleUpdate}
        disabled={isSubmitting}>
        <Text style={styles.buttonText}>
          {isSubmitting ? "Salvando..." : "Salvar Alterações"}
        </Text>
      </TouchableOpacity>
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
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.grayLight || "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  imagePickerText: {
    color: COLORS.grayDark || "#757575",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary || "#333",
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  skillInput: {
    flex: 1,
    marginRight: 10,
  },
  rateInput: {
    width: 70,
    textAlign: "center",
  },
  removeButton: {
    padding: 10,
    marginLeft: 5,
  },
  removeButtonText: {
    color: COLORS.accent || "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: COLORS.grayLight || "#e0e0e0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  addButtonText: {
    color: COLORS.primary || "#333",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: COLORS.primary || "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: COLORS.grayDark || "#a9a9a9",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditProfileScreen;
