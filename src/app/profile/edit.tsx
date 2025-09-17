import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { TaughtSkill } from '../../types/user';
import { updateUserProfile } from '../../api/firestore';
import { uploadImage } from '../../api/cloudinary'; // Assuming you have a similar function
import { COLORS } from '../../constants/Colors'; // Assuming color constants exist

const EditProfileScreen = () => {
  const router = useRouter();
  const { user, userProfile, reloadUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [skillsToTeach, setSkillsToTeach] = useState<TaughtSkill[]>(
    userProfile?.skillsToTeach && userProfile.skillsToTeach.length > 0
      ? userProfile.skillsToTeach
      : []
  );
  const [skillsToLearn, setSkillsToLearn] = useState(
    userProfile?.skillsToLearn?.join(', ') || ''
  );
  const [imageUri, setImageUri] = useState(userProfile?.photoUrl || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSkill = () => {
    setSkillsToTeach([...skillsToTeach, { skillName: '', multiplier: 1.0 }]);
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...skillsToTeach];
    updatedSkills.splice(index, 1);
    setSkillsToTeach(updatedSkills);
  };

  const handleSkillChange = (
    index: number,
    field: 'skillName' | 'multiplier',
    value: string
  ) => {
    const updatedSkills = [...skillsToTeach];
    if (field === 'multiplier') {
      const parsedValue = parseFloat(value.replace(',', '.'));
      updatedSkills[index][field] = isNaN(parsedValue) ? 1.0 : parsedValue;
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
      Alert.alert('Erro', 'O nome é obrigatório.');
      return;
    }

    for (const taughtSkill of skillsToTeach) {
      if (!taughtSkill.skillName.trim()) {
        Alert.alert('Erro', 'O nome de uma das habilidades está vazio.');
        return;
      }
      if (taughtSkill.multiplier <= 0) {
        Alert.alert(
          'Erro',
          `O multiplicador para "${taughtSkill.skillName}" é inválido. Deve ser um número maior que zero.`
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      let photoUrl: string | null = userProfile?.photoUrl || null;

      if (imageUri && imageUri !== userProfile?.photoUrl) {
        photoUrl = await uploadImage(imageUri);
      }

      const skillsToTeachArray = skillsToTeach
        .filter((s) => s.skillName.trim() !== '')
        .map((s) => ({
          skillName: s.skillName.trim(),
          multiplier: s.multiplier || 1.0,
        }));

      const skillsToLearnArray = skillsToLearn
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedData = {
        displayName,
        bio,
        skillsToTeach: skillsToTeachArray,
        skillsToLearn: skillsToLearnArray,
        photoUrl,
      };

      await updateUserProfile(user.uid, updatedData);
      await reloadUserProfile();

      Alert.alert('Sucesso', 'Perfil atualizado!');
      router.back();
    } catch (error) {
      console.error('Erro ao atualizar o perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o seu perfil.');
    } finally {
      setIsLoading(false);
    }
  };

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
            onChangeText={(text) => handleSkillChange(index, 'skillName', text)}
          />
          <TextInput
            style={[styles.input, styles.rateInput]}
            placeholder="1.0"
            value={String(item.multiplier)}
            onChangeText={(text) =>
              handleSkillChange(index, 'multiplier', text)
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
        style={[styles.button, isLoading ? styles.buttonDisabled : {}]}
        onPress={handleUpdate}
        disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    color: '#757575',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillInput: {
    flex: 1,
    marginRight: 10,
  },
  rateInput: {
    width: 70,
    textAlign: 'center',
  },
  removeButton: {
    padding: 10,
    marginLeft: 5,
  },
  removeButtonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  addButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: '#a9a9a9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
