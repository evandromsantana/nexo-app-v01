import React from "react";
import { Text, TextInput, StyleSheet, KeyboardTypeOptions } from "react-native";
import { COLORS } from "@/constants";

interface ProfileInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  textArea?: boolean;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
}

const ProfileInputField: React.FC<ProfileInputFieldProps> = ({
  label,
  value,
  onChangeText,
  multiline = false,
  textArea = false,
  keyboardType = "default",
  placeholder,
}) => {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, textArea && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholder={placeholder}
      />
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
});

export default ProfileInputField;