import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { COLORS } from "@/constants";
import { UserProfile } from "../../../types/user";

interface ProposeFormProps {
  recipientProfile: UserProfile | null;
  selectedSkillName: string | null;
  setSelectedSkillName: (skillName: string | null) => void;
  onSendProposal: () => void;
  isSubmitting: boolean; // Added this prop
}

const ProposeForm: React.FC<ProposeFormProps> = ({
  recipientProfile,
  selectedSkillName,
  setSelectedSkillName,
  onSendProposal,
  isSubmitting,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Propor Troca com</Text>
      <Text style={styles.name}>{recipientProfile?.displayName}</Text>

      <Text style={styles.label}>
        Qual habilidade você gostaria de aprender?
      </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSkillName}
          onValueChange={(itemValue) => setSelectedSkillName(itemValue)}>
          {recipientProfile?.skillsToTeach && recipientProfile.skillsToTeach.map((skill) => (
            <Picker.Item
              key={skill.skillName}
              label={`${skill.skillName} (Custo: ${60 * (skill.multiplier || 1)} min)`}
              value={skill.skillName}
            />
          ))}
        </Picker>
      </View>

      <Button
        title="Enviar Proposta"
        onPress={onSendProposal}
        disabled={!selectedSkillName || isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.grayDark,
    textAlign: "center",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 30,
  },
  label: { fontSize: 18, color: COLORS.grayDark, marginBottom: 10 },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export default ProposeForm;