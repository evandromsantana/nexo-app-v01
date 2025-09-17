import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { COLORS } from "@/constants"; // Assumindo que COLORS está disponível via alias

interface ProfileHeaderProps {
  photoUrl: string | undefined;
  displayName: string | undefined;
  email: string | undefined;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  photoUrl,
  displayName,
  email,
}) => {
  return (
    <View style={styles.profileavatar}>
      <Image
        source={
          photoUrl
            ? { uri: photoUrl }
            : require("@/assets/default-avatar.png") // Fallback image
        }
        style={styles.avatar}
      />
      <Text style={styles.name}>{displayName || "Usuário"}</Text>
      <Text style={styles.email}>{email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  profileavatar: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginTop: 20,
    width: "100%",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold" as any,
    color: COLORS.primary,
  },
  email: {
    fontSize: 16,
    color: COLORS.grayDark,
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    backgroundColor: COLORS.grayLight,
  },
});

export default ProfileHeader;