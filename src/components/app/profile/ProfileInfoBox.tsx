import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants";

interface ProfileInfoBoxProps {
  title: string;
  content: string | React.ReactNode;
}

const ProfileInfoBox: React.FC<ProfileInfoBoxProps> = ({ title, content }) => {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoContent}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: COLORS.card,
    width: "100%",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold" as any,
    color: COLORS.grayDark,
  },
  infoContent: { fontSize: 16, color: COLORS.primary, marginTop: 5 },
});

export default ProfileInfoBox;