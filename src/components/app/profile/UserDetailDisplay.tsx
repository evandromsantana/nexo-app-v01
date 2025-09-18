import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants";
import { UserProfile } from "../../../types/user";

interface UserDetailDisplayProps {
  userProfile: UserProfile;
}

const UserDetailDisplay: React.FC<UserDetailDisplayProps> = ({
  userProfile,
}) => {
  return (
    <>
      <Text style={styles.name}>{userProfile.displayName}</Text>
      <Text style={styles.bio}>{userProfile.bio || "No bio."}</Text>

      <View style={styles.skillsContainer}>
        <Text style={styles.skillsTitle}>Habilidades para Ensinar:</Text>
        {userProfile.skillsToTeach && userProfile.skillsToTeach.map((skill) => (
          <Text key={skill.skillName} style={styles.skill}>
            - {skill.skillName} (x{skill.multiplier || 1})
          </Text>
        ))}
      </View>

      <View style={styles.skillsContainer}>
        <Text style={styles.skillsTitle}>Habilidades para Aprender:</Text>
        {userProfile.skillsToLearn && userProfile.skillsToLearn.map((skill) => (
          <Text key={skill} style={styles.skill}>
            - {skill}
          </Text>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: COLORS.grayDark,
    marginBottom: 20,
    fontStyle: "italic",
  },
  skillsContainer: { marginBottom: 20 },
  skillsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 5,
  },
  skill: { fontSize: 16, color: COLORS.grayDark, marginLeft: 10 },
});

export default UserDetailDisplay;