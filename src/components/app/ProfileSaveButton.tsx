import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "@/constants";

interface ProfileSaveButtonProps {
  isSubmitting: boolean;
  onPress: () => void;
}

const ProfileSaveButton: React.FC<ProfileSaveButtonProps> = ({
  isSubmitting,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, isSubmitting ? styles.buttonDisabled : {}]}
      onPress={onPress}
      disabled={isSubmitting}>
      <Text style={styles.buttonText}>
        {isSubmitting ? "Salvando..." : "Salvar Alterações"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

export default ProfileSaveButton;