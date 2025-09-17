import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "@/constants";

interface EditableTaughtSkill {
  skillName: string;
  multiplier: string;
}

interface SkillsToTeachEditorProps {
  skillsToTeach: EditableTaughtSkill[];
  onAddSkill: () => void;
  onRemoveSkill: (index: number) => void;
  onSkillChange: (
    index: number,
    field: "skillName" | "multiplier",
    value: string
  ) => void;
}

const SkillsToTeachEditor: React.FC<SkillsToTeachEditorProps> = ({
  skillsToTeach,
  onAddSkill,
  onRemoveSkill,
  onSkillChange,
}) => {
  return (
    <>
      <Text style={styles.label}>Habilidades que ensino</Text>
      {skillsToTeach.map((item, index) => (
        <View key={index} style={styles.skillRow}>
          <TextInput
            style={[styles.input, styles.skillInput]}
            placeholder="Ex: Aula de violão"
            value={item.skillName}
            onChangeText={(text) => onSkillChange(index, "skillName", text)}
          />
          <TextInput
            style={[styles.input, styles.rateInput]}
            placeholder="1.0"
            value={item.multiplier} // Value is now a string
            onChangeText={(text) =>
              onSkillChange(index, "multiplier", text)
            }
            keyboardType="numeric"
          />
          <TouchableOpacity
            onPress={() => onRemoveSkill(index)}
            style={styles.removeButton}>
            <Text style={styles.removeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={onAddSkill} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Adicionar Habilidade</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary || "#333",
    marginBottom: 5,
    marginTop: 15,
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
});

export default SkillsToTeachEditor;