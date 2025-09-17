import React from "react";
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS } from "@/constants";

interface ProfileActionsProps {
  onLogout: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ onLogout }) => {
  return (
    <>
      <Link href="/profile/edit-profile" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={onLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
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
});

export default ProfileActions;